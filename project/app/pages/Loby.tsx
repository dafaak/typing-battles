import { useNavigate } from "react-router-dom";
import LobyForm from "../components/LobyForm";
import { useState } from "react";

interface LobyFormProps {
  setFormData: (formData: { room: string, userName: string }) => void,
  joinRoom: (room: string, userName: string) => void,
  formData: { room: string, userName: string }
}

export function Loby({joinRoom, formData, setFormData}: LobyFormProps) {


  // const handleChange = (e) => {
  //   const {name, value} = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };

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

