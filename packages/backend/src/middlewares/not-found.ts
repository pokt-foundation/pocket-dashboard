import HttpError from "../errors/http-error";

export default () => (req, res, next) => {
  throw HttpError.NOT_FOUND({ errors: [{ status: "Not found" }] });
};
