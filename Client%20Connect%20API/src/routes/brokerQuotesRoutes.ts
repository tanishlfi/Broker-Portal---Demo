import { Router } from "express";
import {
  generateQuickQuote,
  generateFullQuote,
  repriceQuote,
  getQuoteDetail,
  downloadQuoteDocument,
  saveQuoteToLead,
  getQuotesByLeadController,
  updateQuoteStatusController,
} from "../controllers/brokerQuotesController";

const router = Router();

router.post("/quick", generateQuickQuote);
router.post("/full", generateFullQuote);
router.post("/:quoteReference/reprice", repriceQuote);
router.get("/:quoteReference", getQuoteDetail);
router.get("/:quoteReference/document", downloadQuoteDocument);

// Note: Requirement says POST /api/leads/{leadReference}/quote
// This is handled in brokerLeadsRoutes.ts or here depending on preference.
// I'll add it here as well or just ensure it's in leads.
router.post("/save-to-lead/:leadReference", saveQuoteToLead);

router.get("/lead/:leadId", getQuotesByLeadController);
router.patch("/:quoteId/status", updateQuoteStatusController);

export default router;
