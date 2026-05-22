import { Router } from "express";
import {
  generateQuickQuote,
  generateFullQuote,
  repriceQuote,
  downloadQuoteDocument,
  getQuotesByLeadController,
  getQuotesByRepresentativeController,
  getQuoteByIdController,
  updateQuote,
  saveEmployerOnboardingDetails,
} from "../controllers/brokerQuotesController";
import {
  validateQuickQuote,
  validateFullQuote,
  validateEmployerOnboarding
} from "../middleware/brokerPortal.middleware";

const router = Router();

router.post("/quick", validateQuickQuote, generateQuickQuote);
router.post("/full", validateFullQuote, generateFullQuote);
router.post("/:quoteId/reprice", repriceQuote);
router.get("/:quoteId/download", downloadQuoteDocument);
router.get("/lead/:leadId", getQuotesByLeadController);
router.get("/representative", getQuotesByRepresentativeController);
router.get("/:quoteId", getQuoteByIdController);
router.patch("/:quoteId", updateQuote);
router.post("/:quoteId/employer-details", validateEmployerOnboarding, saveEmployerOnboardingDetails);

export default router;
