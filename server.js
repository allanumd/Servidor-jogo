const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const ROOM = "partida-1";
const players = new Map();

app.get("/", (req, res) => {
  res.send("Servidor do Fogo Royale 3D online!");
});

io.on("connection", (socket) => {
  socket.on("entrar-partida", () => {
    if (socket.data.inRoom) return;
    socket.join(ROOM);
    socket.data.inRoom = true;

    const current = [...players.values()].filter((p) => p.id !== socket.id);
    socket.emit("jogadores-atuais", current);

    const player = { id: socket.id, x: 0, y: 0, z: 0, yaw: 0 };
    players.set(socket.id, player);

    socket.emit("partida-iniciada", { id: socket.id });
    socket.to(ROOM).emit("jogador-entrou", player);
  });

  socket.on("movimento", (data) => {
    if (!socket.data.inRoom || !data) return;
    const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
    const player = {
      id: socket.id,
      x: Math.max(-70, Math.min(70, num(data.x))),
      y: Math.max(0, Math.min(20, num(data.y))),
      z: Math.max(-70, Math.min(70, num(data.z))),
      yaw: num(data.yaw)
    };
    players.set(socket.id, player);
    socket.to(ROOM).emit("atualizar-jogador", player);
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    if (socket.data.inRoom) socket.to(ROOM).emit("jogador-saiu", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor online na porta " + PORT);
});
