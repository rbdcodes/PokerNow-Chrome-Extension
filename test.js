// app.js
const express = require("express");
const app = express();
const port = 3000; // You can change this to any port you want

// Define a route
app.get("/", (req, res) => {
  res.send("Hello World! This is my Express server.");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
