import HttpStatus from "http-status-codes";

export interface IContent {
  errors: { id: string; message: string }[];
}

export default class HttpError extends Error {
  code: string | number;
  content: IContent;
  /**
   * request properties are incorrect
   */
  static BAD_REQUEST(content: IContent): HttpError {
    return new this(HttpStatus.BAD_REQUEST, content);
  }
  /**
   * user did not log in
   */
  static UNAUTHORIZED(content: IContent): HttpError {
    return new this(HttpStatus.UNAUTHORIZED, content);
  }
  /**
   * logged in user does not have access to the resource
   */
  static FORBIDDEN(content: IContent): HttpError {
    return new this(HttpStatus.FORBIDDEN, content);
  }
  /**
   * non existing resource
   */
  static NOT_FOUND(content: IContent): HttpError {
    return new this(HttpStatus.NOT_FOUND, content);
  }
  /**
   * non existing resource
   */
  static INTERNAL_SERVER_ERROR(content: IContent): HttpError {
    return new this(HttpStatus.INTERNAL_SERVER_ERROR, content);
  }

  constructor(code: string | number, content: IContent) {
    super(`HTTP error ${code}`);
    this.name = "HttpError";
    this.code = code;
    this.content = content;
  }
}
