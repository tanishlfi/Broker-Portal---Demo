import { Router } from "express";
import {
  getVopdResponses,
  getPolicyErrors,
  getCurrentWorkload,
  getCurrentApproverWorkload,
} from "../../controllers/reports";

const router = Router();

// set routes
router.route("/reports/vopd").get(getVopdResponses);
router.route("/reports/policyErrors").get(getPolicyErrors);
router.route("/reports/workload").get(getCurrentWorkload);
router.route("/reports/approverWorkload").get(getCurrentApproverWorkload);

export default router;
