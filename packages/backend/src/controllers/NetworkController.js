import express from "express";
import Chain from "models/Blockchains";
import NetworkData from "models/NetworkData";
import ApplicationPool from "models/PreStakedApp";
import asyncMiddleware from "middlewares/async";
import { authenticate } from "middlewares/passport-auth";

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
        ticker,
        network,
        nodeCount,
      }) {
        const isAvailableForStaking = await ApplicationPool.exists({
          chain: _id,
        });

        return {
          id: _id,
          ticker,
          network,
          nodeCount,
          isAvailableForStaking,
        };
      })
    );

    res.status(200).send({ chains: processedChains });
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

    const { _id, ...networkData } = latestNetworkData;

    res.status(200).send({ summary: networkData });
  })
);

export default router;
