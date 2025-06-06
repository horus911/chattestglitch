// === CONFIGURATION ===
// Remplace par ton WS Glitch (sans le / à la fin)
const WS_URL = "wss://night-scarlet-gas.glitch.me/";

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const nextBtn = document.getElementById("nextBtn");
const startRecordBtn = document.getElementById("start-record");
const stopRecordBtn = document.getElementById("stop-record");
const recordStatus = document.getElementById("record-status");
const musicSelect = document.getElementById("music-select");
const musicPlayer = document.getElementById("music-player");

let localStream;
let remoteStream;
let pc;
let ws;
let isCaller = false;
let mediaRecorder;
let recordedChunks = [];

// --- Setup WebSocket ---
function setupWebSocket() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    logSystem("WebSocket connecté !");
    if (isCaller) {
      createOffer();
    }
  };

  ws.onmessage = async (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      console.warn("Message WS non JSON", event.data);
      return;
    }

    switch (data.type) {
      case "offer":
        if (!pc) createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendMessage({ type: "answer", answer });
        break;

      case "answer":
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        break;

      case "ice-candidate":
        if (data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error("Erreur ICE candidate:", err);
          }
        }
        break;

      case "chat":
        appendChatMessage("Partenaire", data.message);
        break;

      case "audio-record":
        playAudioFromBase64(data.audioData);
        break;

      case "next":
        // Relancer une nouvelle connexion
        closePeerConnection();
        isCaller = true;
        createPeerConnection();
        break;
    }
  };

  ws.onclose = () => {
    logSystem("WebSocket déconnecté");
  };

  ws.onerror = (err) => {
    logSystem("Erreur WebSocket : " + err.message);
  };
}

function sendMessage(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

// --- Log messages dans chat ---
function appendChatMessage(sender, message) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatWindow.appendChild(p);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function logSystem(message) {
  appendChatMessage("⚙️ Système", message);
}

// --- Setup WebRTC ---
async function startLocalStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
  } catch (err) {
    alert("Erreur accès caméra/micro : " + err.message);
  }
}

function createPeerConnection() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage({ type: "ice-candidate", candidate: event.candidate });
    }
  };

  pc.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    remoteStream.addTrack(event.track);
  };

  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
}

// --- Création et envoi offre SDP ---
async function createOffer() {
  if (!pc) createPeerConnection();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  sendMessage({ type: "offer", offer });
}

// --- Fermeture connexion WebRTC ---
function closePeerConnection() {
  if (pc) {
    pc.close();
    pc = null;
  }
  if (remoteStream) {
    remoteStream.getTracks().forEach((t) => t.stop());
    remoteStream = null;
    remoteVideo.srcObject = null;
  }
}

// --- Gestion chat texte ---
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (msg === "") return;
  appendChatMessage("Moi", msg);
  sendMessage({ type: "chat", message: msg });
  chatInput.value = "";
});

// --- Bouton "Suivant" ---
nextBtn.addEventListener("click", () => {
  logSystem("Recherche d'un nouveau partenaire...");
  sendMessage({ type: "next" });
  closePeerConnection();
  isCaller = true;
  createPeerConnection();
});

// --- Enregistrement audio ---
startRecordBtn.addEventListener("click", () => {
  if (!localStream) {
    alert("Tu dois activer la caméra/micro d'abord.");
    return;
  }
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(localStream, { mimeType: "audio/webm" });
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      sendMessage({ type: "audio-record", audioData: base64data });
      recordStatus.textContent = "Audio envoyé.";
    };
    reader.readAsDataURL(blob);
  };
  mediaRecorder.start();
  startRecordBtn.disabled = true;
  stopRecordBtn.disabled = false;
  recordStatus.textContent = "Enregistrement en cours...";
});

stopRecordBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
  }
});

function playAudioFromBase64(base64) {
  const audio = new Audio("data:audio/webm;base64," + base64);
  audio.play();
}

// --- Ambiance musicale ---
musicSelect.addEventListener("change", () => {
  const url = musicSelect.value;
  if (url) {
    musicPlayer.src = url;
    musicPlayer.play();
  } else {
    musicPlayer.pause();
    musicPlayer.src = "";
  }
});

// --- Initialisation ---
(async () => {
  await startLocalStream();
  isCaller = true;
  setupWebSocket();
})();
