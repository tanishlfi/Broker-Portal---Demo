import {
  addPolicyNote,
  getPolicyNotes,
  getPolicyNote,
  deletePolicyNote,
  updatePolicyNote,
} from "../../controllers/policyNotesController";
import { Router } from "express";

const router = Router();

router.route("/notes/:policyId").get(getPolicyNotes).post(addPolicyNote);

router
  .route("/notes/:policyId/:noteId")

  .get(getPolicyNote)
  .patch(updatePolicyNote)
  .delete(deletePolicyNote);

export default router;
