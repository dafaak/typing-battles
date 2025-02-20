import {createContext, useContext, ReactNode} from 'react';
import {io, Socket} from 'socket.io-client';

const URL = 'http://localhost:8080';
const socket: Socket = io(URL);

const SocketContext = createContext<Socket>(socket);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({children}: { children: ReactNode }) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};