const WebSocket = require('ws://relieved-believed-conchoraptor.glitch.me/');

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WS server running on port ${PORT}`);

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('Client connected, total:', clients.length);

  ws.on('message', (message) => {
    // Relayer le message à tous sauf l’envoyeur
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log('Client disconnected, total:', clients.length);
  });
});
