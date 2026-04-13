import { Router } from "express";
import {createLead,updateLeadById,deleteLeadById,getLeadById,getAllLeads} from "../controllers/lead.controller";

const router = Router();

router.route("/leads").post(createLead).get(getAllLeads);
router.route("/leads/:id").get(getLeadById).patch(updateLeadById).delete(deleteLeadById);

export default router;