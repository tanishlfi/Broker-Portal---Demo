import { Router } from "express";
import {
  addBrokerSchemeNote,
  getAllBrokerSchemeNotes,
} from "../../controllers/brokerSchemeNotes";

const router = Router();

router
  .route("/scheme_notes/:scheme_id")
  .post(addBrokerSchemeNote)
  .get(getAllBrokerSchemeNotes);

export default router;
