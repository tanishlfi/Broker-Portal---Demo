import { Router } from "express";
import { getTableHistory } from "../../controllers/tableHistory";

const router = Router();

// set routes
router.route("/history/:tableId").get(getTableHistory);

export default router;
