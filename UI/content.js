const elem = document.createElement("div");
elem.classList.add("actionContainer");
const addButton = document.createElement("button");
addButton.textContent = "add";
addButton.id = "addButton";

elem.appendChild(addButton);

const observedElements = new Set();
let lastPlayerActionType = "N/A";

window.onload = function () {
  // Your code here
  console.log("yum");
  let containerDiv = document.querySelector(".table-player.table-player-1");
  containerDiv.appendChild(elem);

  //find pot
  const potTag = document.querySelector(".table-pot-size");

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type == "characterData") {
        // add way to recognize action ending check here
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

        const mutationComesFromNormalValue =
          mutation.target.parentNode.className.includes("normal-value");

        if (handEndedPreflop && mutationComesFromNormalValue) {
          addObserverToPlayerTags();
          console.log("hand ended during preflop");
          console.log(
            `mutation: ${mutation.target.nodeValue} mutationClass: ${mutation.target.parentNode.className}`
          );
        } else if (handEndedPostFlop && mutationComesFromNormalValue) {
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

  const boardRunOutTag = document.querySelector(".table-cards.run-1");

  //add another mutation observer here to recogniize when cards are added
  const communityCardObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type == "childList") {
        const endOfHand = mutation.removedNodes.length > 0 ? true : false;

        let lastCommunityCardDealtDiv = "";
        let numberOfCommunityCards = "";

        if (endOfHand === false) {
          console.log(`last action is: ${lastPlayerActionType}`);

          lastCommunityCardDealtDiv = mutation.addedNodes[0].previousSibling;
          numberOfCommunityCards = mutation.target.childNodes.length;
        }

        if (numberOfCommunityCards > 3 && lastPlayerActionType === "check") {
          const playerWhoEndedAction = getLastPlayerInPosition();
          console.log(`${playerWhoEndedAction} ended action with check`);
        }
      }
    }
  });

  communityCardObserver.observe(boardRunOutTag, {
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

function getLastPlayerInPosition() {
  const playerTags = document.querySelectorAll(".seats .table-player");

  const playerTagsArray = Array.from(playerTags).filter(
    (player) =>
      !player.className.includes("table-player-seat") &&
      !player.className.includes("fold")
  );

  let pLength = playerTagsArray.length;

  //in case first person is current decision, can always track last person (person who checked)
  let lastPlayer = playerTagsArray.at(pLength - 1).className;
  let currentPlayerTag = "test";

  for (let i = 0; i < pLength; i++) {
    const cPlayer = playerTagsArray.at(i).className;
    if (cPlayer.includes("decision-current")) {
      currentPlayerTag = lastPlayer;
      break;
    }
    lastPlayer = playerTagsArray.at(i).className;
  }

  const currentPlayerNameTokens = currentPlayerTag.split(" ");
  const playerNumber = currentPlayerNameTokens[1];
  return playerNumber;
}

function addObserverToPlayerTags() {
  const playerTags = Array.from(
    document.querySelectorAll(".seats .table-player")
  ).filter((playerTag) => !playerTag.className.includes("table-player-seat"));

  for (const playerTag of playerTags) {
    if (!playerTag.className.includes("table-player-seat")) {
      const playerNumber = getPlayerNumber(playerTag.className);
      if (!observedElements.has(playerNumber)) {
        console.log(`playerTag for mutationObserver is ${playerNumber} `);
        observedElements.add(playerNumber);

        const observer = new MutationObserver((mutations) => {
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
                lastPlayerActionType = "fold";
                console.log(playerNumber + " has folded");
              } else if (classList.includes("winner")) {
                console.log(playerNumber + " has won, hand ended");
              } else if (
                divElementToSeeIfPlayerChecked.includes("check") &&
                !classList.includes("decision-current")
              ) {
                lastPlayerActionType = "check";
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
}

let mostRecentBetOrRaisePercentage = -1;
function getPlayerActionAndPrintToConsole(mutation, playerNumber) {
  const classMutationOriginatedFrom =
    mutation.target.parentNode.parentNode.parentNode.classList;

  if (
    classMutationOriginatedFrom.contains("table-player-stack") &&
    mutation.target.parentNode.className.includes("normal-value")
  ) {
    const oldStackSize = mutation.oldValue;
    const currentStackSize = mutation.target.nodeValue;

    //make sure callback comes from bet, not player winning pot
    if (oldStackSize > currentStackSize) {
      const playerBetTagToSearchFor = `.${playerNumber} .table-player-bet-value`;
      const betValueTag = document.querySelector(playerBetTagToSearchFor);
      const betValue = betValueTag.innerText;

      const actionType = determineIfBetRaiseOrcall(playerNumber, betValue);
      lastPlayerActionType = actionType.actionType; //global variable for recognizing action ending checks

      const isPostflop = determineStreet();
      const lastPlayerBet = actionType.lastPlayerBet;
      const mainPot = scrapeMainPot();
      const totalPot = scrapeTotalPot();

      if (isPostflop) {
        if (actionType.actionType === "raises") {
          const deadMoney = calculateDeadMoney(
            lastPlayerBet,
            betValue,
            totalPot
          );

          const raisePercentage = calculateRaisePercentage(
            deadMoney,
            betValue,
            lastPlayerBet
          );

          mostRecentBetOrRaisePercentage = raisePercentage;
          console.log(`${playerNumber} raises by ${raisePercentage}%`);
        } else if (actionType.actionType === "bets") {
          const betAmount = parseInt(totalPot) - parseInt(mainPot);
          const betPercentageOfPot = Math.round((betAmount / mainPot) * 100);

          mostRecentBetOrRaisePercentage = betPercentageOfPot;
          console.log(`${playerNumber} bets by ${betPercentageOfPot}%`);
        } else if (actionType.actionType === "calls") {
          console.log(
            `${playerNumber} calls ${mostRecentBetOrRaisePercentage}%`
          );
        }
      } else {
        console.log(
          `mutation comes from: ${mutation.target.parentNode.className}`
        );
        console.log(
          `${playerNumber} ${actionType.actionType} ${betValueTag.innerText} isPostflop: ${isPostflop}`
        );
      }
    }
  }
}

function calculateRaisePercentage(deadMoney, betValue, lastPlayerBet) {
  deadMoney = deadMoney.includes("BB")
    ? getValueFromBBTag(deadMoney)
    : deadMoney;
  const raiseAmount = parseInt(betValue) - parseInt(lastPlayerBet);
  const raisePercentage = (raiseAmount / deadMoney) * 100;
  return Math.round(raisePercentage);
}

function getValueFromBBTag(BBTag) {
  const inputString = BBTag;
  const regex = /(\d+)([A-Za-z]+)/;

  const matches = inputString.match(regex);

  if (matches) {
    const numericPart = matches[1];
    const stringPart = matches[2];

    console.log("Numeric Part:", numericPart); // Output: 30
    console.log("String Part:", stringPart); // Output: BB

    return numericPart;
  } else {
    console.log("String format not recognized.");
    return "failed conversion";
  }
}

function scrapeMainPot() {
  const mainPotTag = document.querySelector(".table-pot-size .main-value");
  const mainPotValue = mainPotTag.innerText;
  return mainPotValue;
}

function scrapeTotalPot() {
  const totalPotTag = document.querySelector(".add-on-container .chips-value");
  const totalPotValue = totalPotTag.innerText;
  return totalPotValue;
}

function calculateDeadMoney(lastPlayerBet, betValue, totalPot) {
  lastPlayerBet = lastPlayerBet === "N/A" ? 0 : lastPlayerBet;
  const raiseAmount = parseInt(betValue) - parseInt(lastPlayerBet);
  const deadMoneyWithCall = parseInt(totalPot) - raiseAmount;
  return deadMoneyWithCall;
}

function determineStreet() {
  const communityCardsTag = document.querySelector(".table-cards.run-1");
  const numberOfCommunityCards = communityCardsTag.childElementCount;
  return numberOfCommunityCards > 0;
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

  return { actionType: actionType, lastPlayerBet: lastBetValue };
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
