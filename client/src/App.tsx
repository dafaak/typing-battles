import './App.css'
import {Loby} from './pages/Loby';
import {Route, Routes} from 'react-router-dom';
import {Home} from './pages/Home';
import {useEffect} from "react";
import {GameStatus} from "./interfaces/GameStatus.ts";
import {setPlayers} from "./redux/playersSlice.ts";
import {useSocket} from "./context/SocketContext.tsx";
import {useDispatch} from "react-redux";

function App() {
    const socket = useSocket();
    const dispatch = useDispatch();

    useEffect(() => {
        function onPlayersUpdate(data: string) {
            const gameStatus: GameStatus = JSON.parse(data);
            console.log(gameStatus);
            dispatch(setPlayers(gameStatus.players));
        }

        socket.on('players-update', onPlayersUpdate);

        return () => {
            socket.off('players-update', onPlayersUpdate);
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
