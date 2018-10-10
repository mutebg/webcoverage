const puppeteer = require("puppeteer");
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const prettyBytes = require("pretty-bytes");

const helpers = require("./helpers");
const { format, getViewport, mergeRanges } = helpers;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(bodyParser.json({ limit: "1mb" }));
const staticPath = path.join(__dirname, "./static");
app.use(express.static(staticPath));

const defaultViewport = [1280, 960];

app.post("/api", async (req, res) => {
  const viewports = req.body.viewports.map(getViewport) || [defaultViewport];

  const pages = req.body.pages.split("\n");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const covarageOptions = {
    resetOnNavigation: false
  };

  await Promise.all([
    page.coverage.startJSCoverage(covarageOptions),
    page.coverage.startCSSCoverage(covarageOptions)
  ]);

  // Navigate to pages

  for (let url of pages) {
    const [firstVP, ...restVP] = viewports;
    const { width, height } = firstVP;
    await page.setViewport({ width, height });
    await page.goto(url);
    for (let viewport of restVP) {
      const { width, height } = viewport;
      await page.setViewport({ width, height });
    }
  }

  // Disable both JavaScript and CSS coverage
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage()
  ]);

  const formatCSS = format("css");
  const formatJS = format("JS");

  const coverage = [...jsCoverage.map(formatJS), ...cssCoverage.map(formatCSS)]
    .sort((a, b) => b.unusedBytesTotal - a.unusedBytesTotal)
    .map(item => ({
      ...item,
      totalBytes: prettyBytes(item.totalBytes),
      usedBytesTotal: prettyBytes(item.usedBytesTotal),
      unusedBytesTotal: prettyBytes(item.unusedBytesTotal)
    }));

  res.json(coverage);
  await browser.close();
});

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

const port = process.env.NODE_PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
