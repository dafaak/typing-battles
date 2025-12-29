import './App.css'
import { Loby } from './pages/Loby';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { useEffect } from "react";
import { GameStatus } from "./interfaces/GameStatus.ts";
import { setPlayers } from "./redux/playersSlice.ts";
import { useSocket } from "./context/SocketContext.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Player } from "./interfaces/Player.ts";
import { setPlayerData } from "./redux/playerDataSlice.ts";
import { setPartie, setText } from "./redux/partieSlice.ts";
import { Game } from "./pages/Game.tsx";
import { RootState } from "./redux/store.ts";

function App() {
  const navigate = useNavigate();
  const socket = useSocket();
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.playerData.player);

  useEffect(() => {
    function onGameUpdate(data: string) {
      const gameStatus: GameStatus = JSON.parse(data);
      dispatch(setPartie({state: gameStatus.state, name: gameStatus.name}));
      dispatch(setPlayers(gameStatus.players));



      if (gameStatus.state === 'ready') {
        dispatch(setText(gameStatus.targetString?.trim()))
      }

      if (gameStatus.state === 'running') {
        navigate('/game');
      }
    }

    function onJoinSuccess(data: string) {
      const playerData: Player = JSON.parse(data);
      console.log(playerData);
      dispatch(setPlayerData(playerData));
      navigate('/loby');
    }

    socket.on('join-room-success', onJoinSuccess);
    socket.on('game-update', onGameUpdate);

    return () => {
      socket.off('players-update', onGameUpdate);
      socket.off('join-room-success', onJoinSuccess);
    };

  }, [socket, dispatch]);

  return (
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/loby" element={<Loby/>}/>
        <Route path="/game" element={<Game/>}/>
      </Routes>
  )
}

export default App
