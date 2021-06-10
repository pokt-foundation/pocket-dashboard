import express, { Response, Request } from 'express'
import Chain from '../models/Blockchains'
import NetworkData from '../models/NetworkData'
import ApplicationPool from '../models/PreStakedApp'
import asyncMiddleware from '../middlewares/async'
import { authenticate } from '../middlewares/passport-auth'

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
export default router
