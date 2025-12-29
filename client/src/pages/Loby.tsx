import { useSocket } from '../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { updatePlayerIsReady } from "../redux/playerDataSlice.ts";


export function Loby() {

  const socket = useSocket();
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.players.players);
  const partieState = useSelector((state: RootState) => state.partieState.state);
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

  const startGame = () => {
    console.log('room:', player.room);
    socket.emit('message', JSON.stringify({event: 'start-game', message: {room: player.room}}));
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
        <div className='flex flex-col text-left rounded border  mt-10 border-green-500/50 '>
          <table className='table-fixed bg-cyan-100/10 '>
            <thead className=' text-2xl text-green-500'>
            <tr className='bg-green-500/20  text-white'>
              <td className='text-center'>Player</td>
              {/*<td className='text-center'>Score</td>*/}
              <td className='text-center'>Ready?</td>
            </tr>
            </thead>
            <tbody>
            {players.map((player) => (


                <tr className='text-2xl ' key={player.conn_id}>
                  <td className='text-center'>
                    {player.name}
                  </td>
                  {/*<td className='text-center'>*/}
                  {/*  {player.score}*/}
                  {/*</td>*/}
                  <td className='text-center'>
                    {
                      player.is_ready ? '✔️' : '❌'
                    }
                  </td>
                </tr>


            ))}
            </tbody>

          </table>
        </div>


        {partieState === 'ready' && <button className='border border-blue-500/50 text-blue-500 mt-5 py-3 px-6 rounded
                 hover:-translate-y-0.5
                 hover:shadow-[0_0_35px_rgba(59,130,246,1)]
                  hover:bg-blue-500/10' onClick={startGame}>{player.is_ready ? 'Start Game' : 'Ready'}
        </button>}
      </>
  );
}