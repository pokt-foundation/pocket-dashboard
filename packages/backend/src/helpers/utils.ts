import { Response, Request } from 'express'
import HttpError, { IContent } from '../errors/http-error'

export const errorHandler = () => (
  err: Error | HttpError,
  req: Request,
  res: Response,
  next
): void => {
  let code: number
  let body: IContent

  if (err instanceof HttpError) {
    code = Number(err.code)
    body = err.content
  }

  console.log(err, 'huh')

  res.status(code || 500).send(
    body || {
      errors: [
        {
          id: 'REQUEST_ERR',
          message: 'There was an error with your request',
        },
      ],
    }
  )
}
