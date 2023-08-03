const puppeteer = require("puppeteer");
const axios = require("axios");

let pastData = {};
const url = "https://www.pokernow.club/games/pglSuDf-VkjAg-7QIEWYooL8E";

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

      //
      // console.log("Past successful request:", pastData.data);

      // pastData = response;

      // Handle the response if needed
      console.log("POST request successful:", response.data);
    } catch (error) {
      // Handle any errors that occur during the POST request
      console.error("Error sending POST request:", error.message);
    }
  });

  await page.exposeFunction("printMe2", (yup) => {
    console.log(yup);
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
            if (mutation.type == "characterData") {
              // const targetElement = mutation.target; //might be crashing cuz mutation.target is diff
              // const classList = targetElement.getAttribute("class");
              printMe2("charData: " + mutation.target.textContent); //ahhh its also recognizing changes from chip stack
              await printMe(playerNumber);

              // if (!classList.includes("winner")) {

              // }
            } else if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              // Perform POST request here
              const targetElement = mutation.target;
              const classList = targetElement.getAttribute("class");
              if (
                classList.includes("fold") &&
                !classList.includes("decision-current")
              ) {
                printMe2("attribute2");
                printMe2(playerNumber + " has folded");
              }
            }
          }
        });

        observer.observe(playerTag, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ["class"],
        });
      }
    }
  });
}

run();
