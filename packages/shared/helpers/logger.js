const chalk = require("chalk");

const DEFAULTS = {
  verbose: false,
  silent: true,
};

class Logger {
  constructor(actor, color = "white") {
    this.actor = actor;
    this.color = color;
  }

  info(msg) {
    if (!DEFAULTS.verbose) return;
    this.log(msg, "️  ", "white");
  }

  success(msg) {
    this.log(msg, "✅", "green");
  }

  warn(msg) {
    this.log(msg, "⚠️ ", "yellow");
  }

  error(msg) {
    this.log(msg, "🚨", "red");
  }

  log(msg, emoji, color = "white") {
    if (DEFAULTS.silent) return;
    let formattedMessage = chalk.keyword(color)(
      `${emoji}  ${this._stringify(msg)}`
    );
    if (DEFAULTS.verbose) {
      const formatedPrefix = chalk.keyword(this.color)(`[${this.actor}]`);
      formattedMessage = `${formatedPrefix} ${formattedMessage}`;
    }
    console.error(formattedMessage);
  }

  _stringify(obj) {
    return typeof obj === "object" ? JSON.stringify(obj) : obj.toString();
  }
}

module.exports = (actor, color) => new Logger(actor, color);

module.exports.Logger = Logger;

module.exports.setDefaults = (silent, verbose) => {
  DEFAULTS.silent = silent;
  DEFAULTS.verbose = verbose;
};
