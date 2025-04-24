import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export const loadEnv = (environmentName: string) => {
  const envPath = path.join(__dirname, `.env.${environmentName}`);
  if (!fs.existsSync(envPath)) {
    logger.error(
      `Archivo .env.${environmentName} no encontrado, error al leer las variables de entorno`
    );
    return;
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  // const loadedVars: Record<string, string> = {};

  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return;

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    process.env[key] = value;
    // loadedVars[key] = value;
  });

  // logger.info("Variables de entorno cargadas:");
  // Object.entries(loadedVars).forEach(([key, value]) => {
  //   logger.info(`${key} = ${value}`);
  // });
};
