import fs from "fs";
import path from "path";

const configPath = path.join(__dirname, "../paypal.keys.txt");

export function loadPayPalConfig() {
  const file = fs.readFileSync(configPath, "utf-8");
  const lines = file.split("\n");

  const config: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const [key, ...rest] = trimmed.split("=");
    config[key] = rest.join("=");
  }

  return config;
}
