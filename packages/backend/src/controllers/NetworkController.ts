import express, { Response, Request } from 'express'
import { GraphQLClient } from 'graphql-request'
import { APPLICATION_STATUSES } from '../application-statuses'
import env from '../environment'
import { getSdk } from '../graphql/types'
import Chain from '../models/Blockchains'
import NetworkData from '../models/NetworkData'
import ApplicationPool from '../models/PreStakedApp'
import asyncMiddleware from '../middlewares/async'
import { authenticate } from '../middlewares/passport-auth'
import { composeDaysFromNowUtcDate } from '../lib/date-utils'

const router = express.Router()

router.use(authenticate)
/**
 * Get info for all chains.
 */
router.get(
  '/chains',
  asyncMiddleware(async (_: Request, res: Response) => {
    const chains = await Chain.find({ nodeCount: { $exists: true } })

    const processedChains = await Promise.all(
      chains.map(async function processChain({
        _id,
        ticker,
        network,
        description,
        nodeCount,
      }) {
        const isAvailableForStaking = await ApplicationPool.exists({
          chain: _id,
          status: APPLICATION_STATUSES.SWAPPABLE,
        })

        return {
          id: _id,
          ticker,
          network,
          description,
          nodeCount,
          isAvailableForStaking,
        }
      })
    )

    res.status(200).send({ chains: processedChains })
  })
)

router.get(
  '/stakeable-chains',
  asyncMiddleware(async (_: Request, res: Response) => {
    const chains = await Chain.find()
    const existentChains = await Promise.all(
      chains.map(async function filterChain({ _id }) {
        const exists = await ApplicationPool.exists({
          chain: _id,
          status: APPLICATION_STATUSES.SWAPPABLE,
        })

        return exists
      })
    )
    const processedChains = chains.filter((_, i) => existentChains[i])
    const formattedChains = processedChains.map(function processChain({
      _id,
      ticker,
      network,
      description,
      nodeCount,
    }) {
      return {
        id: _id,
        ticker,
        network,
        description,
        nodeCount,
        isAvailableForStaking: true,
      }
    })

    res.status(200).send({ chains: formattedChains })
  })
)

router.get(
  '/summary',
  asyncMiddleware(async (_: Request, res: Response) => {
    const latestNetworkData = await NetworkData.findOne(
      {},
      {},
      { sort: { createdAt: -1 } }
    )

    res.status(200).send({
      summary: {
        appsStaked: latestNetworkData.appsStaked,
        nodesStaked: latestNetworkData.nodesStaked,
        poktStaked: latestNetworkData.poktStaked,
      },
    })
  })
)

router.get(
  '/daily-relays',
  asyncMiddleware(async (_: Request, res: Response) => {
    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const networkRelays = await gqlClient.getDailyNetworkRelays()

    res.status(200).send(networkRelays.relays_daily)
  })
)

router.get(
  '/weekly-successful-relays',
  asyncMiddleware(async (_: Request, res: Response) => {
    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const sevenDaysAgo = composeDaysFromNowUtcDate(8)
    const yesterday = composeDaysFromNowUtcDate(1)

    const networkRelays = await gqlClient.getTotalSuccessfulNetworkRelays({
      _gte: sevenDaysAgo,
      _lte: yesterday,
    })

    res
      .status(200)
      .send(networkRelays.relay_nodes_hourly_aggregate.aggregate.sum)
  })
)

router.get(
  '/total-weekly-relays',
  asyncMiddleware(async (_: Request, res: Response) => {
    const gqlClient = getSdk(
      new GraphQLClient(env('HASURA_URL') as string, {
        // @ts-ignore
        headers: {
          'x-hasura-admin-secret': env('HASURA_SECRET'),
        },
      })
    )

    const sevenDaysAgo = composeDaysFromNowUtcDate(8)
    const yesterday = composeDaysFromNowUtcDate(1)

    const networkRelays = await gqlClient.getTotalNetworkRelays({
      _gte: sevenDaysAgo,
      _lte: yesterday,
    })

    res
      .status(200)
      .send(networkRelays.relay_nodes_hourly_aggregate.aggregate.sum)
  })
)

export default router
