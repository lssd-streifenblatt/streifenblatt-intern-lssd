const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // index.html im public-Ordner

const usersFile = path.join(__dirname, 'users.json');

// Hilfsfunktion: nächste ID
function nextId(users) {
  let max = 0;
  for (const u of users) {
    const n = parseInt(u.id, 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return String(max + 1);
}

// POST-Route zum Hinzufügen eines Benutzers
app.post('/add-user', (req, res) => {
  const { username, password, name, rank } = req.body;
  if (!username || !password || !name || !rank) {
    return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt werden.' });
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Konnte users.json nicht lesen.' });

    let usersData;
    try {
      usersData = JSON.parse(data);
      if (!usersData.users || !Array.isArray(usersData.users)) usersData.users = [];
    } catch {
      usersData = { users: [] };
    }

    const newUser = {
      id: nextId(usersData.users),
      username,
      password,
      name,
      rank
    };

    usersData.users.push(newUser);

    fs.writeFile(usersFile, JSON.stringify(usersData, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Konnte users.json nicht schreiben.' });
      res.json({ success: true, user: newUser });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
