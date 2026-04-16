import { Request, Response } from "express";
const { ProductType } = require("../models");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";

export const getAllProductTypesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const findProducts = await ProductType.findAll();

    if (!findProducts) {
      return {
        success: false,
        message: "No product types found",
      };
    }

    return res.status(200).json({
      success: true,
      message: "Product types returned successfully",
      data: findProducts,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getProductTypeByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const findProduct = await ProductType.findByPk(id);

    if (!findProduct) {
      return res.status(400).json({
        success: false,
        message: "Product type not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product type returned successfully",
      data: findProduct.dataValues,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const addProductTypeController = async (req: Request, res: Response) => {
  try {
    const createdProduct = await ProductType.create(req.body);

    if (!createdProduct) {
      return res.status(400).json({
        success: false,
        message: "Error, unable to add product type",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product type created successfully",
      data: createdProduct.dataValues,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const updateProductTypeByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const updateProduct = await ProductType.update(req.body, {
      where: { id: id },
      returning: true,
    });

    if (!updateProduct) {
      return res.status(400).json({
        success: false,
        message: "Error, unable to update product type",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product type created successfully",
      data: updateProduct.dataValues,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const deleteProductTypeByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const deleteProduct = await ProductType.destroy({
      where: { id: id },
      returning: true,
    });

    return res.status(deleteProduct === 1 ? 200 : 400).json({
      success: deleteProduct === 1 ? true : false,
      message:
        deleteProduct === 1
          ? "Product type deleted successfully"
          : "Product type not found",
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};
