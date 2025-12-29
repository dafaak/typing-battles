import express from 'express';
import { createServer } from 'http';
import { Server as WS_Server, Socket } from 'socket.io';
import { faker } from '@faker-js/faker';
import { join } from 'path';

type Player = {
  conn_id: string,
  name: string,
  score: number,
  place?: number,
  is_ready: boolean,
  room?: string,
};

interface JoinRoom {
  name: string
  room: string
}

interface Party {
  name: string,
  players: Player[]
  state: "loby" | "ready" | "running" | "ending" | "preparing"
  targetString?: string
  timer?: number
  finished?: boolean
}


const parties: { [key: string]: Party } = {};

class Server {
  partie_state: "loby" | "ready" | "running" | "ending" | "preparing" = "loby";
  players: Player[] = [];
  target_string = "";
  finished = false;
  io: WS_Server;

  constructor() {
    const app = express();
    const server = createServer(app);
    this.io = new WS_Server(server, {cors: {origin: "*"}});

    this.io.on('connection', (ws: Socket) => this.onConnect(ws));

    server.listen(8080, () => {
      console.log('Server is listening on port 8080');
    });
  }

  onConnect(ws: Socket) {
    const player: Player = {
      conn_id: ws.id || '',
      name: "Anonymous",
      score: 0,
      is_ready: false,
    };
    this.players.push(player);
    ws.send(JSON.stringify({type: 'res_conn', values: {party_state: 'lobby', player}}));
    ws.on('message', (message) => this.onMessage(message.toString(), ws));
    ws.on('close', () => this.onClose(ws));
    ws.on('join-room', (data) => this.onJoinRoom(ws, data));
    ws.on('disconnect', () => this.onDisconnect(ws));
  }

  onDisconnect(ws: Socket) {


    const playerDisconected = this.findPlayerByCoonId(ws.id);
    // console.log('player disconnected: ', playerDisconected);

    this.players = this.players.filter((p) => p.conn_id !== ws.id);

    if (playerDisconected?.room) {
      const updatedParty = this.leaveParty(playerDisconected.room, ws.id)
      this.io.to(playerDisconected.room).emit('game-update', JSON.stringify(updatedParty));
      if (updatedParty.players.length === 0) {
        delete parties[playerDisconected.room];
      }
    }

    this.updatePlayers(ws);

  }

  leaveParty(room: string, conn_id: string) {
    parties[room].players = parties[room].players.filter((p) => p.conn_id !== conn_id);
    return parties[room];
  }

  onJoinRoom(ws: Socket, data: string) {
    const joinRoom = JSON.parse(data);
    console.log(joinRoom);
    ws.join(joinRoom.room);
    const player = this.updatePlayer(ws.id, joinRoom);
    const party = this.joinPartie(joinRoom, ws.id);
    ws.emit('join-room-success', JSON.stringify(player));
    if (party) this.io.to(joinRoom.room).emit('game-update', JSON.stringify(party))


  }


  findPlayerIndex(conn_id: string): number | undefined {
    const indexFound = this.players.findIndex(player => player.conn_id === conn_id);
    // console.log('conn_id: ', indexFound)
    return indexFound >= 0 ? indexFound : undefined;

  }

  findPlayerByCoonId(conn_id: string): Player | undefined {
    const playerIndex = this.findPlayerIndex(conn_id);
    if (playerIndex !== undefined)
      return this.players[playerIndex]

    return undefined
  }

  findPlayerInParty(room: string, conn_id: string): Player | undefined {

    const party = this.findPartie(room);

    if (!party) return undefined;

    const indexFound = party.players.findIndex(player => player.conn_id === conn_id);

    return indexFound >= 0 ? party.players[indexFound] : undefined;
  }

  findPartie(room: string): Party | undefined {
    return parties[`${room}`] ? parties[`${room}`] : undefined;
  }


