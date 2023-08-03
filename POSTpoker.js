// app.js
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000; // You can change this to any port you want

// Middleware to parse JSON in the request body
app.use(express.json());

let currentPlayer = "";

// Route handler for handling POST requests
app.post("/", async (req, res) => {
  try {
    const { url, playerNumber } = req.body;
    currentPlayer = playerNumber;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Perform scraping using page.evaluate
    const data = await scrapePlayerInfo(page, currentPlayer);

    await browser.close();

    console.log("post request received");
    console.log("Scraped data:", data);

    res.status(200).json({
      message: "Post request received and data scraped successfully",
      data,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "Error occurred while processing the request" });
  }
});

// Define a route
app.get("/", (req, res) => {
  res.send("Hello World! This is my Express server.");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Function to scrape player information
async function scrapePlayerInfo(page, currentPlayer) {
  const data = await page.evaluate((currentPlayer) => {
    const playerTags = document.querySelectorAll(".seats .table-player");

    const player = Array.from(playerTags).filter(
      (player) =>
        !player.className.includes("table-player-seat") &&
        player.className.includes(currentPlayer)
    );

    const playerDiv = player[0];

    const playerName = playerDiv.querySelector(
      ".table-player-infos-ctn .table-player-name"
    );

    const playerBetAmountDiv = playerDiv.querySelector(
      "p.table-player-bet-value"
    );

    const playerBetAmount = playerBetAmountDiv
      ? playerBetAmountDiv.innerText
      : "No Bet";

    return {
      playerBet: playerBetAmount,
      playerSeat: currentPlayer,
      playerName: playerName.innerText,
    };
  }, currentPlayer);

  return data;
}
