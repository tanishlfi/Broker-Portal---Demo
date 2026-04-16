import {
  getAllProductTypesController,
  getProductTypeByIdController,
  addProductTypeController,
  updateProductTypeByIdController,
  deleteProductTypeByIdController,
} from "../../controllers/productTypeController";

import { Router } from "express";

const router = Router();

router
  .route("/product_types")
  .get(getAllProductTypesController)
  .post(addProductTypeController);

router
  .route("/product_types/:id")
  .get(getProductTypeByIdController)
  .patch(updateProductTypeByIdController)
  .delete(deleteProductTypeByIdController);

export default router;
