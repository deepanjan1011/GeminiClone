const express = require('express');
const cors = require('cors');
app.use(cors());
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable cross-origin requests

// Endpoint to serve API key
app.get('/api/key', (req, res) => {
  res.json({ apiKey: process.env.API_KEY });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
