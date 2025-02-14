
import LobyForm from "../components/LobyForm";
import { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useEffect } from "react";

export function Loby() {
  const socket = useSocket();

  useEffect(() => {
    // function onConnect() {
    //   setIsConnected(true);
    // }

    // function onDisconnect() {
    //   setIsConnected(false);
    // }
    function resCon(data: any) {
      console.log('res con: ', data);

    }
    // function onFooEvent(value) {
    //   setFooEvents(previous => [...previous, value]);
    // }

    // socket.on('connect', onConnect);
    // socket.on('disconnect', onDisconnect);

    socket.on('res-con', resCon);
    // socket.on('foo', onFooEvent);

    return () => {
      // socket.off('connect', onConnect);
      // socket.off('disconnect', onDisconnect);
      socket.off('res-con', resCon);
      // socket.off('foo', onFooEvent);
    };
  }, []);

  const [formData, setFormData] = useState({ room: '', userName: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const joinRoom = (name: string, room: string) => {

    socket.emit('join-room', JSON.stringify({ name: 'Isra', room: '1234' }));
  }

  const join = () => {
    if (formData.room && formData.userName) {
      joinRoom(formData.room, formData.userName)
    }
  }

  return (
    <>
      <h1>Loby</h1>
      <LobyForm setFormData={(formData) => setFormData(formData)} formData={formData}></LobyForm>
      <button onClick={join}>Join</button>
    </>
  );
}