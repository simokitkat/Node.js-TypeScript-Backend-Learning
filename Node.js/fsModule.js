const fs = require("node:fs");
const path = require("node:path");

fs.writeFile(
  path.join(__dirname, "test.txt"),
  "Hello World2",
  { flag: "a" },
  (err) => {
    if (err) throw err;
    console.log("File created");
  },
);
