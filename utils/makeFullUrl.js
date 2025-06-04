const makeFullUrl = (relPath) => {
  if (!relPath) return relPath;
  if (/^https?:\/\//.test(relPath)) return relPath;
  return `${process.env.BACKEND_URL}${relPath}`;
};

module.exports = makeFullUrl;
