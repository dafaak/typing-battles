

import { useState } from "react";
import { useSocket } from "../context/SocketContext";




export function Loby() {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState([]);

  return (
    <>

    </>
  );
}