import * as fs from "node:fs";
import * as path from "node:path";
import { createSampleData, processCSVFile } from "./transformClasses";

async function main() {
  try {
    createSampleData();
    console.log("Created sample data");

    const inputPath = path.join(__dirname, "data", "users.csv");
    const outputPath = path.join(__dirname, "data", "users_transformed.csv");

    await processCSVFile(inputPath, outputPath);
    console.log("CSV transformation complete");

    console.log("\n--- Output ---");
    const result = fs.readFileSync(outputPath, "utf8");
    console.log(result);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();