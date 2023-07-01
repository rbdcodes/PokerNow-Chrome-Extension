const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch({
    defaultViewport: false,
    headless: true,
    //saves cookies for saving captcha
  });

  const page = await browser.newPage();
  await page.goto("https://www.pokernow.club/games/pgllpnoNjJQEynV1XgyeKteau");

  await page.exposeFunction("puppeteerLogMutation", () => {
    console.log("Mutation Detected: A child node has been added or removed.");
  });

  await page.exposeFunction("printMe", (lul) => console.log(lul));

  await page.evaluate(() => {
    const target = document.querySelector(".seats .table-player");

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type == "childList" || mutation.type == "subtree") {
          puppeteerLogMutation();
        }
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  });
}

run();
