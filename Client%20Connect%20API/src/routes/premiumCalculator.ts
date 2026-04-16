import { Router } from "express";
import { calculatePremiumController } from "../controllers/premiumCalculator";

const router = Router();

// set routes
router.route("/premiumCalculator").post(calculatePremiumController);

export default router;
