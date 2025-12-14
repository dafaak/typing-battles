import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { updatePlayerIsReady } from "../redux/playerDataSlice.ts";


export function Loby() {

  const socket = useSocket();
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.players.players);
  const player = useSelector((state: RootState) => state.playerData.player);


  const handleReadyStatus = () => {
    const newReady = !player.is_ready;

    dispatch(updatePlayerIsReady({value: newReady}))

    socket.emit('message', JSON.stringify({
      event: 'update_user_state',
      message: {
        room: player.room,
        conn_id: player.conn_id,
        is_ready: newReady
      }
    }));
  }

  return (
      <>
        <h1 className='text-5xl'>Loby</h1>
        <h3 className='py-5 text-2xl'>Hi, {player && player.name} </h3>
        <button className='border border-green-500/50 text-green-500 py-3 px-6 rounded
                font-medium transition-all duration-300
                 hover:-translate-y-0.5
                 hover:shadow-[0_0_35px_rgba(16,185,129,0.8)]
                  hover:bg-green-500/10' onClick={handleReadyStatus}>{player.is_ready ? 'Not ready' : 'Ready'}
        </button>
        <div className='flex flex-col text-left py-5'>
          <table>
            <thead className='text-2xl text-green-500'>
            <tr>
              <td>Player</td>
              <td>Score</td>
              <td>Is ready?</td>
            </tr>
            </thead>
            <tbody>
            {players.map((player) => (


                <tr className='text-2xl ' key={player.conn_id}>
                  <td>
                    {player.name}
                  </td>
                  <td>
                    {player.score}
                  </td>
                  <td>
                    {
                      player.is_ready ? '✔️' : '❌'
                    }
                  </td>
                </tr>


            ))}
            </tbody>

          </table>
        </div>
      </>
  );
}