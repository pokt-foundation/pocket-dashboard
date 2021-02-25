import express from "express";
import NetworkService from "services/NetworkService";
import asyncMiddleware from "middlewares/async";

const router = express.Router();

const networkService = new NetworkService();

/**
 * Get info for all chains.
 */
router.get(
  "/chains",
  asyncMiddleware(async (req, res) => {
    const chains = await networkService.getAvailableNetworkChains();

    res.json(chains);
  })
);

/**
 * Get network summary data.
 */
router.get(
  "/summary",
  asyncMiddleware(async (req, res) => {
    const networkData = await networkService.getNetworkSummaryData();

    res.json(networkData);
  })
);

export default router;
