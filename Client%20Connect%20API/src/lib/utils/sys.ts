import { tryCatch } from "../functional-types/either";
import fs from "fs";
import path from "path";

const bufferedString = fs.readFileSync(path.resolve("./", ".env.json"));
const config = JSON.parse(bufferedString.toString());

const convertConfigToString = () =>
  tryCatch(fs.readFileSync(path.resolve("./", ".env.json")));
// .fold(e => 1433, config => config.toString())

export { config, convertConfigToString };
