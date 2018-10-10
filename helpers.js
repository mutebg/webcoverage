const sumRangeUsage = ranges => {
  return ranges.reduce((total, range) => {
    return total + range.end - range.start - 1;
  }, 0);
};

const mergeRanges = coverage => {
  const merged = coverage.reduce((obj, cover) => {
    if (obj[cover.url]) {
      obj[cover.url].ranges = [...obj[cover.url].ranges, ...cover.ranges];
    } else {
      obj[cover.url] = cover;
    }
    return obj;
  }, {});

  return Object.values(merged);
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
    usedPercent: usedPercent.toFixed(2),
    unusedPercent: unusedPercent.toFixed(2)
  };
};

const getViewport = vp => {
  const [w, h] = vp.split("x");
  return {
    width: Number(w),
    height: Number(h)
  };
};

module.exports = {
  format,
  sumRangeUsage,
  getViewport,
  mergeRanges
};
