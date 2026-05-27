import { Router } from "express";
import { 
  brokerImportEmployeesController, 
  getEmployeesController, 
  updateEmployeeController,
  deleteEmployeeController,
  addSingleEmployeeController 
} from "../controllers/brokerEmployeeImportController";
import { validateBrokerEmployeeImport } from "../middleware/brokerPortal.middleware";

const router = Router();

router.post("/import", validateBrokerEmployeeImport, brokerImportEmployeesController);
router.post("/:leadId/add", addSingleEmployeeController);
router.get("/:leadId", getEmployeesController);
router.patch("/:leadId/:employeeId", updateEmployeeController);
router.delete("/:leadId/:employeeId", deleteEmployeeController);

export default router;
