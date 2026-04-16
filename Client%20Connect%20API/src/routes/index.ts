import { Router } from "express";

import onboarding from "./onboarding";
import vopd from "./vopdRoutes";
import edit from "./edit";
import brokerscheme from "./brokerscheme";
import supportDocuments from "./supportingDocumentsRoutes";
import benefitsRouter from "./benefitRoutes";
import auth0routes from "./auth0routes";
import AppMetaData from "./AppMetaData";
import notifications from "./notifications";
import brokers from "./brokers";
import brokerLeadsRoutes from "./brokerLeadsRoutes";
import tasks from "./tasksRoutes";
import rules from "./rules";
import premiumCalculator from "./premiumCalculator";
import user from "./user";
// import mailerTest from "./mailerTest";

const router = Router();

// load all routes
router.use("/broker/leads", brokerLeadsRoutes);

router.use([
  vopd,
  onboarding,
  edit,
  brokerscheme,
  supportDocuments,
  benefitsRouter,
  auth0routes,
  AppMetaData,
  notifications,
  brokers,
  tasks,
  rules,
  premiumCalculator,
  user,
  // mailerTest,
]);

export default router;
