/**
 * @param {{query:object}} request Request.
 * @param {string} option Option.
 *
 * @returns {string} Query option value.
 */
export function getQueryOption(request, option) {
  const parsedData = request.query;

  // eslint-disable-next-line no-prototype-builtins
  if (!parsedData.hasOwnProperty(option)) {
    throw Error(`${option} query parameter is required.`);
  }

  if (parsedData[option] === undefined) {
    throw Error(`${option} query parameter cannot be null.`);
  }

  return parsedData[option];
}

/**
 * @param {{query:object}} request Request.
 * @param {string} option Option.
 *
 * @returns {string} Query option value.
 */
export function getOptionalQueryOption(request, option) {
  const parsedData = request.query;

  // eslint-disable-next-line no-prototype-builtins
  if (!parsedData.hasOwnProperty(option)) {
    return "";
  }

  if (parsedData[option] === undefined) {
    return "";
  }

  return parsedData[option];
}

/**
 * Handle API errors.
 *
 * @param {*} error Error to handler.
 * @param {*} req Request.
 * @param {*} res Response.
 * @param {*} next Next object.
 */
export function errorHandler(error, req, res, next) {
  const { message, name } = error;

  console.error(error);
  switch (error.name) {
    case "PocketNetworkError":
      console.error(`Name: ${name}, Message: ${message}`);
      res.status(408).json({ message, name }); // Request Timeout.
      break;
    case "DashboardError":
      console.error(`Name: ${name}, Message: ${message}`);
      break;
    case "DashboardValidationError":
      console.error(`Name: ${name}, Message: ${message}`);
      res.status(400).json({ message, name }); // Bad request.
      break;
    default:
      console.error(`Name: ${name}, Message: ${message}`);
      res.status(500).json({ message, name }); // Server Error.

      if (process.env.NODE_ENV === "development") {
        next(error);
      }
      break;
  }
  next();
}
