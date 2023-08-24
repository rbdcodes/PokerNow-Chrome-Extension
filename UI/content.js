const elem = document.createElement("div");
elem.classList.add("actionContainer");
const addButton = document.createElement("button");
addButton.textContent = "add";
addButton.id = "addButton";

elem.appendChild(addButton);

const observedElements = new Set();

window.onload = function () {
  // Your code here
  console.log("yum");
  let containerDiv = document.querySelector(".table-player.table-player-1");
  containerDiv.appendChild(elem);

  //find pot
  const potTag = document.querySelector(".table-pot-size");

  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      if (mutation.type == "characterData") {
        const potClassName =
          mutation.target.parentNode.parentNode.parentNode.className;

        const communityCardsTag = document.querySelector(".table-cards.run-1");
        const numberOfCommunityCards = communityCardsTag.childElementCount
          ? communityCardsTag.childNodes.length
          : -1;

        const handEndedPreflop =
          potClassName.includes("add-on") &&
          numberOfCommunityCards == -1 &&
          mutation.target.nodeValue == 0;

        const handEndedPostFlop =
          potClassName.includes("main-value") && mutation.target.nodeValue == 0;

        if (handEndedPreflop) {
          addObserverToPlayerTags();
          console.log("hand ended during preflop");
        } else if (handEndedPostFlop) {
          addObserverToPlayerTags();
          console.log("hand ended from postFlop");
        }
      }
    }
  });

  observer.observe(potTag, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
    attributes: true,
    attributeFilter: ["class"],
  });
};

addButton.addEventListener("click", async () => {
  console.log("clickk");
  let tagsForPlayersInHand = Array.from(
    document.querySelectorAll(".seats .table-player")
  ).filter(
    (playerTag) =>
      !playerTag.className.includes("table-player-seat") &&
      !playerTag.className.includes("fold")
  );

  const classNamesArray = tagsForPlayersInHand.map(
    (playerTag) => playerTag.className
  );

  const playerWhoBet = "table-player-7";
  let lastPlayerWhoBet = "";
  for (let i = 0; i < classNamesArray.length; i++) {
    if (classNamesArray[i].includes(playerWhoBet)) {
      lastPlayerWhoBet =
        i == 0
          ? classNamesArray[tagsForPlayersInHand.length - 1]
          : classNamesArray[i - 1];
    }
  }

  console.log(lastPlayerWhoBet);

  console.log("-------");
});

function addObserverToPlayerTags() {
  const playerTags = Array.from(
    document.querySelectorAll(".seats .table-player")
  ).filter((playerTag) => !playerTag.className.includes("table-player-seat"));

  for (const playerTag of playerTags) {
    if (
      !playerTag.className.includes("table-player-seat") &&
      !observedElements.has(playerTag)
    ) {
      observedElements.add(playerTag);
      const playerNumber = getPlayerNumber(playerTag.className);

      const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
          if (mutation.type == "characterData") {
            getPlayerActionAndPrintToConsole(mutation, playerNumber);
          } else if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            const divElementToSeeIfPlayerChecked = //looking for checks
              mutation.target.childNodes.length > 2
                ? mutation.target.childNodes.item(2).className
                : "N/A";

            const targetElement = mutation.target;
            const classList = targetElement.getAttribute("class"); // for looking for folds/winners

            if (
              classList.includes("fold") &&
              !classList.includes("decision-current")
            ) {
              console.log(playerNumber + " has folded");
            } else if (classList.includes("winner")) {
              console.log(playerNumber + " has won, hand ended");
            } else if (
              divElementToSeeIfPlayerChecked.includes("check") &&
              !classList.includes("decision-current")
            ) {
              console.log(playerNumber + " has checked");
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
}

function getPlayerActionAndPrintToConsole(mutation, playerNumber) {
  const classMutationOriginatedFrom =
    mutation.target.parentNode.parentNode.parentNode.classList;

  if (classMutationOriginatedFrom.contains("table-player-stack")) {
    const oldStackSize = mutation.oldValue;
    const currentStackSize = mutation.target.nodeValue;

    //make sure callback comes from bet, not player winning pot
    if (oldStackSize > currentStackSize) {
      const playerBetTagToSearchFor = `.${playerNumber} .table-player-bet-value`;
      const betValueTag = document.querySelector(playerBetTagToSearchFor);
      const betValue = betValueTag.innerText;

      const actionType = determineIfBetRaiseOrcall(playerNumber, betValue);

      console.log(`${playerNumber} ${actionType} ${betValueTag.innerText}`);
    }
  }
}

function determineIfBetRaiseOrcall(playerWhoJustBet, newBet) {
  let tagsForPlayersInHand = Array.from(
    document.querySelectorAll(".seats .table-player")
  ).filter(
    (playerTag) =>
      !playerTag.className.includes("table-player-seat") &&
      !playerTag.className.includes("fold")
  );

  const classNamesArray = tagsForPlayersInHand.map(
    (playerTag) => playerTag.className
  );

  const playerWhoBet = playerWhoJustBet;
  let lastPlayerWhoBet = "";
  for (let i = 0; i < classNamesArray.length; i++) {
    if (classNamesArray[i].includes(playerWhoBet)) {
      lastPlayerWhoBet =
        i == 0
          ? classNamesArray[tagsForPlayersInHand.length - 1]
          : classNamesArray[i - 1];
    }
  }

  lastPlayerWhoBet = getPlayerNumber(lastPlayerWhoBet);

  //get last players bet
  const playerBetTagToSearchFor = `.${lastPlayerWhoBet} .table-player-bet-value`;
  const lastBetValueTag = document.querySelector(playerBetTagToSearchFor);

  const lastBetValue = lastBetValueTag ? lastBetValueTag.innerText : "N/A";

  const newBetValue = parseInt(newBet);

  let actionType = "";

  if (lastBetValue.includes("check")) {
    actionType = "bets";
  } else if (lastBetValue == "N/A") {
    actionType = "bets";
  } else if (newBetValue > parseInt(lastBetValue)) {
    actionType = "raises";
  } else if (parseInt(lastBetValue) == newBetValue) {
    actionType = "calls";
  }

  return actionType;
}

function getPlayerNumber(playerTagClassName) {
  const classNameTokens = playerTagClassName.split(" ");
  return classNameTokens[1];
}

chrome.runtime.sendMessage({ message: "testtt from content" }, (response) => {
  console.log(`from runTime sendMessage: ${response.message}`);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`From onMessage!: ${message}`);
  // const newComponent = document.createElement("div");
  // newComponent.className = "component27";
  // newComponent.textContent = "lul";
  // elem.appendChild(newComponent);

  sendResponse({ message: "response from content js" });
});
