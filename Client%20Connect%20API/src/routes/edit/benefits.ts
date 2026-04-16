import { editsAllocateBenefits } from "../../controllers/rulesControllers";
import { Router } from "express";

const router = Router();

router.route("/benefits/allocate").post(editsAllocateBenefits);

export default router;
