const puppeteer = require("puppeteer");
const axios = require("axios");

const playerMap = {};
const url = "https://www.pokernow.club/games/pglTRKRH2bLNid-P9B-PQIllY";

async function run() {
  const browser = await puppeteer.launch({
    defaultViewport: false,
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url);

  await page.exposeFunction("printMe", async (playerNumber) => {
    console.log(playerNumber);
    try {
      const response = await axios.post("http://localhost:3000/", {
        // Add any data you want to send in the request body
        playerNumber: playerNumber,
        otherData: "some value",
        url: url,
      });

      // Handle the response if needed
      console.log("POST request successful:", response.data);
    } catch (error) {
      // Handle any errors that occur during the POST request
      console.error("Error sending POST request:", error.message);
    }
  });

  await page.exposeFunction("getPlayerNumber", (playerTagClassName) => {
    console.log(`playerTagClassName is ${playerTagClassName}`);
    const classNameTokens = playerTagClassName.split(" ");
    return Promise.resolve(classNameTokens[1]);
  });

  const playerData = await page.evaluate(async () => {
    const playerTags = Array.from(
      document.querySelectorAll(".seats .table-player")
    ).filter((playerTag) => !playerTag.className.includes("table-player-seat"));

    for (const playerTag of playerTags) {
      if (!playerTag.className.includes("table-player-seat")) {
        const playerNumber = await getPlayerNumber(playerTag.className);

        const observer = new MutationObserver(async (mutations) => {
          for (const mutation of mutations) {
            if (mutation.type == "childList" || mutation.type == "subtree") {
              // Perform POST request here

              await printMe(playerNumber);
            }
          }
        });

        observer.observe(playerTag, { childList: true, subtree: true });
      }
    }
  });
}

run();
