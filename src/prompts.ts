import * as fs from "fs";
import * as path from "path";


export const promptBasic = fs.readFileSync(
  path.join(__dirname, "prompts/basic_.txt"),
  "utf-8"
);
export const promptClaude = fs.readFileSync(
  path.join(__dirname, "prompts/claude.txt"),
  "utf-8"
);
 