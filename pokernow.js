const puppeteer = require("puppeteer");

const playerMap = {};

async function run() {
  const browser = await puppeteer.launch({
    defaultViewport: false,
    headless: true,
    //saves cookies for saving captcha
  });

  const page = await browser.newPage();
  await page.goto("https://www.pokernow.club/games/pglErDhnmy-KymtdXe6GMTDrG");

  await page.exposeFunction("printMe", (lul) => console.log(lul));

  await page.exposeFunction("getPlayerNumber", (playerTagClassName) => {
    console.log(`playerTagClassName is ${playerTagClassName}`);
    const classNameTokens = playerTagClassName.split(" ");
    return classNameTokens[1];
  });

  await page.exposeFunction(
    "assignPlayerToMap",
    (playerInfoObject, playerNumber) => {
      playerMap[playerNumber] = playerInfoObject;
    }
  );

  await page.exposeFunction("printPlayerObjectInfo", (playerNumber) => {
    console.log(playerMap[playerNumber]);
  });

  await page.evaluate(() => {
    const playerTags = document.querySelectorAll(".seats .table-player");

    Array.from(playerTags).map(async (playerTag) => {
      if (!playerTag.className.includes("table-player-seat")) {
        const playerNumber = await getPlayerNumber(playerTag.className);

        const betAmountTag = await playerDiv.querySelector(
          "p.table-player-bet-value"
        );

        const betAmount = betAmountTag ? betAmountTag.innerText : "No bet";

        const playerInfo = {
          name: playerNumber,
          pastBet: -1,
          prevState: "Check",
          currentState: "Active",
        };

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type == "childList" || mutation.type == "subtree") {
              // if (playerTag.className.includes("decision-current")) {
              //   playerInfo.prevState = "decision-current";
              // } else {
              //   playerInfo.prevState = "waiting for turn";
              // }

              // playerInfo.pastBet = betAmount;

              printMe(playerNumber);
              //put function to store all data here
              assignPlayerToMap(playerInfo, playerNumber);
              printPlayerObjectInfo(playerNumber);
            }
          }
        });

        observer.observe(playerTag, { childList: true, subtree: true });
      }
    });
  });
}

run();
