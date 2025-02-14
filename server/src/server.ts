import express from 'express';
import { createServer } from 'http';
import { Server as WS_Server, Socket } from 'socket.io';
import { faker } from '@faker-js/faker';

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

class Server {
  party_state: "lobby" | "running" | "ending" | "preparing" = "lobby";
  players: Player[] = [];
  target_string = "";
  finished = false;

  constructor() {
    const app = express();
    const server = createServer(app);
    const io = new WS_Server(server, { cors: { origin: "*" } });

    io.on('connection', (ws: Socket) => this.onConnect(ws));

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
    console.log(this.players);
    ws.send(JSON.stringify({ type: 'res_conn', values: { party_state: 'lobby', player } }));
    ws.on('message', (message) => this.onMessage(message.toString(), ws));
    ws.on('close', () => this.onClose(ws));
    ws.on('join-room', (data) => this.onJoinRoom(ws,data));
  }


  onJoinRoom(ws: Socket, data: string) {
    const joinRoom = JSON.parse(data);
    ws.join(joinRoom.room);
    this.updatePlayer(ws.id, joinRoom);
    console.log(this.players);
  }

  updatePlayer(conn_id: string, data: JoinRoom) {
    const indexFound = this.players.findIndex(player => player.conn_id === conn_id);
    if (indexFound >= 0) {
      this.players[indexFound] = { ...this.players[indexFound], ...data };
    }
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
        this.party_state = "lobby";
      }
    }
    console.log(this.players);
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
      case "lobby":
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
