const puppeteer = require("puppeteer");
const fs = require("fs");

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://traversymedia.com");

  // const title = await page.evaluate(() => document.title);

  // const text = await page.evaluate(() => document.body.innerText);

  //Array.from creates shallow copy from an iterable object, like an array list.
  //querySelectorAll returns a Node List
  // const links = await page.evaluate(() =>
  //   Array.from(document.querySelectorAll("a"), (element) => element.href)
  // );

  // const courseLinks = await page.evaluate(() =>
  //   Array.from(document.querySelectorAll("#cscourses .card"), (element) => ({
  //     title: element.querySelector(".card-body h3").innerText,
  //     level: element.querySelector(".card-body .level").innerText,
  //     link: element.querySelector(".card-footer a").href,
  //   }))
  // );

  const courses = await page.$$eval("#cscourses .card", (elements) =>
    elements.map((e) => ({
      title: e.querySelector(".card-body h3").innerText,
      level: e.querySelector(".card-body .level").innerText,
      link: e.querySelector(".card-footer a").href,
    }))
  );

  console.log(courses);

  // Save Data to JSON file
  fs.writeFile("courses.json", JSON.stringify(courses), (err) => {
    if (err) throw err;
    console.log("File Saved");
  });

  await browser.close();
}

run();
