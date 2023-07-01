const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp", //saves cookies for saving captcha
  });
  const page = await browser.newPage();

  await page.goto(
    "https://www.amazon.com/s?k=protein+powder&crid=2EDQDPLB4T007&sprefix=protein+powde%2Caps%2C137&ref=nb_sb_noss_2"
  );

  const classToScrape =
    "div.s-main-slot.s-result-list.s-search-results.sg-row > div.sg-col-inner";

  const amazonItemListings = await page.$$(classToScrape);
  console.log("test1");

  for (const scrapedItem of amazonItemListings) {
    console.log("test");
    const title = await page.evaluate(
      (el) => el.querySelector("h2 > a > span").textContent,
      scrapedItem
    );

    console.log(title);
  }

  //await page.screenshot({ path: "example.png" });

  //await browser.close();
})();
