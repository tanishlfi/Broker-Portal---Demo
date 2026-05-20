import { Router } from "express";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  cancelLead,
  getLeadHistory,
} from "../controllers/brokerLeadsController";
import { saveQuoteToLead } from "../controllers/brokerQuotesController";
import { 
  validateCreateLead, 
  validateUpdateLead, 
  validateCancelLead 
} from "../middleware/brokerPortal.middleware";

const router = Router();

router.post("/", validateCreateLead, createLead);
router.get("/", getLeads);
router.get("/:leadId", getLeadById);
router.patch("/:leadId", validateUpdateLead, updateLead);
router.post("/:leadId/cancel", validateCancelLead, cancelLead);
router.get("/:leadId/history", getLeadHistory);
router.post("/:leadId/quote", saveQuoteToLead);

export default router;
