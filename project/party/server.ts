import type * as Party from "partykit/server";
import { faker } from "@faker-js/faker";

type Player = {
  conn_id: string,
  name: string,
  score: number,
  is_ready: boolean,
};

export default class Server implements Party.Server {
  party_state: "lobby" | "running" | "ending" | "preparing" = "lobby";
  players: Player[] = [];
  target_string = "";
  finished = false;

  constructor(readonly room: Party.Room) {
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(`Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );
    const player = {
      conn_id: conn.id,
      name: "Anonymous",
      score: 0,
      is_ready: false,
    };
    this.players.push(player);


    // send the current count to the new client
    conn.send(JSON.stringify({type: 'res_conn', values: {party_state: 'lobby', player}}));
  }

  onMessage(message: string, sender: Party.Connection) {

    const deserializedMessage = JSON.parse(message);

    if (deserializedMessage.event === "message") {
      console.log(`connection ${sender.id} sent message: ${deserializedMessage.message}`);
      this.room.broadcast(deserializedMessage.message, []);
    }

    if (deserializedMessage.event === "update_user_name") {
      console.log(`connection ${sender.id} sent message: ${deserializedMessage.message}`);
      this.players.map((p) => {
        if (p.conn_id === sender.id) p.name = deserializedMessage.name;
      });
    }

    if (deserializedMessage.event === "update_user_state") {
      console.log(`connection ${sender.id} sent message: ${deserializedMessage.message}`);
      this.players.map((p) => {
        if (p.conn_id === sender.id) p.is_ready = deserializedMessage.is_ready;
      });
      const areAllPlayersReady = this.checkIfAllPlayersReady();

      if (areAllPlayersReady) {
        this.party_state = "preparing";

      } else {
        this.party_state = "lobby";
      }


    }
    console.log(this.players);
    this.mirror();
  }


  checkIfAllPlayersReady() {
    const areAllPlayersready = this.players.every(player => player.is_ready === true);

    return areAllPlayersready;
  }

  onRequest(req: Party.Request) {
    // if (req.method === "POST") {
    //   this.increment();
    // }

    // return new Response(this.count.toString());
  }

  onClose(connection: Party.Connection<unknown>): void | Promise<void> {
    this.players = this.players.filter((p) => p.conn_id !== connection.id);
    this.mirror();
  }

  mirror(connection?: Party.Connection) {
    const data = {type: "mirror", values: {}};
    switch (this.party_state) {
      case "lobby": {
        data.values = {
          party_state: this.party_state,
          players: this.players,
        }
        break;
      }

      case "preparing": {
        data.values = {
          party_state: this.party_state,
          timer: 5000,
          players: this.players,
        }
        // setTimeout(() => {
        //   this.target_string = faker.word.words({count: 10});
        //   this.mirror();
        //
        // }, 5000);
        break;
      }

      case "running": {
        data.values = {
          party_state: this.party_state,
          players: this.players,
          target_string: this.target_string,
          finished: this.finished
        }
        break;
      }
      case "ending": {
        data.values = {
          party_state: this.party_state,
          players: this.players
        }
        break;
      }
    }

    this.room.broadcast(JSON.stringify(data));
  }

}


Server satisfies Party.Worker;
