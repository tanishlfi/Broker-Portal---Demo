import { Request, Response } from "express";
import { brokerImportEmployeesService } from "../services/brokerEmployeeImport.service";

/**
 * @swagger
 * /broker/employees/import:
 *   post:
 *     summary: Bulk import employees for a lead via JSON array
 *     tags: [Broker Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lead_id
 *               - employees
 *             properties:
 *               lead_id:
 *                 type: string
 *                 format: uuid
 *               employees:
 *                 type: array
 *                 minItems: 5
 *                 items:
 *                   type: object
 *                   required:
 *                     - firstName
 *                     - surname
 *                     - gender
 *                     - income
 *                     - dateOfBirth
 *                     - email
 *                     - cellNumber
 *                     - employmentStartDate
 *                     - idNumber
 *                     - nationality
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     surname:
 *                       type: string
 *                     gender:
 *                       type: string
 *                       enum: [M, F, Other]
 *                     income:
 *                       type: number
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     email:
 *                       type: string
 *                       format: email
 *                     cellNumber:
 *                       type: string
 *                     employmentStartDate:
 *                       type: string
 *                       format: date
 *                     idNumber:
 *                       type: string
 *                     nationality:
 *                       type: string
 *     responses:
 *       200:
 *         description: Employees imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalEmployees:
 *                   type: integer
 *                 insertedEmployees:
 *                   type: integer
 *                 duplicateEmployees:
 *                   type: integer
 *       400:
 *         description: Validation error or missing lead_id
 *       500:
 *         description: Internal server error
 */
export const brokerImportEmployeesController = async (req: Request, res: Response) => {
  try {
    const { lead_id, employees } = req.body;

    const result = await brokerImportEmployeesService(lead_id, employees);

    if (!result.success) {
      return res.status(result.message?.includes("not found") ? 404 : 400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("BROKER IMPORT EMPLOYEES CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred during employee import",
    });
  }
};
