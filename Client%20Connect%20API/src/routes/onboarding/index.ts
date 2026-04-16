import { Router } from "express";
import ruleRoutes from "./ruleRoutes";
import productTypeRoutes from "./productTypeRoutes";
import filesRoutes from "./filesRoutes";
import policyRoutes from "./policiesRoutes";
import tableHistoryRoutes from "./tableHistoryRoutes";
import reportsRoutes from "./reportsRoutes";

const router = Router();

// onboarding routes
router.use("/onboarding", [
  productTypeRoutes,
  filesRoutes,
  policyRoutes,
  ruleRoutes,
  tableHistoryRoutes,
  reportsRoutes,
]);

export default router;
