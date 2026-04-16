import { Router } from "express";
import newBrokerRoutes from "./newBrokerRoutes";

const router = Router();

//broker scheme routes
router.use("/brokerage", [newBrokerRoutes]);

export default router;
