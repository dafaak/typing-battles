import express from 'express';
import { createServer } from 'http';
import { Server as WS_Server, Socket } from 'socket.io';
import { faker } from '@faker-js/faker';
import { join } from 'path';

type Player = {
  conn_id: string,
  name: string,
  score: number,
  is_ready: boolean,
  room?: string,
};

interface JoinRoom {
  name: string
  room: string
}

interface Party {
  players: Player[]
  state: "loby" | "running" | "ending" | "preparing"
  targetString?: string
  finished?: boolean
}
// todo eliminar partie cuando no hay miembros 
// la key de la partie es la room 




const parties: { [key: string]: Party } = {};

class Server {
  party_state: "loby" | "running" | "ending" | "preparing" = "loby";
  players: Player[] = [];
  target_string = "";
  finished = false;
  io: WS_Server;

  constructor() {
    const app = express();
    const server = createServer(app);
    this.io = new WS_Server(server, { cors: { origin: "*" } });

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
    ws.send(JSON.stringify({ type: 'res_conn', values: { party_state: 'lobby', player } }));
    ws.on('message', (message) => this.onMessage(message.toString(), ws));
    ws.on('close', () => this.onClose(ws));
    ws.on('join-room', (data) => this.onJoinRoom(ws, data));
    ws.on('disconnect', () => this.onDisconnect(ws));
  }

  onDisconnect(ws: Socket) {


    const playerDisconected = this.findPlayerByCoonId(ws.id);
    console.log('player disconnected: ', playerDisconected);

    this.players = this.players.filter((p) => p.conn_id !== ws.id);

    if (playerDisconected?.room) {
      const updatedParty = this.leaveParty(playerDisconected.room, ws.id)
      this.io.to(playerDisconected.room).emit('players-update', JSON.stringify(updatedParty));
    };

    this.updatePlayers(ws);

  }

  leaveParty(room: string, conn_id: string) {
    parties[room].players = parties[room].players.filter((p) => p.conn_id !== conn_id);
    return parties[room];
  }

  onJoinRoom(ws: Socket, data: string) {
    const joinRoom = JSON.parse(data);
    ws.join(joinRoom.room);
    this.updatePlayer(ws.id, joinRoom);
    const party = this.joinPartie(joinRoom, ws.id);
    // update players - loby 
    if (party) this.io.to(joinRoom.room).emit('players-update', JSON.stringify(party))


  }


  findPlayerIndex(conn_id: string): number | undefined {
    const indexFound = this.players.findIndex(player => player.conn_id === conn_id);
    console.log('conn_id: ', indexFound)
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
    return parties[`room`] ? parties[`room`] : undefined;
  }



  joinPartie(joinRoom: JoinRoom, conn_id: string): Party | undefined {


    const player = this.findPlayerByCoonId(conn_id);
    console.log('player:', player);
    if (player) {
      if (parties[joinRoom.room]) {
        parties[joinRoom.room].players.push({ ...player })
      } else {
        parties[`${joinRoom.room}`] = {
          players: [{ ...player }],
          state: "loby"
        }
      }
      return parties[`${joinRoom.room}`]
    } else {
      return undefined
    }

    console.log('parties: ', JSON.stringify(parties));
  }

  updatePlayer(conn_id: string, data: JoinRoom) {
    const indexFound = this.players.findIndex(player => player.conn_id === conn_id);
    // console.log(data);
    if (indexFound >= 0) {
      this.players[indexFound] = { ...this.players[indexFound], ...data };
    }
  }

  updatePlayers(ws: Socket) {


  }

  onMessage(message: string, sender: Socket) {
    const deserializedMessage = JSON.parse(message);

    if (deserializedMessage.event === "message") {
      console.log(`connection ${sender.id} sent message: ${deserializedMessage.message}`);
      this.broadcast(deserializedMessage.message, sender);
    }

    if (deserializedMessage.event === "update_user_name") {
      console.log(`connection ${sender.id} sent message: ${deserializedMessage.message}`);
      this.players.map((p) => {
        if (p.conn_id === sender.id) p.name = deserializedMessage.name;
      });
    }

    if (deserializedMessage.event === "update_user_state") {
      console.log(`connection ${sender.id} sent message: ${deserializedMessage}`);
      this.players.map((p) => {
        if (p.conn_id === sender.id) p.is_ready = deserializedMessage.is_ready;
      });
      const areAllPlayersReady = this.checkIfAllPlayersReady();

      console.log({ areAllPlayersReady });

      if (areAllPlayersReady) {
        this.party_state = "preparing";
      } else {
        this.party_state = "loby";
      }
    }

    this.mirror(sender);
  }

  checkIfAllPlayersReady() {
    return this.players.every(player => player.is_ready === true);
  }

  onClose(connection: Socket) {
    this.players = this.players.filter((p) => p.conn_id !== connection.id);
    this.mirror(connection);
  }

  mirror(ws: Socket) {
    const data = { type: "mirror", values: {} };
    switch (this.party_state) {
      case "loby":
        data.values = {
          party_state: this.party_state,
          players: this.players,
        };
        break;
      case "preparing":
        this.target_string = faker.word.words({ count: 10 });
        data.values = {
          party_state: this.party_state,
          timer: 5000,
          target_string: this.target_string,
          players: this.players,
        };
        break;
      case "running":
        data.values = {
          party_state: this.party_state,
          players: this.players,
          target_string: this.target_string,
          finished: this.finished,
        };
        break;
      case "ending":
        data.values = {
          party_state: this.party_state,
          players: this.players,
        };
        break;
    }
    this.broadcast(JSON.stringify(data), ws);
  }

  broadcast(data: string, ws: Socket) {
    ws.send()
  }
}

new Server();
