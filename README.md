# PokerNow-Chrome-Extension
This is a chrome extension for the popular poker platform, pokernow.club.

The goal of this app is to display the past betting actions from players in real time.

This is useful for multitabling or remembering what your opponents did online.

![pokerAppdemo](https://github.com/rbdcodes/PokerNow-Chrome-Extension/assets/70783787/e861ecf7-273d-4e98-a34c-dcd2ae97446d)

<h2> How To Navigate Repo </h2>
The UI folder contains the content script for the chrome extension and the primary code for the extension.

The pokernow.js and POSTpoker.js were prior implementations that didn't make the final product.

Those files utilized Puppeteer JS, Node JS, and Express to navigate the DOM of pokernow.

However, I found that using chrome extension content scripts, reduced latency significantly when scraping data from DOM so I ultimately swapped the final product to chrome.

I didn't want to scrap the hard work though, so the old artifacts remain to show the development of the overall project.

You'll find all your important information in UI/content.js & styles.css

<h2> How The Project Works</h2>
The project runs off of mutationObservers that trigger callback functions when specific div elements change.


Workflow is simple: 
<ul>
  <li> Identify when player takes action</li>
  <li> Add appropriate action type under player tag</li>
  <li> Reset all player tags when hand ends</li>
  <li> Scan for all players in table, and add mutationObservers to them if not added already</li>
</ul>

