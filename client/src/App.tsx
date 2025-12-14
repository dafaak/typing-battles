import './App.css'
import { Loby } from './pages/Loby';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { useEffect } from "react";
import { GameStatus } from "./interfaces/GameStatus.ts";
import { setPlayers } from "./redux/playersSlice.ts";
import { useSocket } from "./context/SocketContext.tsx";
import { useDispatch } from "react-redux";
import { Player } from "./interfaces/Player.ts";
import { setPlayerData } from "./redux/playerDataSlice.ts";

function App() {
  const navigate = useNavigate();
  const socket = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    function onPlayersUpdate(data: string) {
      const gameStatus: GameStatus = JSON.parse(data);
      console.log(gameStatus);
      dispatch(setPlayers(gameStatus.players));
    }

    function onJoinSuccess(data: string) {
      const playerData: Player = JSON.parse(data);
      console.log(playerData);
      dispatch(setPlayerData(playerData));
      navigate('/loby');
    }

    socket.on('join-room-success', onJoinSuccess);
    socket.on('players-update', onPlayersUpdate);

    return () => {
      socket.off('players-update', onPlayersUpdate);
      socket.off('join-room-success', onJoinSuccess);
    };

  }, [socket, dispatch]);

  return (
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/loby" element={<Loby/>}/>
      </Routes>
  )
}

export default App
