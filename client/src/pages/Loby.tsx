import {useEffect} from 'react';
import {useSocket} from '../context/SocketContext';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';


export function Loby() {

    const socket = useSocket();
    const dispatch = useDispatch();
    const players = useSelector((state: RootState) => state.players.players);
    const player = useSelector((state: RootState) => state.playerData.player);


    return (
        <>
            <h1>Loby</h1>
            <h3>Hi, {player && player.name} {player && player.conn_id}</h3>
            <div>
                {players.map((player) => (
                    <div key={player.conn_id}>
                        {player.name} - {player.score}
                    </div>
                ))}
            </div>
        </>
    );
}