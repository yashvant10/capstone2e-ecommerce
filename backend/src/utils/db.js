const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readCollection(name) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const file = filePath(name);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]", "utf-8");
  }
  const raw = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCollection(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readCollection, writeCollection };
