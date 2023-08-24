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
        console.log(
          mutation.target.parentNode.parentNode.parentNode.className +
            ": " +
            mutation.target.nodeValue +
            ", " +
            mutation.oldValue
        );

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
          console.log("hand ended during preflop");
        } else if (handEndedPostFlop) {
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
  const playerTags = Array.from(
    document.querySelectorAll(".seats .table-player")
  ).filter((playerTag) => !playerTag.className.includes("table-player-seat"));

  for (const playerTag of playerTags) {
    if (
      !playerTag.className.includes("table-player-seat") &&
      !observedElements.has(playerTag)
    ) {
      observedElements.add(playerTag);
      const playerNumber = await getPlayerNumber(playerTag.className);
      // console.log(playerNumber);

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
                const playerBetTagToSearchFor = `.${playerNumber} .table-player-bet-value`;
                const betValueTag = document.querySelector(
                  playerBetTagToSearchFor
                );

                console.log(`${playerNumber} bets ${betValueTag.innerText}`);
              }
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

  // observer.observe(containerDiv, { childList: true });

  console.log("click");
});

async function getPlayerNumber(playerTagClassName) {
  const classNameTokens = playerTagClassName.split(" ");
  return Promise.resolve(classNameTokens[1]);
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
