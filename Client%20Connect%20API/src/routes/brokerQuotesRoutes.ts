import { Router } from "express";
import fileUpload from "express-fileupload";
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
router.post("/full", fileUpload(), generateFullQuote);
router.post("/:quoteReference/reprice", repriceQuote);
router.get("/:quoteReference", getQuoteDetail);
router.get("/:quoteReference/document", downloadQuoteDocument);

router.post("/save-to-lead/:leadReference", saveQuoteToLead);

router.get("/lead/:leadId", getQuotesByLeadController);
router.patch("/:quoteId/status", updateQuoteStatusController);

export default router;
