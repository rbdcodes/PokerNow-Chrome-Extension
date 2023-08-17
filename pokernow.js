const puppeteer = require("puppeteer");
const axios = require("axios");

let pastData = {};
const url = "https://www.pokernow.club/games/pglPG8z9-28wCrb8Q33bZBY7r";

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
          const endOfHand = mutation.removedNodes.length > 0 ? true : false;

          printMe2(
            "removed nodes: " +
              mutation.removedNodes[0].innerText +
              " endofHand: " +
              endOfHand
          );

          //code is probs getting stuck here
          let lastCommunityCardDealtDiv = "";
          let numberOfCommunityCards = "";

          if (endOfHand === true) {
            printMe2("end of hand");
          } else {
            lastCommunityCardDealtDiv = mutation.addedNodes[0].previousSibling;
            numberOfCommunityCards = mutation.target.childNodes.length;
          }

          if (!lastCommunityCardDealtDiv) {
            getCurrentPlayer(true); //pf -> flop
          } else if (numberOfCommunityCards > 3) {
            getCurrentPlayer(false); //flop -> turn, turn -> river
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
