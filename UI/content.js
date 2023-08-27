const actionContainer = document.createElement("div");
actionContainer.classList.add("actionContainer");
const addButton = document.createElement("button");
addButton.textContent = "add";
addButton.id = "addButton";

actionContainer.appendChild(addButton);

addButton.addEventListener("click", async () => {
  console.log("clickk");

  addActionToPlayerBar("table-player-6", "street", "");

  console.log("-------");
});

function addActionToPlayerBar(playerNumber, actionType, actionValue) {
  const parentElement = document.querySelector(`.${playerNumber}`);

  const hasActionChildren =
    parentElement.querySelector(".actionContainer") !== null;

  if (!hasActionChildren) {
    const newActionContainer = document.createElement("div");
    newActionContainer.classList.add("actionContainer");
    parentElement.appendChild(newActionContainer);
  }

  const playerActionContainer = parentElement.querySelector(".actionContainer");

  const actionClass = `${actionType}Element`;
  let actionTypeText = getActionText(actionType);

  const actionDiv = document.createElement("div");
  const actionText = `${actionTypeText} ${actionValue}`;
  actionDiv.textContent = actionText;
  actionDiv.classList.add(actionClass);

  playerActionContainer.appendChild(actionDiv);
}

function getActionText(actionType) {
  if (actionType == "check") {
    return "X";
  } else if (actionType == "street") {
    return "||";
  }
  return actionType.charAt(0).toUpperCase();
}

const observedElements = new Set();
let lastPlayerActionType = "N/A";

window.onload = function () {
  // Your code here
  console.log("yum");
  let containerDiv = document.querySelector(".table-player.table-player-1");
  containerDiv.appendChild(actionContainer);

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
          clearActionTagsFromAllPlayers();
        } else if (handEndedPostFlop && mutationComesFromNormalValue) {
          addObserverToPlayerTags();
          console.log("hand ended from postFlop");
          clearActionTagsFromAllPlayers();
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
          lastCommunityCardDealtDiv = mutation.addedNodes[0].previousSibling;
          numberOfCommunityCards = mutation.target.childNodes.length;
        }

        if (numberOfCommunityCards > 3 && lastPlayerActionType === "check") {
          const playerWhoEndedAction = getLastPlayerInPosition();
          addActionToPlayerBar(playerWhoEndedAction, "check", "");
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

  const observerForDetermingStreetChanges = new MutationObserver(
    (mutations) => {
      for (const mutation of mutations) {
        if (mutation.type == "childList") {
          const endOfHand = mutation.removedNodes.length > 0 ? true : false;
          const addedNodes = mutation.addedNodes;

          let lastCommunityCardDealtDiv = "";
          let numberOfCommunityCards = "";

          if (endOfHand === false) {
            lastCommunityCardDealtDiv = mutation.addedNodes[0].previousSibling;
            numberOfCommunityCards = mutation.target.childNodes.length;

            const lastCard = lastCommunityCardDealtDiv
              ? lastCommunityCardDealtDiv.innerText
              : "N/A";

            if (lastCard == "N/A") {
              console.log(" ");
              console.log("Entered Flop");
              console.log(" ");
              addStreetTagToAllPlayersInHand();
            } else if (numberOfCommunityCards > 3) {
              console.log(" ");
              console.log("Next Street");
              console.log(" ");
              addStreetTagToAllPlayersInHand();
            }
          }
        }
      }
    }
  );

  observerForDetermingStreetChanges.observe(boardRunOutTag, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
    attributes: true,
    attributeFilter: ["class"],
  });
};

function addStreetTagToAllPlayersInHand() {
  const playerTags = document.querySelectorAll(".seats .table-player");

  const playerTagsArray = Array.from(playerTags).filter(
    (player) =>
      !player.className.includes("table-player-seat") &&
      !player.className.includes("fold")
  );

  let pLength = playerTagsArray.length;

  for (let i = 0; i < pLength; i++) {
    const cPlayer = playerTagsArray.at(i).className;
    const playerNumber = getPlayerNumber(cPlayer);
    console.log(`adding action to ${playerNumber}`);
    addActionToPlayerBar(playerNumber, "street", "");
  }
}

