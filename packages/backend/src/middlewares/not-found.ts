// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'errors/http-error' or its corr... Remove this comment to see the full error message
import HttpError from "@/errors/http-error";

export default () => (req, res, next) => {
  throw HttpError.NOT_FOUND({ errors: [{ status: "Not found" }] });
};
