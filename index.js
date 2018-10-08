const puppeteer = require("puppeteer");

const pages = [
  "https://www.bggumi.com/",
  "https://www.bggumi.com/eshop/productinfo/1/325010220342030/"
];

const screenSizes = [[1280, 960], [375, 667]];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const covarageOptions = {
    resetOnNavigation: false
  };

  await Promise.all([
    page.coverage.startJSCoverage(covarageOptions),
    page.coverage.startCSSCoverage(covarageOptions)
  ]);

  // Navigate to page
  for (let screenSize of screenSizes) {
    const [width, height] = screenSize;
    for (let url of pages) {
      await page.setViewport({ width, height });
      await page.goto(url);
    }
  }

  // Disable both JavaScript and CSS coverage
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage()
  ]);

  const formatCSS = format("css");
  const formatJS = format("JS");

  const coverage = [
    ...jsCoverage.map(formatJS),
    ...cssCoverage.map(formatCSS)
  ].sort((a, b) => b.unusedPercent - b.unusedPercent);

  await browser.close();
})();

const sumRangeUsage = ranges => {
  return ranges.reduce((total, range) => {
    return total + range.end - range.start - 1;
  }, 0);
};

const format = type => ({ ranges, start, end, url, text }) => {
  const totalBytes = text.length;
  const usedBytesTotal = sumRangeUsage(ranges);
  const unusedBytesTotal = totalBytes - usedBytesTotal;
  const unusedPercent = totalBytes ? (unusedBytesTotal * 100) / totalBytes : 0;
  const usedPercent = 100 - unusedPercent;
  return {
    type,
    url,
    totalBytes,
    usedBytesTotal,
    unusedBytesTotal,
    usedPercent,
    unusedPercent
  };
};
