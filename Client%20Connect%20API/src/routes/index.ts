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
import brokerQuotesRoutes from "./brokerQuotesRoutes";
import brokerOtpRoutes from "./brokerOtpRoutes";
import brokerEmployeeRoutes from "./brokerEmployeeRoutes";
import productCatalog from "./productCatalogRoutes";
import tasks from "./tasksRoutes";
import rules from "./rules";
import premiumCalculator from "./premiumCalculator";
import user from "./user";
// import mailerTest from "./mailerTest";
import { requireBrokerRep } from "../middleware/auth";

const router = Router();

// load all routes
router.use("/broker/leads", requireBrokerRep, brokerLeadsRoutes);
router.use("/broker/quotes", requireBrokerRep, brokerQuotesRoutes);
router.use("/broker/otp", requireBrokerRep, brokerOtpRoutes);
router.use("/broker/employees", requireBrokerRep, brokerEmployeeRoutes);
router.use("/product",requireBrokerRep, productCatalog);

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
