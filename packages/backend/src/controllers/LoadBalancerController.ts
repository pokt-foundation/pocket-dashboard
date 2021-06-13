import express, { Response, Request } from 'express'
import { GraphQLClient } from 'graphql-request'
import env from '../environment'
import { getSdk } from '../graphql/types'
import asyncMiddleware from '../middlewares/async'
import { authenticate } from '../middlewares/passport-auth'
import { composeSevenDaysUtcDate } from '../lib/date-utils'

const router = express.Router()

// router.use(authenticate)

router.get(
  '/total-relays/:lbId',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { lbId } = req.params
    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const sevenDaysAgo = composeSevenDaysUtcDate()

    const result = gqlClient.getTotalRelaysAndLatency({
      _eq: applicationId,
      _gte: sevenDaysAgo,
    })
  })
)

export default router
