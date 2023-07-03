const puppeteer = require("puppeteer");

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

  await page.exposeFunction("getPlayerNumber", (playerTagClassName) => {
    console.log(`playerTagClassName is ${playerTagClassName}`);
    const classNameTokens = playerTagClassName.split(" ");
    return classNameTokens[1];
  });

  await page.evaluate(() => {
    const playerTags = document.querySelectorAll(".seats .table-player");

    Array.from(playerTags).map(async (playerTag) => {
      if (!playerTag.className.includes("table-player-seat")) {
        const playerNumber = await getPlayerNumber(playerTag.className);

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type == "childList" || mutation.type == "subtree") {
              printMe(playerNumber);
            }
          }
        });

        observer.observe(playerTag, { childList: true, subtree: true });
      }
    });
  });
}

run();
