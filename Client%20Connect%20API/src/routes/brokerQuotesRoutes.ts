import { Router } from "express";
import {
  createQuoteController,
  getQuotesByLeadController,
  getQuoteByIdController,
  updateQuoteStatusController,
} from "../controllers/brokerQuotesController";

const router = Router();

router.post("/", createQuoteController);

router.get("/lead/:leadId", getQuotesByLeadController);

router.get("/:quoteId", getQuoteByIdController);

router.patch("/:quoteId/status", updateQuoteStatusController);

export default router;
