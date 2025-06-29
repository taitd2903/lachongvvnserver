const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Biến lưu điểm số
let red = 0;
let blue = 0;

// Biến lưu thời gian và trạng thái
let timer = {
  originalTime: 0,
  time: 0,
  running: false,
  hiep: 1,
};

// Gửi dữ liệu mỗi giây nếu đang chạy
setInterval(() => {
  if (timer.running && timer.time > 0) {
    timer.time--;
    io.emit("timer_update", timer);
  }
}, 1000);

// Chỉ gộp 1 lần io.on("connection")
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Gửi dữ liệu ban đầu cho client mới
  socket.emit("timer_update", timer);
  socket.emit("score_update", { red, blue });

  // ----------- TIMER EVENTS -----------
  socket.on("set_timer", ({ time, hiep }) => {
    timer.originalTime = time;
    timer.time = time;
    timer.hiep = hiep;
    timer.running = false;
    io.emit("timer_update", timer);
  });

  socket.on("start_timer", () => {
    timer.running = true;
    io.emit("timer_update", timer);
  });

  socket.on("pause_timer", () => {
    timer.running = false;
    io.emit("timer_update", timer);
  });

  socket.on("reset_timer", () => {
    timer.time = timer.originalTime;
    timer.running = false;
    io.emit("timer_update", timer);
  });

  // ----------- SCORE EVENTS -----------
  socket.on("update_score", ({ team, delta }) => {
    if (team === "red") red += delta;
    if (team === "blue") blue += delta;
    io.emit("score_update", { red, blue });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Server lắng nghe
server.listen(4000, () => {
  console.log("✅ Server listening on http://localhost:4000");
});
