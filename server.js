<<<<<<< HEAD
import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(process.cwd(), "data.json");

// Middleware
app.use(bodyParser.json());
app.use(express.static(process.cwd()));

// Daten laden
function loadData() {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err);
    return { users: [], patrols: [] };
  }
}

// Daten speichern
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
  }
}

// API: Benutzer hinzufügen
app.post("/api/users", (req, res) => {
  const { username, password, dienummer, rank, role } = req.body;

  if (!username || !password || !dienummer || !rank) {
    return res.status(400).json({ success: false, message: "Fehlende Felder" });
  }

  const data = loadData();

  if (data.users.some(u => u.username === username)) {
    return res.status(400).json({ success: false, message: "Benutzername existiert bereits" });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    dienummer,
    rank,
    role: role || "user",
    profileImage: "",
    onDuty: false
  };

  data.users.push(newUser);
  saveData(data);

  console.log(`✅ Neuer Benutzer hinzugefügt: ${username}`);
  res.json({ success: true, user: newUser });
});

// API: Alle Benutzer abrufen
app.get("/api/users", (req, res) => {
  const data = loadData();
  res.json(data.users);
});

// Server starten
app.listen(PORT, () => console.log(`✅ Server läuft auf http://localhost:${PORT}`));
=======
import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(process.cwd(), "data.json");

// Middleware
app.use(bodyParser.json());
app.use(express.static(process.cwd()));

// Daten laden
function loadData() {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err);
    return { users: [], patrols: [] };
  }
}

// Daten speichern
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
  }
}

// API: Benutzer hinzufügen
app.post("/api/users", (req, res) => {
  const { username, password, dienummer, rank, role } = req.body;

  if (!username || !password || !dienummer || !rank) {
    return res.status(400).json({ success: false, message: "Fehlende Felder" });
  }

  const data = loadData();

  if (data.users.some(u => u.username === username)) {
    return res.status(400).json({ success: false, message: "Benutzername existiert bereits" });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    dienummer,
    rank,
    role: role || "user",
    profileImage: "",
    onDuty: false
  };

  data.users.push(newUser);
  saveData(data);

  console.log(`✅ Neuer Benutzer hinzugefügt: ${username}`);
  res.json({ success: true, user: newUser });
});

// API: Alle Benutzer abrufen
app.get("/api/users", (req, res) => {
  const data = loadData();
  res.json(data.users);
});

// Server starten
app.listen(PORT, () => console.log(`✅ Server läuft auf http://localhost:${PORT}`));
>>>>>>> 0156735 (Initial commit)
