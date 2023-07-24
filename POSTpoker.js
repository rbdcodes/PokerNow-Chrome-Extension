// app.js
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000; // You can change this to any port you want

// Middleware to parse JSON in the request body
app.use(express.json());

// Route handler for handling POST requests
app.post("/", async (req, res) => {
  try {
    const { url } = req.body;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Perform scraping using page.evaluate
    const data = await page.evaluate(() => {
      // Your scraping logic here
      // Example: Scrape the title of the page
      return document.title;
    });

    await browser.close();

    console.log("post request received");
    console.log("Scraped data:", data);

    res
      .status(200)
      .json({
        message: "Post request received and data scraped successfully",
        data,
      });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "Error occurred while processing the request" });
  }
});

// Define a route
app.get("/", (req, res) => {
  res.send("Hello World! This is my Express server.");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
