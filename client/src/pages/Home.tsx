import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import{JoinForm} from "../components/JoinForm";

export const Home = () => {

    const [text, setText] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fullText = "TYPPING BATTLES";
    const navigate = useNavigate();

    useEffect(() => {
        let index = 1;
        const interval = setInterval(() => {
            setText(fullText.substring(0, index));
            index++;
            if (index > fullText.length) {
                setText(fullText +"🗡️");
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);

    }, []);

    const handleJoinClick = () => {
        setShowForm(true);
    };

    return <div className="fixed inset-0 bg-black  flex flex-col items-center justify-center text-gray-100 ">
        <div className="mb-4 text-4xl font-mono font-bold">
            {text} <span className="animate-blink ml-1">|</span>
        </div>
        {showForm && <div className="px-4 w-100" >
            <JoinForm></JoinForm>
        </div>}
        {!showForm && <div >
            <button className="border border-green-500/50 text-green-500 py-3 px-6 rounded 
                font-medium transition-all duration-300
                 hover:-translate-y-0.5 
                 hover:shadow-[0_0_35px_rgba(16,185,129,0.8)]
                  hover:bg-green-500/10" onClick={handleJoinClick}>JOIN</button>
        </div>}

    </div>
};