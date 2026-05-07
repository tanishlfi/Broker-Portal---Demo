import { Router } from "express";
import {
  getProductListController,
  calculatePricingController,
} from "../controllers/productCatalogController";

const router = Router();

router.route("/list").get(getProductListController);

router.route("/pricing").post(calculatePricingController);

export default router;
