import { Router } from "express";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  cancelLead,
  continueLead,
  getLeadHistory,
  uploadEmployeesController,
} from "../controllers/brokerLeadsController";
import fileUpload from "express-fileupload";
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
router.post("/:leadId/upload-employees", fileUpload(), uploadEmployeesController);

export default router;
