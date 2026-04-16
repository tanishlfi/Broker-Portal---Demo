import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

// Ensure log directory exists
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
} catch (error) {
  console.error(`Failed to create logs directory: ${error.message}`);
  // Re-throw if application cannot continue without logging
  throw new Error(`Logger initialization failed: ${error.message}`);
}

export function logToFile(type, data) {
  try {
    if (!type || typeof type !== "string") {
      throw new Error("Log type must be a non-empty string");
    }

    const timestamp = new Date().toISOString();
    const logFile = path.join(
      logDir,
      `${type}-${new Date().toISOString().split("T")[0]}.log`,
    );

    const logEntry = `${timestamp} - ${JSON.stringify(data, null, 2)}\n\n`;

    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
    // Optionally, you could write to a fallback location or use console.log as last resort
    console.log(`Fallback log entry: ${type} - ${JSON.stringify(data)}`);
  }
}
