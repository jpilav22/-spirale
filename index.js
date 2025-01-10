const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using async file API
const moment = require('moment'); // For handling date and time
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
// Global object to track login attempts
let loginAttempts = {};

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving HTML files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/mojiUpiti.html', file: 'mojiUpiti.html' },
];

routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading JSON data from the data folder
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for saving JSON data to the data folder
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}

/* ---------------- LOGIN ROUTE -------------------- */

app.post('/login', async (req, res) => {
  const jsonObj = req.body;
  const username = jsonObj.username;
  const currentTime = Date.now();

  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'korisnici.json'), 'utf-8');
    const korisnici = JSON.parse(data);
    let found = false;

    // Check if user has been locked
    if (loginAttempts[username] && loginAttempts[username].attempts >= 3) {
      const lockTime = loginAttempts[username].lockUntil;
      if (currentTime < lockTime) {
        return res.status(429).json({ greska: "Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu." });
      } else {
        // Reset the lock after 1 minute
        loginAttempts[username] = { attempts: 0, lockUntil: 0 }; 
      }
    }

    // Look for the user in the korisnici array
    for (const korisnik of korisnici) {
      if (korisnik.username === username) {
        // If password is plain text, directly compare
        let isPasswordMatched = korisnik.password === jsonObj.password;

        // Log the attempt (both successful and unsuccessful)
        const logMessage = `${moment().format('YYYY-MM-DD HH:mm:ss')} - username: "${username}" - status: "${isPasswordMatched ? 'uspješno' : 'neuspješno'}"\n`;
        await fs.appendFile(path.join(__dirname, 'prijave.txt'), logMessage);

        if (isPasswordMatched) {
          req.session.username = korisnik.username;
          loginAttempts[username] = { attempts: 0, lockUntil: 0 }; // Reset the attempts after successful login
          found = true;
          break;
        } else {
          // Increment failed attempts
          loginAttempts[username] = loginAttempts[username] || { attempts: 0, lockUntil: 0 };
          loginAttempts[username].attempts++;
          if (loginAttempts[username].attempts >= 3) {
            loginAttempts[username].lockUntil = currentTime + 60000; // Block for 1 minute
          }
        }
      }
    }

    if (found) {
      res.json({ poruka: 'Uspješna prijava' });
    } else {
      res.json({ poruka: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/* ---------------- PROPERTY ROUTES ----------------- */

// New route for fetching the top 5 properties based on location
app.get('/nekretnine/top5', async (req, res) => {
  const lokacija = req.query.lokacija;
  try {
    const nekretnine = await readJsonFile('nekretnine');
    const filteredProperties = nekretnine.filter((property) => property.lokacija === lokacija);
    const sortedProperties = filteredProperties.sort((a, b) => new Date(b.datum_objave) - new Date(a.datum_objave)); // Sort by date
    const top5 = sortedProperties.slice(0, 5); // Get top 5

    res.status(200).json(top5);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/* ---------------- PROPERTY QUERY ROUTE ----------------- */

// Modified route to allow a user to make up to 3 queries per property
app.post('/upit', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { nekretnina_id, tekst_upita } = req.body;

  try {
    const users = await readJsonFile('korisnici');
    const nekretnine = await readJsonFile('nekretnine');
    const loggedInUser = users.find((user) => user.username === req.session.username);
    const nekretnina = nekretnine.find((property) => property.id === nekretnina_id);

    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    const userQueries = nekretnina.upiti.filter((query) => query.korisnik_id === loggedInUser.id);
    if (userQueries.length >= 3) {
      return res.status(429).json({ greska: 'Previše upita za istu nekretninu.' });
    }

    nekretnina.upiti.push({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst_upita
    });

    await saveJsonFile('nekretnine', nekretnine);
    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.get('/upiti/moji', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    const users = await readJsonFile('korisnici');
    const nekretnine = await readJsonFile('nekretnine');
    const loggedInUser = users.find(user => user.username === req.session.username);

    // Pronađi sve upite korisnika i poveži ih sa nekretninama
    const userQueries = nekretnine.flatMap(property =>
      property.upiti.filter(query => query.korisnik_id === loggedInUser.id)
    );

    if (userQueries.length === 0) {
      return res.status(404).json([]); // No queries found
    }

    // Pronađite id nekretnine za svaki upit
    const result = userQueries.map(query => {
      // Nađi nekretninu sa upitima korisnika
      const nekretnina = nekretnine.find(property => property.upiti.includes(query));
      
      // Vratite id nekretnine i tekst upita
      return {
        id_nekretnine: nekretnina ? nekretnina.id : null,  // Ako postoji nekretnina, uzmi id
        tekst_upita: query.tekst_upita
      };
    });

    // Pošaljite odgovarajući odgovor
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user queries:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

// Route to get property details with last 3 queries
app.get('/nekretnina/:id', async (req, res) => {
  const nekretninaId = req.params.id;

  try {
    const nekretnine = await readJsonFile('nekretnine');
    const nekretnina = nekretnine.find(property => property.id == nekretninaId);

    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    // Get the last 3 queries for the property
    const last3Queries = nekretnina.upiti.slice(-3);

    res.status(200).json({
      id: nekretnina.id,
      lokacija: nekretnina.lokacija,
      cena: nekretnina.cena,
      opis: nekretnina.opis,
      upiti: last3Queries
    });
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/next/upiti/nekretnina:id', async (req, res) => {
  const nekretninaId = req.params.id;
  const page = parseInt(req.query.page) || 0; // Default page=0 ako nije prosleđeno

  if (page < 0) {
    return res.status(400).json({ greska: 'Page must be >= 0' });
  }

  try {
    const nekretnine = await readJsonFile('nekretnine');
    const nekretnina = nekretnine.find(property => property.id == nekretninaId);

    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    const allQueries = nekretnina.upiti;
    const totalUpiti = allQueries.length;

    // Proverite da li ima dovoljno upita za traženi page
    //if (totalUpiti < 3) {
      //return res.status(404).json([]); // Ne postoji dovoljno upita
    //}

    // Za page 0, prikazujemo poslednja 3 upita
    const startIdx = totalUpiti - (page + 1) * 3;  // Za page 0, startIdx će biti totalUpiti - 3
    const endIdx = startIdx + 3;

    // Ako startIdx je manji od 0, znači nema više upita
    if (startIdx < 0) {
      return res.status(404).json([]); // Ako stranica traži više upita nego što ih ima
    }

    const nextQueries = allQueries.slice(startIdx, endIdx);

    if (nextQueries.length === 0) {
      return res.status(404).json([]); // Ako nema više upita na ovoj stranici
    }

    // Vraćamo sledeća 3 upita
    res.status(200).json(nextQueries.map(query => ({
      korisnik_id: query.korisnik_id,
      tekst_upita: query.tekst_upita
    })));
  } catch (error) {
    console.error('Error fetching next queries for property:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/* ---------------- LOGOUT ------------------ */

app.post('/logout', (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
