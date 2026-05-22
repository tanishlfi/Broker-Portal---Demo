import { Router } from "express";
import { getAuditLogs } from "../controllers/auditController";

const router = Router();

router.get("/logs", getAuditLogs);

export default router;
