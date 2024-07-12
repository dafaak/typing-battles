import type PartySocket from "partysocket";
import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import type { IPlayer } from "../interfaces/player.interface";
import type { IMessage } from "../interfaces/message.interface";


interface RoomProps {
  formData: {
    room: string,
    userName: string
  },
  setSocket: (socket: PartySocket) => void,
  room: string,
  userName: string,
  setModalOpen: (open: boolean) => void
}

export function Room({setSocket, formData,setModalOpen}: RoomProps) {
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState<IPlayer>({
    "conn_id": '',
    "name": '',
    "score": 0,
    "is_ready": false
  });


  const socket = usePartySocket({
    room: formData.room,
    onOpen() {
      console.log("connected");
    },
    onMessage(evt) {
      const message = JSON.parse(evt.data) as IMessage;
      if (message.type === 'mirror') {
        setListOfPlayers(message.values.players!);
        if (message.values.party_state === 'preparing') {
          setModalOpen(true);
        }
      }
      if (message.type === 'res_conn') {
        console.log(message);
        setPlayer({...message.values.player!, name: formData.userName});
      }


      console.log(message);

    },


  });

  useEffect(() => {
    socket.send(JSON.stringify({event: 'update_user_name', name: formData.userName}));
  }, []);

  const handleIsPlayerReady = (player: IPlayer) => {
    console.log(player.is_ready, !player.is_ready);
    updateReady(!player.is_ready);
    setPlayer({...player, is_ready: !player.is_ready});
  }



  const updateReady = (isReady: boolean) => {
    socket.send(JSON.stringify({event: 'update_user_state', is_ready: isReady}))
  }

  const setListOfPlayers = (players: IPlayer[]) => {
    setPlayers(players);
  }

  return (
      <>

        <h1>Room {formData.room}</h1>
        <h3>Players: <ul>{players.map(itemPlayer => <li key={itemPlayer.conn_id}>{itemPlayer.name} <label>Ready?</label>
          <input disabled={itemPlayer.conn_id !== player.conn_id}
                 type="checkbox" checked={itemPlayer.is_ready}
                 onChange={() => handleIsPlayerReady(itemPlayer)}/></li>)} </ul></h3>


      </>

  );
}