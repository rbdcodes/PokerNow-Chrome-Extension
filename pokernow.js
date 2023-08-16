const puppeteer = require("puppeteer");
const axios = require("axios");

let pastData = {};
const url = "https://www.pokernow.club/games/pglpMEniw6iPcnd16UlSSaZfM";

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
        playerNumber: playerNumber,
        otherData: "some value",
        url: url,
      });

      console.log("POST request successful:", response.data);
    } catch (error) {
      console.error("Error sending POST request:", error.message);
    }
  });

  await page.exposeFunction("getCurrentPlayer", async (isFlop) => {
    try {
      const response = await axios.post("http://localhost:3000/currentPlayer", {
        playerNumber: 1,
        otherData: "some value",
        url: url,
        isFlop: isFlop,
      });

      console.log("POST request successful: ", response.data);
    } catch (error) {
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
              const classMutationOriginatedFrom =
                mutation.target.parentNode.parentNode.parentNode.classList;

              if (classMutationOriginatedFrom.contains("table-player-stack")) {
                const oldStackSize = mutation.oldValue;
                const currentStackSize = mutation.target.nodeValue;

                //make sure callback comes from bet, not player winning pot
                if (oldStackSize > currentStackSize) {
                  await printMe(playerNumber);
                }
              }
            } else if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              const divElementToSeeIfPlayerChecked =
                mutation.target.childNodes.item(2).classList;

              const targetElement = mutation.target;
              const classList = targetElement.getAttribute("class");
              if (
                classList.includes("fold") &&
                !classList.includes("decision-current")
              ) {
                printMe2(playerNumber + " has folded");
              } else if (divElementToSeeIfPlayerChecked.contains("check")) {
                printMe2(playerNumber + " has checked");
              }
            }
          }
        });

        observer.observe(playerTag, {
          childList: true,
          subtree: true,
          characterData: true,
          characterDataOldValue: true,
          attributes: true,
          attributeFilter: ["class"],
        });
      }
    }
  });

  //add mutationObserver to board
  const testTag = await page.evaluate(async () => {
    const runOutTag = document.querySelector(".table .table-cards.run-1");

    const observer = new MutationObserver(async (mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          printMe2("first: " + mutation.addedNodes[0].textContent);
          const lastCommunityCardDealtDiv =
            mutation.addedNodes[0].previousSibling;
          const numberOfCommunityCards = mutation.target.childNodes.length;
          if (!lastCommunityCardDealtDiv) {
            printMe2("flop");

            getCurrentPlayer(true);
          } else if (numberOfCommunityCards > 3) {
            printMe2("post flop");

            getCurrentPlayer(false);
          }
        }
      }
    });

    observer.observe(runOutTag, {
      childList: true,
    });
  });
}

run();
