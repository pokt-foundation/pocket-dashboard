import HttpError from "../errors/http-error";

export default () => (): void => {
  throw HttpError.NOT_FOUND({
    errors: [{ id: "NOT_FOUND", message: "Not found" }],
  });
};
