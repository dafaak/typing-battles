import {useEffect} from 'react';
import {useSocket} from '../context/SocketContext';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';


export function Loby() {

    const socket = useSocket();
    const dispatch = useDispatch();
    const players = useSelector((state: RootState) => state.players.players);


    return (
        <>
            <h1>Loby</h1>
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