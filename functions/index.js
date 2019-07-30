const functions = require("firebase-functions");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const prettyBytes = require("pretty-bytes");
const isUrlHttp = require("is-url-http");
const helpers = require("./helpers");
const { format, getViewport, mergeRanges } = helpers;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(bodyParser.json({ limit: "1mb" }));

const defaultViewport = [1280, 960];

app.post("/", async (req, res) => {
  try {
    // collect and validate input data
    const viewports = req.body.viewports.map(getViewport) || [defaultViewport];

    const pages = req.body.pages
      .split("\n")
      .filter(Boolean)
      .filter(isUrlHttp);

    if (pages.length === 0 || viewports.length === 0) {
      throw { message: "No URL or viewport" };
    }

    // run browser, open new tab, and start covarage
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
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

    // Stop coverage
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ]);

    // covert and format data
    const formatCSS = format("css");
    const formatJS = format("JS");

    const coverage = [
      ...jsCoverage.map(formatJS),
      ...cssCoverage.map(formatCSS)
    ].sort((a, b) => b.unusedBytesTotal - a.unusedBytesTotal);

    // some stupide dublicate code for calculating total wasted bites
    const total = coverage.reduce(
      (prev, curr) => {
        prev.totalBytes += curr.totalBytes;
        prev.usedBytesTotal += curr.usedBytesTotal;
        prev.unusedBytesTotal += curr.unusedBytesTotal;
        prev.unusedPercent = prev.totalBytes
          ? prev.unusedBytesTotal * 100 / prev.totalBytes
          : 0;
        prev.usedPercent = 100 - prev.unusedPercent;

        return prev;
      },
      { totalBytes: 0, usedBytesTotal: 0, unusedBytesTotal: 0, url: "TOTAL" }
    );

    coverage.push(total);

    const formatFn = item => ({
      ...item,
      totalBytes: prettyBytes(item.totalBytes),
      usedBytesTotal: prettyBytes(item.usedBytesTotal),
      unusedBytesTotal: prettyBytes(item.unusedBytesTotal)
    });

    const formated = coverage.map(formatFn);

    res.json(formated);
    await browser.close();
  } catch (e) {
    res.status(400);
    res.send(e);
    console.log(e);
  }
});

exports.api = functions.runWith({ memory: "1GB" }).https.onRequest(app);
