const path = require("node:path");

console.log("ABSOLUTE PATH OF THE FILE", __filename);
console.log("ABSOLUTE PATH OF THE DIRECTORY", __dirname);

const fileBaseName = path.basename(__filename);
const directoryBaseName = path.basename(__dirname);
console.log("FILE BASE NAME WITHOUT ANY PATH ATTACHED TO IT", fileBaseName);
console.log(
  "DIRECTORY BASE NAME WITHOUT ANY PATH ATTACHED TO IT",
  directoryBaseName,
);

const fileExtensionName = path.extname(__filename);
console.log("FILE EXTENSION NAME", fileExtensionName);

const parsedDetails = path.parse(__filename);
console.log("PARSED DETAILS OF THE FILE", parsedDetails);

const formattedPath = path.format(parsedDetails);
console.log("FORMATTED PATH", formattedPath);

const isAbsolute = path.isAbsolute(__filename);
console.log("IS ABSOLUTE PATH", isAbsolute);
console.log("IS ABSOLUTE PATH", path.isAbsolute("./data.json"));

// normalizing paths using join
console.log(
  "ADDING UNIX SEPARATOR TO CHECK ON WINDOWS",
  path.join("/folder1", "//folder2", "../index.html"),
);
console.log(
  "ADDING WINDOWS SEPARATOR TO CHECK ON UNIX",
  path.join("\\folder1", "\\\\\\\\folder2", "\\index.html"),
);

// normalizing paths as absolute  paths using resolve
console.log(
  "ABSOLUTE PATH USING RESOLVE",
  path.resolve("folder1", "folder2", "index.html"),
);

// normalizing paths using normalize
console.log(
  "NORMALIZE A path using normalize",
  path.normalize("/folder1//folder2/index.html"),
);
