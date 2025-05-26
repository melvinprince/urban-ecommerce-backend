// backend/utils/fileHelper.js

const getFullImageUrl = (relPath) => {
  const baseUrl = process.env.BACKEND_URL || "";
  if (!relPath) return "";
  return `${baseUrl}${relPath.startsWith("/") ? "" : "/"}${relPath}`;
};

module.exports = { getFullImageUrl };
