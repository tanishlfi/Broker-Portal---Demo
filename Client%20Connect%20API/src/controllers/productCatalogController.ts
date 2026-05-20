import { Request, Response } from "express";
import { ProductCatalogService } from "../services/productCatalog.service";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";

const productCatalogService = new ProductCatalogService();

/**
 * @swagger
 * /product/list:
 *   get:
 *     summary: Retrieve a list of all active broker products and their benefits
 *     tags: [Broker Products]
 *     responses:
 *       200:
 *         description: List of products
 */
export const getProductListController = async (req: Request, res: Response) => {
  try {
    const formattedList = await productCatalogService.getProductList();

    return res.status(200).json({
      success: true,
      message: "Broker Portal product list retrieved successfully",
      data: formattedList,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

/**
 * @swagger
 * /product/pricing:
 *   post:
 *     summary: Calculate pricing for a specific quote or product configuration
 *     tags: [Broker Pricing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: object
 *               workforce_count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pricing calculated successfully
 */
export const calculatePricingController = async (req: Request, res: Response) => {
  try {
    const pricingResult = await productCatalogService.calculatePricing(req.body);

    return res.status(200).json({
      success: true,
      message: "Pricing calculated successfully",
      data: pricingResult,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};
