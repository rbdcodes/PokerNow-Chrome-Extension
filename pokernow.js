const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch({
    defaultViewport: false,
    headless: true,
    //saves cookies for saving captcha
  });

  const page = await browser.newPage();
  await page.goto("https://www.pokernow.club/games/pgllpnoNjJQEynV1XgyeKteau");
  console.log("1");

  const title = await page.evaluate(() => document.title);
  console.log(title);

  const players = await page.evaluate(() => {
    const seatDivs = document.querySelectorAll(
      ".seats .table-player-name-container .table-player-name"
    );
    return Array.from(seatDivs).map((div) => div.innerHTML);
    // return seatsDiv.innerHTML;
  });

  const playerDivs = await page.evaluate(() => {
    const playerTags = document.querySelectorAll(".seats .table-player");
    playerNames = [];
    playerBets = [];
    Array.from(playerTags).map((playerDiv) => {
      if (!playerDiv.className.includes("table-player-seat")) {
        const playerName = playerDiv.querySelector(
          ".table-player-name-container .table-player-name"
        );

        // const betAmountInBB = playerDiv.querySelector("p");

        const betAmountInBB = playerDiv.querySelector(
          "p.table-player-bet-value"
        );

        const betAmount = betAmountInBB ? betAmountInBB.innerText : "No bet";

        playerNames.push(`${playerName.innerHTML} bets ${betAmount}`);
      }
    });

    return playerNames;
  });

  console.log(playerDivs);
}

run();
