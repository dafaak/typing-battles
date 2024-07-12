import "./styles.css";
import { createRoot } from "react-dom/client";
import { Loby, Room } from "./pages"
import { useEffect, useState } from "react";
import PartySocket from "partysocket";
import { createPortal } from "react-dom";
import { Modal } from "./components/Modal/Modal";
import { Timer } from "./components/Timer";

function App() {
  const [showLoby, setShowLoby] = useState(true);
  const [showRoom, setShowRoom] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [formData, setFormData] = useState({room: '', userName: ''});
  const [socket, setSocket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const joinRoom = () => {

    setShowLoby(false);
    setShowRoom(true);
  }

  useEffect(() => {
    if (formData.room && formData.userName) {

    }

  }, [formData.room, formData.userName]);

  const handleButtonClick = (value) => {
    setModalOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
  }

  const handleTimeUp = () => {
    setModalOpen(false);
    setShowLoby(false);
    // setShowRoom(false);
    setShowGame(true);
  }

  return (
      <main>

        {showLoby && <Loby setFormData={setFormData} formData={formData} joinRoom={joinRoom}/>}
        {showRoom && <Room formData={formData} setModalOpen={(open) => setModalOpen(open)}
                           setSocket={(socket) => setSocket(socket)} showGame={showGame}/>}

        {modalOpen &&
            createPortal(
                <Modal
                    closeModal={closeModal}
                    onSubmit={handleButtonClick}
                    onCancel={closeModal}
                >
                  <h2>Game starting in: </h2>
                  <br/>
                  <Timer timeInSeconds={2} handleTimeUp={handleTimeUp}></Timer>
                </Modal>,
                document.body
            )}
      </main>
  );
}

createRoot(document.getElementById("app")!).render(<App/>);
