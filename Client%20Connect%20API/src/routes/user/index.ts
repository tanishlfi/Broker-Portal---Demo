import { Router } from "express";
import { getUserDashboard } from "../../controllers/UserDashboard";

const router = Router();

router.use("/dashboard", [getUserDashboard]);

export default router;
