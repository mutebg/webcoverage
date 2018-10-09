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
  getViewport
};
