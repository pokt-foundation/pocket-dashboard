import HttpStatus from "http-status-codes";

export default class HttpError extends Error {
  /**
   * request properties are incorrect
   */
  static BAD_REQUEST(content) {
    return new this(HttpStatus.BAD_REQUEST, content);
  }
  /**
   * user did not log in
   */
  static UNAUTHORIZED(content) {
    return new this(HttpStatus.UNAUTHORIZED, content);
  }
  /**
   * logged in user does not have access to the resource
   */
  static FORBIDDEN(content) {
    return new this(HttpStatus.FORBIDDEN, content);
  }
  /**
   * non existing resource
   */
  static NOT_FOUND(content) {
    return new this(HttpStatus.NOT_FOUND, content);
  }

  constructor(code, content) {
    super(`HTTP error ${code}`);
    this.name = "HttpError";
    this.code = code;
    this.content = content;
  }
}
