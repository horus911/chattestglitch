let ws;
let localStream;
let recorder, chunks = [];

function connectWS() {
  const pseudo = document.getElementById("pseudo").value || "Anonyme";
  const country = document.getElementById("country").value;
  ws = new WebSocket("wss://relieved-believed-conchoraptor.glitch.me/");

  ws.onopen = () => {
    document.getElementById("status").textContent = "✅ Connecté !";
    document.getElementById("status").style.color = "#4CAF50";
    ws.send(pseudo + " " + country + " a rejoint le chat");
  };

  ws.onmessage = (event) => {
    if (typeof event.data === "string") {
      if (event.data.startsWith("audio:")) {
        const audioData = event.data.slice(6);
        const audio = new Audio(audioData);
        audio.play();
        addMessage("🔊 Message audio reçu", "received");
      } else {
        addMessage(event.data, "received");
      }
    } else {
      console.warn("⚠️ Message non texte reçu :", event.data);
    }
  };

  ws.onclose = () => {
    document.getElementById("status").textContent = "⚠️ Déconnecté";
    document.getElementById("status").style.color = "red";
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

function addMessage(content, type = "received") {
  const chatDiv = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.textContent = content;
  msg.style.maxWidth = "80%";
  msg.style.wordWrap = "break-word";
  msg.style.backgroundColor = (type === "sent") ? "#DCF8C6" : "#eee";
  msg.style.float = (type === "sent") ? "right" : "left";
  msg.style.clear = "both";
  chatDiv.appendChild(msg);
  chatDiv.appendChild(document.createElement("br"));
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

document.getElementById("sendBtn").addEventListener("click", () => {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message && ws?.readyState === WebSocket.OPEN) {
    ws.send(message);
    addMessage(message, "sent");
    input.value = "";
  }
});

document.getElementById("messageInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("sendBtn").click();
});

document.getElementById("mediaBtn").addEventListener("click", async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const video = document.getElementById("localVideo");
    video.srcObject = localStream;
  } catch (err) {
    alert("Erreur accès caméra/micro : " + err.message);
  }
});

document.getElementById("musicBtn").addEventListener("click", () => {
  const music = document.getElementById("music");
  if (music.paused) {
    music.play();
    document.getElementById("musicBtn").textContent = "⏸️ Pause Musique";
  } else {
    music.pause();
    document.getElementById("musicBtn").textContent = "🎵 Lecture Musique";
  }
});

document.getElementById("recordBtn").addEventListener("click", async () => {
  if (!localStream) {
    alert("Active d'abord ton micro !");
    return;
  }

  if (recorder && recorder.state === "recording") {
    recorder.stop();
    document.getElementById("recordBtn").textContent = "🎙️ Enregistrer Audio";
    return;
  }

  chunks = [];
  const audioStream = new MediaStream(localStream.getAudioTracks());
  recorder = new MediaRecorder(audioStream);

  recorder.ondataavailable = (e) => chunks.push(e.data);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send("audio:" + base64data);
        addMessage("🔊 Message audio envoyé", "sent");
      }
    };
    reader.readAsDataURL(blob);
  };

  recorder.start();
  document.getElementById("recordBtn").textContent = "⏹️ Stopper l'enregistrement";

  setTimeout(() => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      document.getElementById("recordBtn").textContent = "🎙️ Enregistrer Audio";
    }
  }, 10000);
});

document.getElementById("connectBtn").addEventListener("click", connectWS);

document.getElementById("nextBtn").addEventListener("click", () => {
  if (ws) ws.close();
  document.getElementById("chat").innerHTML = "";
  document.getElementById("status").textContent = "🔄 Reconnexion...";
  connectWS();
});
