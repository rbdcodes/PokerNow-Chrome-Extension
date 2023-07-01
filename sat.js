const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch({
    defaultViewport: false,
    headless: false,
    //saves cookies for saving captcha
  });

  const page = await browser.newPage();
  await page.goto("https://dispatch-pro.urgent.ly/#/login");
  console.log("1");

  await fillOutFormInputs(page);
  await clickFormLoginButton(page);
}

async function clickFormLoginButton(page) {
  await page.evaluate(() => {
    const buttonTag = document.querySelector(
      ".form-horizontal.ng-pristine.ng-valid.ng-valid-email .form-group.mb0 div input"
    );
    buttonTag.click();
  });
  console.log("Button clicked!");
}

async function fillOutFormInputs(page) {
  await page.evaluate(() => {
    const inputFields = document.querySelectorAll(
      ".form-horizontal.ng-pristine.ng-valid.ng-valid-email .col-sm-12.col-md-12.col-xs-12.new_textbox div"
    );

    inputFields.forEach((divElement) => {
      const ngModel = divElement
        .querySelector("input")
        ?.getAttribute("ng-model");

      if (ngModel === "login.username") {
        divElement.querySelector("input").value = "rodney.deransburg@gmail.com";
      } else if (ngModel === "login.password") {
        console.log("here");
        divElement.querySelector("input").value = "password";
      }
    });
  });

  console.log("Form Filled out");
}

run();
