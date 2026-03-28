const ws = new WebSocket("wss://your-render-url.onrender.com");

ws.onmessage = (msg) => {
  const state = JSON.parse(msg.data);

  updateFlight(state.flight);
  updateSystem(state.system);
  updatePhase(state);
  updateAI(state);
};

function updateFlight(f) {
  document.getElementById("alt").innerText = f.alt.toFixed(0);
  document.getElementById("spd").innerText = f.spd.toFixed(0);
  document.getElementById("hdg").innerText = f.hdg.toFixed(0);
  document.getElementById("vsi").innerText = f.vsi.toFixed(0);
}

function updateSystem(s) {
  document.getElementById("cpu").innerText = s.cpu;
  document.getElementById("link").innerText = s.link;
  document.getElementById("bus").innerText = s.bus;
}

function updatePhase(state) {
  let phase = "CRUISE";

  if (state.flight.alt < 1000) phase = "LANDING";
  else if (state.flight.alt < 5000) phase = "CLIMB";

  document.getElementById("phase").innerText = "PHASE: " + phase;
}

function updateAI(state) {
  let msg = "ALL SYSTEMS NOMINAL";

  if (state.system.cpu > 85) {
    msg = "⚠ HIGH CPU LOAD";
  }

  if (state.system.link === "LOST") {
    msg = "❌ COMMS LOST → SWITCH BACKUP";
  }

  document.getElementById("alert").innerText = msg;
}
