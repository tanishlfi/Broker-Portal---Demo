import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  generateQuickQuote,
  generateFullQuote,
  repriceQuote,
  downloadQuoteDocument,
  saveQuoteToLead,
  getQuotesByLeadController,
  getQuotesByRepresentativeController,
  getQuoteByIdController,
  updateQuoteStatusController,
  saveEmployerOnboardingDetails,
} from "../controllers/brokerQuotesController";

const router = Router();

router.post("/quick", generateQuickQuote);
router.post("/full", fileUpload(), generateFullQuote);
router.post("/:quoteId/reprice", repriceQuote);
router.get("/:quoteId/document", downloadQuoteDocument);

router.post("/save-to-lead/:leadReference", saveQuoteToLead);

router.get("/lead/:leadId", getQuotesByLeadController);
router.get("/representative/:representativeId", getQuotesByRepresentativeController);
router.get("/:quoteId", getQuoteByIdController);
router.patch("/:quoteId/status", updateQuoteStatusController);
router.post("/:quoteId/employer-details", saveEmployerOnboardingDetails);

export default router;
