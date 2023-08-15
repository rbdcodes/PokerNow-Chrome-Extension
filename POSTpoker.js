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

app.post("/currentPlayer", async (req, res) => {
  try {
    const { url, playerNumber } = req.body;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const playerSeatNumber = await scrapeCurrentPlayerName(page);

    await browser.close();

    console.log("GET request received: ");
    res.status(200).json({
      message: "get requested received",
      playerNumber: playerSeatNumber,
      url: url,
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res
      .status(500)
      .json({ message: "Error occcured while processing get request" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function scrapeCurrentPlayerName(page) {
  const currentPlayerSeatNumber = await page.evaluate(() => {
    const playerTags = document.querySelectorAll(".seats .table-player");
    const playerTagsArray = Array.from(playerTags).filter(
      (player) =>
        !player.className.includes("table-player-seat") &&
        !player.className.includes("fold")
    );

    let pLength = playerTagsArray.length;
    //in case first person is current decision, can always track last person (person who checked)
    let lastPlayer = playerTagsArray.at(pLength - 1).className;
    let currentPlayerTag = "test";

    let namesTest = {};
    namesTest["length"] = pLength;
    namesTest["last"] = lastPlayer;

    for (let i = 0; i < pLength; i++) {
      const cPlayer = playerTagsArray.at(i).className;
      namesTest[i] = cPlayer;
      // namesTest[i] = cPlayer;
      // namesTest[i] = cPlayer;
      // namesTest[i - 100] = lastPlayer;
      if (cPlayer.includes("decision-current")) {
        currentPlayerTag = lastPlayer;
        break;
      }
      lastPlayer = playerTagsArray.at(i).className;
    }

    const tokens = currentPlayerTag.split(" ");
    namesTest[27] = tokens[1];
    return tokens[1];
  });

  console.log("currentPlayerNumber: " + currentPlayerSeatNumber);

  return currentPlayerSeatNumber;
}

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