  joinPartie(joinRoom: JoinRoom, conn_id: string): Party | undefined {


    const player = this.findPlayerByCoonId(conn_id);

    if (player) {

      if (parties[`${joinRoom.room}`]) {
        if (parties[`${joinRoom.room}`]?.players) {
          parties[`${joinRoom.room}`].players.push({...player})
        } else {
          parties[`${joinRoom.room}`] = {
            players: [{...player}],
            state: "loby",
            name: joinRoom.room
          }
        }

      } else {
        parties[`${joinRoom.room}`] = {
          players: [{...player}],
          state: "loby",
          name: joinRoom.room
        }
      }
      return parties[`${joinRoom.room}`]
    } else {
      return undefined
    }


  }

  updatePlayer(conn_id: string, data: JoinRoom) {
    const indexFound = this.players.findIndex(player => player.conn_id === conn_id);
    console.log(indexFound)
    if (indexFound >= 0) {
      this.players[indexFound] = {...this.players[indexFound], ...data};
    }
    return this.players[indexFound];
  }

  updatePlayers(ws: Socket) {


  }

  onMessage(rawMessage: string, sender: Socket) {
    const deserializedMessage = JSON.parse(rawMessage);
    const {message} = deserializedMessage;

    if (deserializedMessage.event === "message") {
      console.log(`connection ${sender.id} sent message: ${deserializedMessage.message}`);
      this.broadcast(deserializedMessage.message, sender);
    }

    if (deserializedMessage.event === "update_user_name") {

      console.log(`connection ${sender.id} sent message: ${JSON.stringify(deserializedMessage.message)}`);
      this.players.map((p) => {
        if (p.conn_id === sender.id) p.name = deserializedMessage.name;
      });
    }

    if (deserializedMessage.event === "update_user_score") {
      console.log(parties);

      const playerFound = this.findPlayerInParty(message.room, message.conn_id)
      console.log('update score', message);
      if (!playerFound) return;

      if (playerFound) playerFound.score = message.score;
      if (playerFound.score === 100) this.setPlace(message.room, message.conn_id);

    }

    if (deserializedMessage.event === "update_user_state") {

      const playerFound = this.findPlayerInParty(message.room, message.conn_id)

      if (!playerFound) return;

      if (playerFound) playerFound.is_ready = message.is_ready;

      const areAllPlayersReady = this.checkIfAllPlayersReady(parties[`${message.room}`].players);

      if (areAllPlayersReady) {
        parties[`${message.room}`].state = "ready";
      } else {
        parties[`${message.room}`].state = "loby";
      }
    }

    if (deserializedMessage.event === 'start-game') {
      console.log(JSON.stringify(deserializedMessage))
      parties[`${message.room}`].state = "running";
    }

    this.mirror({socket: sender, room: message.room, partie: parties[`${message.room}`]});
  }

  setPlace(room: string, conn_id:string) {
    const places = parties[room].players.filter(player => player.place);
    const place = places.length + 1;
    parties[room].players.map(player => {
      if (player.conn_id === conn_id) player.place = place;
    });
  }

  checkIfAllPlayersReady(players: Player[]): boolean {
    return players.every(player => player.is_ready);
  }

  onClose(connection: Socket) {
    this.players = this.players.filter((p) => p.conn_id !== connection.id);
    console.log(JSON.stringify(parties));

    // this.mirror(connection,);
  }

  mirror(params: { socket: Socket, room: string, partie: Party }) {
    const {socket, room, partie} = params;


    switch (partie.state) {

      case "loby":
        // data.values = {
        //   partie_state: this.partie_state,
        //   players: this.players,
        // };
        break;

      case "ready":
        this.target_string = faker.word.words({count: 2});
        partie.targetString = this.target_string;
        partie.timer = 30000;
        break;

      case "ending":
        // data.values = {
        //   partie_state: this.partie_state,
        //   players: this.players,
        // };
        break;
    }
    console.log(partie);
    this.io.to(room).emit('game-update', JSON.stringify(partie))

  }

  broadcast(data: string, ws: Socket) {
    ws.send()
  }
}

new Server();
