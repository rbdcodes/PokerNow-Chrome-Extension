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

    const checkEndedAction = await scrapeLastActionFromLog(page);

    let playerSeatNumber = await scrapeCurrentPlayerName(page, req.body.isFlop);
    await browser.close();

    console.log("POST request received: ");
    res.status(200).json({
      message: "POST requested received",
      playerNumber: playerSeatNumber,
      url: url,
      checkEndedAction: checkEndedAction,
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

async function scrapeLastActionFromLog(page) {
  const checkEndedAction = await page.evaluate(async () => {
    const logButtonTag = await document.querySelector(
      ".button-1.show-log-button.small-button.dark-gray"
    );

    logButtonTag.click();

    // Add a 1-second delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const textLogTag = document.querySelector(
      ".modal-overlay .log-modal-body .log-modal-entries"
    );

    // Get the first 5 child nodes
    const firstFiveChildNodes = Array.from(textLogTag.childNodes).slice(0, 10);

    // Create an array from the innerHTML of the first 5 child nodes
    const textArray = firstFiveChildNodes.map((node) => node.className);

    let lastActionClass = "No player";

    //identify where board is and return next index
    //log behavior isnt dterministic since its asynchronous, so index of last action is dynamic
    for (let i = 0; i < textArray.length; i++) {
      //space necessary class is " entry-ctn" not "entry-ctn"
      if (textArray[i] === " entry-ctn") {
        lastActionClass = textArray[i + 1];
        break;
      }
    }

    const checkEndedAction = lastActionClass.includes("entry-check");

    return checkEndedAction;
  });

  return checkEndedAction;
}

async function scrapeCurrentPlayerName(page, isFlop) {
  const currentPlayerSeatNumber = await page.evaluate((isFlop) => {
    const buttonTag = document.querySelector(".dealer-button-ctn");
    const bToken = buttonTag.className.split(" ");
    const bpToken = bToken[1].split("-");
    const bpNumber = bpToken[2];

    const playerTags = document.querySelectorAll(".seats .table-player");

    const playerTagsArrayWithFolds = Array.from(playerTags).filter(
      (player) => !player.className.includes("table-player-seat")
    );

    const playerTagsArray = Array.from(playerTags).filter(
      (player) =>
        !player.className.includes("table-player-seat") &&
        !player.className.includes("fold")
    );

    let pFoldLength = playerTagsArrayWithFolds.length;
    let pLength = playerTagsArray.length;

    //in case first person is current decision, can always track last person (person who checked)
    let lastPlayer = playerTagsArray.at(pLength - 1).className;
    let currentPlayerTag = "test";

    let namesTest = {};
    namesTest["length"] = pLength;
    namesTest["last"] = lastPlayer;

    if (isFlop) {
      let i = 0;
      while (true) {
        const cPlayer = playerTagsArray.at(i).className;
        if (cPlayer.includes(bpNumber)) {
          i += 2;
          if ((i) => pFoldLength) {
            i = i - pFoldLength;
          }
          break;
        }
        i++;
      }
      cPTest = playerTagsArrayWithFolds.at(i);
      currentPlayerTag = cPTest.className;
    } else {
      // request coming from checks closing action on flop or turn
      for (let i = 0; i < pLength; i++) {
        const cPlayer = playerTagsArray.at(i).className;
        namesTest[i] = cPlayer;
        if (cPlayer.includes("decision-current")) {
          currentPlayerTag = lastPlayer;
          break;
        }
        lastPlayer = playerTagsArray.at(i).className;
      }
    }

    const tokens = currentPlayerTag.split(" ");
    return { name: tokens[1], isFlop: isFlop, button: bpNumber };
  }, isFlop);

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
