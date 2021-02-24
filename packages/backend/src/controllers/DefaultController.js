import express from "express";

const router = express.Router();

router.get("", (request, response) => {
  response.send(
    "Please visit <a href='https://dashboard.pokt.network/'>https://dashboard.pokt.network</a>"
  );
});

export default router;
