import { useState } from "react";

interface LobyFormProps {
  formData: {
    room: string,
    userName: string
  },
  setFormData: (formData: {
    room: string,
    userName: string
  }) => void
}

function LobyForm({formData, setFormData}: LobyFormProps) {

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  return (
      <form>
        <div>
          <label>Room:</label>
          <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
          />
        </div>
        <div>
          <label>Name:</label>
          <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
          />
        </div>
      </form>
  );
}

export default LobyForm;