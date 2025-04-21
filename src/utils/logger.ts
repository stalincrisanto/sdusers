import { format, createLogger, transports } from "winston";

const now = new Date();
const date = now.toISOString().split("T")[0];
const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");;
const fileName = `resultado-proceso-${date}_${time}.log`;

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  })
);

export const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.Console(),
    // new transports.File({ filename: `C:\\AN-test\\process-result-${currentDate}.log` }),
    new transports.File({ filename: `D:\\${fileName}` }),
  ],
});
