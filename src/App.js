import React, { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000", { transports: ["websocket"] });

const Chamdiem = () => {
  const updateScore = (team, delta) => {
    socket.emit("update_score", { team, delta });
  };

  const renderButtons = (team, color) => (
    <div
      style={{
        flex: 1,
        backgroundColor: color,
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <button className="score-btn" onClick={() => updateScore(team, 1)}>+1</button>
      <button className="score-btn" onClick={() => updateScore(team, 2)}>+2</button>
      <button className="score-btn" onClick={() => updateScore(team, -1)}>-1</button>
      <button className="score-btn" onClick={() => updateScore(team, -2)}>-2</button>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {renderButtons("red", "#F70000")}
      {renderButtons("blue", "#0000F7")}
    </div>
  );
};





const Diemso = () => {
  const [red, setRed] = useState(0);
  const [blue, setBlue] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [hiep, setHiep] = useState(1);

  useEffect(() => {
    socket.on("score_update", ({ red, blue }) => {
      setRed(red);
      setBlue(blue);
    });

    socket.on("timer_update", ({ time, running, hiep }) => {
      setTime(time);
      setRunning(running);
      setHiep(hiep);
    });

    return () => {
      socket.off("score_update");
      socket.off("timer_update");
    };
  }, []);

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
 <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "10px",
      fontSize: "4vw",
      position: "relative",
    }}
  >
    {/* Logo ở góc trái */}
    <img
      src="/path/to/your/logo.png"
      alt="Logo"
      style={{
        height: "8vw", // khớp với fontSize 4vw của timer
        width: "auto", // hoặc đặt width: '5vw' nếu muốn cố định
        marginRight: "10px",
      }}
    />

    {/* Bộ đếm thời gian + trạng thái */}
    <div style={{ textAlign: "center", flex: 1 }}>
      ⏱ {formatTime(time)}
      <div style={{ fontSize: "2vw", color: running ? "green" : "red" }}>
        {running ? "Đang chạy" : "Tạm dừng"} | Hiệp {hiep}
      </div>
    </div>
  </div>

  <div style={{ display: "flex", flex: 1 }}>
    <div
      style={{
        flex: 1,
        backgroundColor: "red",
        color: "white",
        fontSize: "25vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {red}
    </div>
    <div
      style={{
        flex: 1,
        backgroundColor: "blue",
        color: "white",
        fontSize: "20vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {blue}
    </div>
  </div>
</div>

  );
};




const Bodem = () => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hiep, setHiep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  const setTimer = () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    socket.emit("set_timer", { time: totalSeconds, hiep });
  };

  const start = () => socket.emit("start_timer");
  const pause = () => socket.emit("pause_timer");
  const reset = () => socket.emit("reset_timer");

return (
  <div className="control-container">
    <h1>Điều khiển bộ đếm</h1>
 <div className="time-input-group">
  <div className="time-input">
    <label>Số phút:</label>
    <div className="number-control">
      <button onClick={() => setMinutes((prev) => Math.max(0, Number(prev) - 1))}>-</button>
      <input
        type="number"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
        min="0"
        step="1"
      />
      <button onClick={() => setMinutes((prev) => Number(prev) + 1)}>+</button>
    </div>
  </div>

  <div className="time-input">
    <label>Số giây:</label>
    <div className="number-control">
      <button onClick={() => setSeconds((prev) => Math.max(0, Number(prev) - 1))}>-</button>
      <input
        type="number"
        value={seconds}
        onChange={(e) => setSeconds(e.target.value)}
        min="0"
        max="59"
        step="1"
      />
      <button onClick={() => setSeconds((prev) => Math.min(59, Number(prev) + 1))}>+</button>
    </div>
  </div>
</div>

    <div>
      <label>Hiệp: </label>
      <select value={hiep} onChange={(e) => setHiep(parseInt(e.target.value))}>
        {[1, 2, 3, 4, 5].map((h) => (
          <option key={h} value={h}>Hiệp {h}</option>
        ))}
      </select>
    </div>
    <button onClick={setTimer}>Đặt thời gian</button>
   <button onClick={() => {
  if (isRunning) {
    pause();          
    setIsRunning(false);
  } else {
    start();       
    setIsRunning(true);
  }
}}>
  {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
</button>

    <button onClick={reset}>Reset</button>
  </div>
);

};






const App = () => {
  return (

    <Routes>      
      <Route path="/chamdiem" element={<Chamdiem />} />
      <Route path="/diemso" element={<Diemso />} />
      <Route path="/bodem" element={<Bodem />} />
      <Route path="/" element={<Diemso />} />
    </Routes>

  );
};
export default App;
