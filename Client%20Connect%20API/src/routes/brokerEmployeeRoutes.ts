import { Router } from "express";
import { brokerImportEmployeesController } from "../controllers/brokerEmployeeImportController";
import { validateBrokerEmployeeImport } from "../middleware/brokerPortal.middleware";

const router = Router();

router.post("/import", validateBrokerEmployeeImport, brokerImportEmployeesController);

export default router;