function clearActionTagsFromAllPlayers() {
  const playerTags = document.querySelectorAll(".seats .table-player");

  const playerTagsArray = Array.from(playerTags).filter(
    (player) => !player.className.includes("table-player-seat")
  );

  let pLength = playerTagsArray.length;

  for (let i = 0; i < pLength; i++) {
    const cPlayer = playerTagsArray.at(i).className;
    const playerNumber = getPlayerNumber(cPlayer);
    console.log(`adding action to ${playerNumber}`);
    clearActionsFromPlayerBar(playerNumber);
  }
}

function clearActionsFromPlayerBar(playerNumber) {
  const parentElement = document.querySelector(`.${playerNumber}`);

  const hasActionChildren =
    parentElement.querySelector(".actionContainer") !== null;

  if (!hasActionChildren) {
    const newActionContainer = document.createElement("div");
    newActionContainer.classList.add("actionContainer");
    parentElement.appendChild(newActionContainer);
  }

  const playerActionContainer = parentElement.querySelector(".actionContainer");
  playerActionContainer.innerHTML = ""; //clear children
}

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
                addActionToPlayerBar(playerNumber, "fold", "");
              } else if (classList.includes("winner")) {
                clearActionTagsFromAllPlayers();
                console.log(playerNumber + " has won, hand ended");
              } else if (
                divElementToSeeIfPlayerChecked.includes("check") &&
                !classList.includes("decision-current")
              ) {
                lastPlayerActionType = "check";
                console.log(playerNumber + " has checked");
                addActionToPlayerBar(playerNumber, "check", "");
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
      const betValue = parseFloat(betValueTag.innerText);

      const actionType = determineIfBetRaiseOrcall(playerNumber, betValue);
      lastPlayerActionType = actionType.actionType; //global variable for recognizing action ending checks

      const isPostflop = determineStreet();
      const lastPlayerBet = parseFloat(actionType.lastPlayerBet);
      const mainPot = parseFloat(scrapeMainPot());
      const totalPot = parseFloat(scrapeTotalPot());

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
          addActionToPlayerBar(playerNumber, "raises", `${raisePercentage}%`);
        } else if (actionType.actionType === "bets") {
          const betAmount = totalPot - mainPot;
          const betPercentageOfPot = Math.round((betAmount / mainPot) * 100);

          mostRecentBetOrRaisePercentage = betPercentageOfPot;
          console.log(`${playerNumber} bets by ${betPercentageOfPot}%`);
          addActionToPlayerBar(playerNumber, "bets", `${betPercentageOfPot}%`);
        } else if (actionType.actionType === "calls") {
          console.log(
            `${playerNumber} calls ${mostRecentBetOrRaisePercentage}%`
          );
          addActionToPlayerBar(
            playerNumber,
            "calls",
            `${mostRecentBetOrRaisePercentage}%`
          );
        }
      } else {
        console.log(
          `${playerNumber} ${actionType.actionType} ${betValueTag.innerText} isPostflop: ${isPostflop}`
        );
        addActionToPlayerBar(
          playerNumber,
          actionType.actionType,
          betValueTag.innerText
        );
      }
    }
  }
}

function calculateRaisePercentage(deadMoney, betValue, lastPlayerBet) {
  const raiseAmount = betValue - lastPlayerBet;
  const raisePercentage = (raiseAmount / deadMoney) * 100;
  return Math.round(raisePercentage);
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
  const raiseAmount = betValue - lastPlayerBet;
  const deadMoneyWithCall = totalPot - raiseAmount;
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

  const newBetValue = parseFloat(newBet);

  let actionType = "";

  if (lastBetValue.includes("check")) {
    actionType = "bets";
  } else if (lastBetValue == "N/A") {
    actionType = "bets";
  } else if (newBetValue > parseFloat(lastBetValue)) {
    actionType = "raises";
  } else if (parseFloat(lastBetValue) == newBetValue) {
    actionType = "calls";
  }

  return { actionType: actionType, lastPlayerBet: lastBetValue };
}

function getPlayerNumber(playerTagClassName) {
  const classNameTokens = playerTagClassName.split(" ");
  return classNameTokens[1];
}

// chrome.runtime.sendMessage({ message: "testtt from content" }, (response) => {
//   console.log(`from runTime sendMessage: ${response.message}`);
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(`From onMessage!: ${message}`);
//   // const newComponent = document.createElement("div");
//   // newComponent.className = "component27";
//   // newComponent.textContent = "lul";
//   // elem.appendChild(newComponent);

//   sendResponse({ message: "response from content js" });
// });
