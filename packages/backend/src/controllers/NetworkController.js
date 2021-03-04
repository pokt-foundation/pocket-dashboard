import express from "express";
import Chain from "models/Blockchains";
import NetworkData from "models/NetworkData";
import asyncMiddleware from "middlewares/async";

const router = express.Router();

/**
 * Get info for all chains.
 */
router.get(
  "/chains",
  asyncMiddleware(async (req, res) => {
    const chains = await Chain.find();

    res.status(200).send({ chains });
  })
);

router.get(
  "/summary",
  asyncMiddleware(async (req, res) => {
    const latestNetworkData = await NetworkData.findOne(
      {},
      { sort: { $natural: -1 } }
    );

    res.status(200).send({ summary: latestNetworkData });
  })
);

export default router;