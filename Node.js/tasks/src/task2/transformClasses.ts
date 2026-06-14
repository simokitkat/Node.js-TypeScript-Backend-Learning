import { Transform } from "node:stream";
import * as fs from "node:fs";
import * as path from "node:path";
import { capitalizeName, normalizeEmail, formatPhone, standardizeDate } from "./helpers";

export class CSVParser extends Transform {
  private buffer = "";
  private headers: string[] = [];
  private isFirstLine = true;

  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk: Buffer, _encoding: string, callback: Function) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop()!;

    lines.forEach((line, index) => {
      if (line.trim() === "") return;

      if (this.isFirstLine) {
        this.headers = line.split(",").map((h) => h.trim());
        this.isFirstLine = false;
        return;
      }

      const values = line.split(",").map((v) => v.trim());
      const record: Record<string, string> = {};
      this.headers.forEach((header, i) => {
        record[header] = values[i] || "";
      });
      this.push(record);
    });

    callback();
  }

  _flush(callback: Function) {
    if (this.buffer.trim() !== "" && !this.isFirstLine) {
      const values = this.buffer.split(",").map((v) => v.trim());
      const record: Record<string, string> = {};
      this.headers.forEach((header, i) => {
        record[header] = values[i] || "";
      });
      this.push(record);
    }
    callback();
  }
}

export class DataTransformer extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk: Record<string, string>, _encoding: string, callback: Function) {
    const transformed: Record<string, string> = {
      name: capitalizeName(chunk.name),
      email: normalizeEmail(chunk.email),
      phone: formatPhone(chunk.phone),
      birthdate: standardizeDate(chunk.birthdate),
      city: capitalizeName(chunk.city),
    };
    this.push(transformed);
    callback();
  }
}

export class CSVWriter extends Transform {
  private headers: string[] = ["name", "email", "phone", "birthdate", "city"];
  private isFirst = true;

  constructor() {
    super({ writableObjectMode: true });
  }

  _transform(chunk: Record<string, string>, _encoding: string, callback: Function) {
    if (this.isFirst) {
      this.push(this.headers.join(",") + "\n");
      this.isFirst = false;
    }
    const values = this.headers.map((header) => chunk[header]);
    this.push(values.join(",") + "\n");
    callback();
  }
}

export function createSampleData() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sampleData = `name,email,phone,birthdate,city
john doe,JOHN.DOE@EXAMPLE.COM,1234567890,12/25/1990,new york
jane smith,Jane.Smith@Gmail.Com,555-123-4567,1985-03-15,los angeles
bob johnson,BOB@TEST.COM,invalid-phone,03/22/1992,chicago
alice brown,alice.brown@company.org,9876543210,1988/07/04,houston`;

  fs.writeFileSync(path.join(dataDir, "users.csv"), sampleData);
}

export function processCSVFile(
  inputPath: string,
  outputPath: string
) {
  const input = path.resolve(inputPath);
  const output = path.resolve(outputPath);

  const readStream = fs.createReadStream(input, { encoding: "utf8" });
  const writeStream = fs.createWriteStream(output);

  const parser = new CSVParser();
  const transformer = new DataTransformer();
  const writer = new CSVWriter();

  return new Promise<void>((resolve, reject) => {
    readStream
      .on("error", (err) => reject(new Error(`Read error: ${err.message}`)))
      .pipe(parser)
      .on("error", (err) => reject(new Error(`Parse error: ${err.message}`)))
      .pipe(transformer)
      .on("error", (err) => reject(new Error(`Transform error: ${err.message}`)))
      .pipe(writer)
      .on("error", (err) => reject(new Error(`Write error: ${err.message}`)))
      .pipe(writeStream)
      .on("finish", () => resolve())
      .on("error", (err) => reject(new Error(`Output write error: ${err.message}`)));
  });
}