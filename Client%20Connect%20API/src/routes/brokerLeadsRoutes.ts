import { Router } from "express";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  cancelLead,
  continueLead,
  getLeadHistory,
} from "../controllers/brokerLeadsController";
import { saveQuoteToLead } from "../controllers/brokerQuotesController";

const router = Router();

router.post("/", createLead);
router.get("/", getLeads);
router.get("/:leadId", getLeadById);
router.put("/:leadId", updateLead);
router.patch("/:leadId", updateLead);
router.get("/:leadId/continue", continueLead);
router.post("/:leadId/cancel", cancelLead);
router.get("/:leadId/history", getLeadHistory);
router.post("/:leadId/quote", saveQuoteToLead);

export default router;
