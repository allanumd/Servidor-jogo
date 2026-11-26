const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Servidor do jogo online funcionando!");
});

io.on("connection", (socket) => {
  console.log("Jogador conectado:", socket.id);

  socket.on("entrar-partida", () => {
    socket.join("partida-1");

    socket.emit("partida-iniciada", {
      id: socket.id
    });

    socket.to("partida-1").emit("jogador-entrou", {
      id: socket.id
    });
  });

  socket.on("movimento", (dados) => {
    socket.to("partida-1").emit("atualizar-jogador", {
      id: socket.id,
      x: dados.x,
      y: dados.y,
      z: dados.z
    });
  });

  socket.on("disconnect", () => {
    io.emit("jogador-saiu", socket.id);
    console.log("Jogador desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Servidor iniciado na porta " + PORT);
});
