import express from "express";
import NetworkService from "services/NetworkService";
import { apiAsyncWrapper } from "helpers/utils";

const router = express.Router();

const networkService = new NetworkService();

/**
 * Get all available network chains.
 */
router.get(
  "/chains",
  apiAsyncWrapper(async (req, res) => {
    const chains = await networkService.getAvailableNetworkChains();

    res.json(chains);
  })
);

/**
 * Get network chains from hashes.
 */
router.post(
  "/chains",
  apiAsyncWrapper(async (req, res) => {
    /** @type {{networkHashes: string[]}} */
    const data = req.body;

    const chains = await networkService.getAvailableNetworkChains();

    let results = [];

    // Filter the results
    data.networkHashes.forEach((hash) => {
      const chain = chains.find((chain) => chain._id === hash);

      if (chain) {
        results.push(chain);
      }
    });

    res.json(results);
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
