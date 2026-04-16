import { Router } from "express";
import policyRoutes from "./policiesRoutes";
import policyNoteRoutes from "./policyNoteRoutes";
import policyDataRoutes from "./policyDataRoutes";
import benefits from "./benefits";

const router = Router();

// onboarding routes
router.use("/edit", [
  policyDataRoutes,
  policyRoutes,
  policyNoteRoutes,
  benefits,
]);

export default router;
