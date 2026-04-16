import { Router } from "express";
import brokerSchemeRoutes from "./brokerSchemeRoutes";
import brokerSchemeRoleplayer from "./brokerSchemeRoleplayer";
import brokerSchemeBankingDetails from "./brokerSchemeBankingDetails";
import brokerSchemeAddress from "./brokerSchemeAddress";
import brokerSchemeFileupload from "./brokerSchemeFileUploads";
import brokerShemeNotes from "./brokerSchemeNotes";

const router = Router();

//broker scheme routes
router.use("/brokerscheme", [
  brokerSchemeRoutes,
  brokerSchemeRoleplayer,
  brokerSchemeBankingDetails,
  brokerSchemeAddress,
  brokerSchemeFileupload,
  brokerShemeNotes,
]);

export default router;
