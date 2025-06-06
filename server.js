const express = require("express");
const http = require("http");
const WebSocket = require("wss://relieved-believed-conchoraptor.glitch.me/");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Utilisateur connecté");
  ws.on("message", msg => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });
});

app.get("/", (req, res) => res.send("Serveur WS connecté"));
server.listen(process.env.PORT || 3000);
