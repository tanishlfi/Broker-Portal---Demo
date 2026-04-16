import { Router } from "express";
import {
  singleVOPDRequest,
  astuteHealth,
  vopdProcessed,
} from "../controllers/vopd";

const router = Router();

// set routes
router.route("/vopd").post(singleVOPDRequest).get(vopdProcessed);
router.route("/vopd/health").get(astuteHealth);
// NOT USING THESE FOR NOW
// router.route("/callback/:TransRef").get(singleVOPDCallback);
// router.route("/v2").post(singleVOPDQ);

export default router;
