import express from "express";
import NetworkService from "services/NetworkService";
import { apiAsyncWrapper } from "helpers/utils";

const router = express.Router();

const networkService = new NetworkService();

/**
 * Get info for all chains.
 */
router.get(
  "/chains",
  apiAsyncWrapper(async (req, res) => {
    const chains = await networkService.getAvailableNetworkChains();

    res.json(chains);
  })
);

/**
 * Get network summary data.
 */
router.get(
  "/summary",
  apiAsyncWrapper(async (req, res) => {
    const networkData = await networkService.getNetworkSummaryData();

    res.json(networkData);
  })
);

export default router;
