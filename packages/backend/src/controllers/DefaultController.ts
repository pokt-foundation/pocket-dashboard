import express, { Response, Request } from "express";

const router = express.Router();

router.get("", (_: Request, res: Response) => {
  res
    .status(200)
    .send(
      "Please visit <a href='https://dashboard.pokt.network/'>https://dashboard.pokt.network</a>"
    );
});

export default router;
