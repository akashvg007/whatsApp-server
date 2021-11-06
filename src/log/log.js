import fs from "fs";

function appendZeroToLength(value, length) {
  return `${value}`.padStart(length, 0);
}

function getDateAsText() {
  const now = new Date();
  const nowText =
    appendZeroToLength(now.getUTCFullYear(), 4) +
    "." +
    appendZeroToLength(now.getUTCMonth() + 1, 2) +
    "." +
    appendZeroToLength(now.getUTCDate(), 2) +
    ", " +
    appendZeroToLength(now.getUTCHours(), 2) +
    ":" +
    appendZeroToLength(now.getUTCMinutes(), 2) +
    ":" +
    appendZeroToLength(now.getUTCSeconds(), 2) +
    "." +
    appendZeroToLength(now.getUTCMilliseconds(), 4) +
    " UTC";
  return nowText;
}

function logToFile(text, file) {
  // Define file name.
  const filename = file !== undefined ? file : "default.log";

  // Define log text.
  const logText = getDateAsText() + " -> " + text + "\r\n";

  // Save log to file.
  fs.appendFile(filename, logText, "utf8", function (error) {
    if (error) {
      // If error - show in console.
      console.log(getDateAsText() + " -> " + error);
    }
  });
}

export default logToFile;
