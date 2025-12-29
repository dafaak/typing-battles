import { useSocket } from '../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useState } from "react";
import { updatePlayerScore } from "../redux/playerDataSlice.ts";


export function Game() {

  const socket = useSocket();
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.players.players);
  const partieState = useSelector((state: RootState) => state.partieState);
  const player = useSelector((state: RootState) => state.playerData.player);

  const [correctCount, setCorrectCount] = useState(0);
  const [userInput, setUserInput] = useState('');
  const targetText = partieState.text;

  const calculateCorrectChars = (input, originalText) => {
    let correctCount = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === originalText[i]) {
        correctCount++;
      }
    }
    return correctCount;
  };

  const handleChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setUserInput(value);

    const hits = calculateCorrectChars(value, partieState.text);
    setCorrectCount(hits);
    console.log(player.name);
    console.log(Math.round((correctCount / partieState.text.length) * 100));
    socket.emit('message', JSON.stringify({
      event: 'update_user_score',
      message: {
        room: player.room,
        conn_id: player.conn_id,
        score: Math.round((correctCount / partieState.text.length) * 100)
      }
    }));

    dispatch(updatePlayerScore({value: Math.round((correctCount / partieState.text.length) * 100)}));
    console.log(player);
  };

  return (
      <>
        <h1 className='lg:text-5xl text-2xl'>🗡️Game: {player.room}🗡️</h1>
        <h3 className='py-5  text-2xl'>{player.name} type as fast as you can!</h3>

        <div className='flex justify-between  mt-10  px-4'>
          <table className='table-fixed bg-cyan-100/10 '>
            <thead className=' text-2xl text-green-500'>
            <tr className='bg-green-500/20  text-white'>
              <td className='p-2 text-center'>Player</td>
              <td className='p-2 text-center'>Progress</td>
              <td className='p-2 text-center'>Place</td>
            </tr>
            </thead>
            <tbody>
            {players.map((gamePlayer) => (


                <tr className='text-2xl ' key={gamePlayer.conn_id}>
                  <td className='text-center'>
                    {gamePlayer.name}
                  </td>
                  <td className='text-center'>
                    {gamePlayer.score}%
                  </td>
                  <td>
                    {gamePlayer?.place || ''}
                  </td>

                </tr>


            ))}
            </tbody>

          </table>

          <div>
            Timer

          </div>
        </div>


        <div className="max-w-screen mx-auto p-4">
          {/* Texto de referencia */}
          <div className='mt-10 px-4 py-6 border rounded-xl border-green-500/50 bg-slate-900'>
            {/* 'whitespace-pre-wrap' es vital para que los espacios cuenten visualmente */}
            <p className='text-2xl font-mono whitespace-pre-wrap'>
              {targetText.split('').map((char, index) => {
                let color = 'text-gray-500';
                let underline = '';

                if (index < userInput.length) {
                  const isCorrect = char === userInput[index];
                  color = isCorrect ? 'text-green-400' : 'text-red-500';
                  // Si el usuario falla en un espacio, le ponemos un subrayado para que vea el error
                  if (!isCorrect && char === ' ') underline = 'underline bg-red-500/20';
                }

                return (
                    <span key={index} className={`${color} ${underline}`}>
                {char}
              </span>
                );
              })}
            </p>
          </div>

          <input
              className='mt-5 w-full p-4 rounded-xl'
              disabled={player.score === 100}
              type="text"
              autoFocus
              value={userInput}
              onChange={handleChange}
              placeholder="Escribe aquí..."
          />
        </div>
      </>
  );
};