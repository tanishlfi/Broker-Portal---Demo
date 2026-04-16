import { Router } from "express";
import { mailerTest } from "../controllers/mailerTest";

const router = Router();

// set routes
router.route("/testEmail").post(mailerTest);

export default router;
