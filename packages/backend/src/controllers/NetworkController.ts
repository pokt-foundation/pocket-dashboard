import express from "express";
import Chain from "../models/Blockchains";
import NetworkData from "../models/NetworkData";
import ApplicationPool from "../models/PreStakedApp";
import asyncMiddleware from "../middlewares/async";
import { authenticate } from "../middlewares/passport-auth";
const router = express.Router();

router.use(authenticate);
/**
 * Get info for all chains.
 */
router.get(
  "/chains",
  asyncMiddleware(async (req, res) => {
    const chains = await Chain.find({ nodeCount: { $exists: true } });
    const processedChains = await Promise.all(
      chains.map(async function processChain({
        _id,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'ticker' does not exist on type 'Document... Remove this comment to see the full error message
        ticker,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'network' does not exist on type 'Documen... Remove this comment to see the full error message
        network,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'description' does not exist on type 'Doc... Remove this comment to see the full error message
        description,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'nodeCount' does not exist on type 'Docum... Remove this comment to see the full error message
        nodeCount,
      }) {
        const isAvailableForStaking = await ApplicationPool.exists({
          chain: _id,
        });

        return {
          id: _id,
          ticker,
          network,
          description,
          nodeCount,
          isAvailableForStaking,
        };
      })
    );

    res.status(200).send({ chains: processedChains });
  })
);
router.get(
  "/stakeable-chains",
  asyncMiddleware(async (req, res) => {
    const chains = await Chain.find();
    const existentChains = await Promise.all(
      chains.map(async function filterChain({ _id }) {
        const exists = await ApplicationPool.exists({
          chain: _id,
        });

        return exists;
      })
    );
    const processedChains = chains.filter((_, i) => existentChains[i]);
    const formattedChains = processedChains.map(function processChain({
      _id,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'ticker' does not exist on type 'Document... Remove this comment to see the full error message
      ticker,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'network' does not exist on type 'Documen... Remove this comment to see the full error message
      network,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'description' does not exist on type 'Doc... Remove this comment to see the full error message
      description,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'nodeCount' does not exist on type 'Docum... Remove this comment to see the full error message
      nodeCount,
    }) {
      return {
        id: _id,
        ticker,
        network,
        description,
        nodeCount,
        isAvailableForStaking: true,
      };
    });

    res.status(200).send({ chains: formattedChains });
  })
);
router.get(
  "/summary",
  asyncMiddleware(async (req, res) => {
    const latestNetworkData = await NetworkData.findOne(
      {},
      {},
      { sort: { createdAt: -1 } }
    );

    res.status(200).send({
      summary: {
        appsStaked: (latestNetworkData as any).appsStaked,
        nodesStaked: (latestNetworkData as any).nodesStaked,
        poktStaked: (latestNetworkData as any).poktStaked,
      },
    });
  })
);
export default router;
