import React, {useEffect, useState} from "react";
import {useSocket} from "../context/SocketContext";
import {useNavigate} from "react-router-dom";
import {GameStatus} from "../interfaces/GameStatus.ts";
import {setPlayers} from "../redux/playersSlice.ts";
import {useDispatch} from "react-redux";

export function JoinForm() {
    const socket = useSocket();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({room: '', userName: ''});
    const navigate = useNavigate();



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    const joinRoom = (name: string, room: string) => {

        socket.emit('join-room', JSON.stringify({name, room}));
    }

    const join = () => {
        if (formData.room && formData.userName) {
            joinRoom(formData.userName, formData.room);
            navigate('/loby');
        }
    }

    const isFormValid = formData.room && formData.userName;

    return (
        <>
            <form className="space-y-6">
                <div className="relative">
                    <input
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white transition focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        placeholder="Player name..."
                    />
                </div>
                <div className="relative">
                    {/* <label>Name:</label> */}
                    <input
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white transition focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
                        type="text"
                        name="room"
                        value={formData.room}
                        onChange={handleChange}
                        placeholder="Room..."
                    />
                </div>
            </form>
            <button className={`border border-green-500/50 text-green-500 py-3 mt-4 px-6 rounded 
                font-medium transition-all duration-300
                 hover:-translate-y-0.5 
                 hover:shadow-[0_0_35px_rgba(16,185,129,0.8)]
                  hover:bg-green-500/10  ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={join}
                    disabled={!isFormValid}>START
            </button>
        </>
    );
}