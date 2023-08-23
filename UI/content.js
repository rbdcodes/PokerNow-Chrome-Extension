// const elem = document.createElement("div");
// // elem.appendChild(document.createTextNode("test"));
// elem.classList.add("actionContainer");

// const addButton = document.createElement("button");
// addButton.textContent = "add";
// addButton.id = "addButton";

// const action2 = document.createElement("div");
// action2.textContent = "lul";
// action2.classList.add("component27");

// const action1 = document.createElement("div");
// action1.textContent = "lul";
// action1.classList.add("component27");

// addButton.addEventListener("click", () => {
//   const newComponent = document.createElement("div");
//   newComponent.className = "component27";
//   newComponent.textContent = "lul";
//   elem.appendChild(newComponent);
// });

// elem.appendChild(addButton);
// elem.appendChild(action1);
// elem.appendChild(action2);

// window.onload = function () {
//   // Your code here
//   console.log("yum");
//   let containerDiv = document.querySelector(".table-player.table-player-1");

//   containerDiv.appendChild(elem);
// };
// chrome.runtime.onConnect.addListener((port) => {
//   console.log("connected ", port);

//   if (port.name === "hi") {
//     port.onMessage.addListener(this.processMessage);
//   }
// });

chrome.runtime.sendMessage({ message: "testtt from content" }, (response) => {
  console.log(response.message);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  sendResponse({ message: "response from content js" });
});
