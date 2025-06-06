* {
  box-sizing: border-box;
}
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0; padding: 0;
  background: #121212;
  color: #eee;
  display: flex;
  justify-content: center;
  min-height: 100vh;
}
#app {
  width: 100%;
  max-width: 900px;
  padding: 15px;
}
header {
  text-align: center;
  margin-bottom: 15px;
}
#videos {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}
#videos > div {
  flex: 1 1 45%;
  background: #222;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}
video {
  width: 100%;
  border-radius: 8px;
  background: black;
  height: 240px;
  object-fit: cover;
}
#chat-section {
  background: #222;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
}
#chat-window {
  height: 150px;
  overflow-y: auto;
  border: 1px solid #555;
  border-radius: 5px;
  padding: 8px;
  background: #111;
  margin-bottom: 10px;
  font-size: 0.9rem;
}
#chat-window p {
  margin: 5px 0;
  line-height: 1.2;
}
#chat-form {
  display: flex;
}
#chat-input {
  flex-grow: 1;
  padding: 6px 10px;
  font-size: 1rem;
  border-radius: 4px 0 0 4px;
  border: none;
}
#chat-input:focus {
  outline: none;
}
#chat-form button {
  background: #2ecc71;
  border: none;
  color: #fff;
  padding: 0 15px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  font-weight: bold;
  transition: background 0.3s ease;
}
#chat-form button:hover {
  background: #27ae60;
}
#nextBtn {
  margin-top: 10px;
  width: 100%;
  background: #e67e22;
  border: none;
  color: white;
  font-weight: bold;
  padding: 8px 0;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}
#nextBtn:hover {
  background: #d35400;
}
#audio-record-section {
  background: #222;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
}
#audio-record-section button {
  background: #3498db;
  border: none;
  color: white;
  padding: 8px 15px;
  font-size: 1rem;
  border-radius: 5px;
  margin: 0 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}
#audio-record-section button:disabled {
  background: #555;
  cursor: not-allowed;
}
#record-status {
  margin-top: 10px;
  font-style: italic;
  font-size: 0.9rem;
  color: #ccc;
}
#music-section {
  background: #222;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
select#music-select {
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  background: #333;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}
@media (max-width: 700px) {
  #videos > div {
    flex-basis: 100%;
  }
  video {
    height: 180px;
  }
}
