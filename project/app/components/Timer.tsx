import { useEffect, useState } from "react";

interface TimerProps {
  timeInSeconds: number
  handleTimeUp: () => void
}

export const Timer = ({timeInSeconds, handleTimeUp}: TimerProps) => {
  const [time, setTime] = useState(timeInSeconds);

  useEffect(() => {
    let timer = setInterval(() => {
      setTime((time) => {
        console.log(timer)
        if (time === 0) {
          setTimeout(()=>{handleTimeUp()},10);
          clearInterval(timer);
          return 0;
        } else return time - 1;
      });
    }, 1000);
  }, []);

  return <>
    {time}
  </>
}