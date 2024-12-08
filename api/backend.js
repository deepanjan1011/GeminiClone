const express = require("express");
const serverless = require("serverless-http");

const app = express();

// Add your middleware, routes, etc.
app.get("/api/your-endpoint", (req, res) => {
  res.json({ message: "Hello from Vercel backend!" });
});

module.exports = app; // For local testing
module.exports.handler = serverless(app); // For Vercel deployment
