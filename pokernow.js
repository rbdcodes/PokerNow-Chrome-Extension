const puppeteer = require("puppeteer");

function getPlayerNumber(playerTagClassName) {
  const test = "table-player table-player-1 you-player ";
  const classNameTokens = test.split(" ");
  return classNameTokens[1];
}

async function run() {
  const browser = await puppeteer.launch({
    defaultViewport: false,
    headless: true,
    //saves cookies for saving captcha
  });

  const page = await browser.newPage();
  await page.goto("https://www.pokernow.club/games/pglp75Kc6eH3DezYWziWN6fUA");

  await page.exposeFunction("puppeteerLogMutation", () => {
    console.log("Mutation Detected: A child node has been added or removed.");
  });

  await page.exposeFunction("printMe", (lul) => console.log(lul));

  await page.exposeFunction("getPlayerNumber", getPlayerNumber());

  await page.evaluate(() => {
    const playerTags = document.querySelectorAll(".seats .table-player");

    Array.from(playerTags).map((playerTag) => {
      if (!playerTag.className.includes("table-player-seat")) {
        const playerNumber = getPlayerNumber(playerTag.className);

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type == "childList" || mutation.type == "subtree") {
              printMe(playerNumber);
            }
          }
        });

        observer.observe(target, { childList: true, subtree: true });
      }
    });
  });
}

run();
