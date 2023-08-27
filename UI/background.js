// // chrome.runtime.onConnect.addListener((port) => {
// //   console.log("connected ", port);

// //   if (port.name === "hi") {
// //     port.onMessage.addListener(this.processMessage);
// //   }
// // });

// chrome.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     console.log("webRequest V");
//     console.log(details);
//     if (details.method === "POST") {
//       console.log("hello");
//     }
//   },
//   { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
//   ["requestBody"]
// );

// chrome.tabs.onActivated.addListener(function (tab) {
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     var activeTab = tabs[0];
//     console.log(activeTab);

//     chrome.tabs.sendMessage(
//       activeTab.id,
//       { msg: "yo backgorund" },
//       (response) => {
//         console.log(response);
//       }
//     );
//   });
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(message);
//   sendResponse({ message: "response from background js" });
// });
