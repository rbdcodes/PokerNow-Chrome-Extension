const { text } = require("express");
const puppeteer = require("puppeteer");

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      "https://www.pokernow.club/games/pglpMEniw6iPcnd16UlSSaZfM#"
    );

    // Add your actions here
    const checkEndedAction = await page.evaluate(async () => {
      const logButtonTag = document.querySelector(
        ".button-1.show-log-button.small-button.dark-gray"
      );

      logButtonTag.click();

      // Add a 1-second delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const textLogTag = document.querySelector(
        ".modal-overlay .log-modal-body .log-modal-entries"
      );

      // Get the first 5 child nodes
      const firstFiveChildNodes = Array.from(textLogTag.childNodes).slice(
        0,
        10
      );

      // Create an array from the innerHTML of the first 5 child nodes
      const textArray = firstFiveChildNodes.map((node) => node.className);

      let lastActionClass = "No player";

      //identify where board is and return next index
      //log behavior isnt dterministic since its asynchronous, so index of last action is dynamic
      for (let i = 0; i < textArray.length; i++) {
        //space necessary class is " entry-ctn" not "entry-ctn"
        if (textArray[i] === " entry-ctn") {
          lastActionClass = textArray[i + 1];
          break;
        }
      }

      const checkEndedAction = lastActionClass.includes("entry-check");

      return checkEndedAction;
    });

    console.log(`Did check end action? ${checkEndedAction}`);
    await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
