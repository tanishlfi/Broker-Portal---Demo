import { Router } from "express";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  cancelLead,
  continueLead,
} from "../controllers/brokerLeadsController";

const router = Router();

router.post("/", createLead);
router.get("/", getLeads);
router.get("/:leadId", getLeadById);
router.patch("/:leadId", updateLead);
router.post("/:leadId/cancel", cancelLead);
router.post("/:leadId/continue", continueLead);

export default router;
