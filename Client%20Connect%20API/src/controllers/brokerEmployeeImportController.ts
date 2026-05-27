import { Request, Response } from "express";
import { 
  brokerImportEmployeesService, 
  getEmployeesByLeadIdService, 
  updateEmployeeService,
  deleteEmployeeService,
  addSingleEmployeeService 
} from "../services/brokerEmployeeImport.service";

/**
 * @swagger
 * /broker/employees/{leadId}/add:
 *   post:
 *     summary: Add a single employee to a lead
 *     tags: [Broker Employees]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - surname
 *               - gender
 *               - income
 *               - dateOfBirth
 *               - idNumber
 *             properties:
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [M, F, Other]
 *               income:
 *                 type: number
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               idNumber:
 *                 type: string
 *               idType:
 *                 type: string
 *                 default: "ID"
 *     responses:
 *       200:
 *         description: Employee added successfully
 *       400:
 *         description: Duplicate ID or other error
 *       403:
 *         description: Access denied or lead not found
 *       500:
 *         description: Internal server error
 */
export const addSingleEmployeeController = async (req: Request, res: Response) => {
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const { leadId } = req.params;
    const employeeData = req.body;

    if (!representativeId) {
      return res.status(401).json({ success: false, message: "Representative ID not found in token." });
    }

    const result = await addSingleEmployeeService(leadId, employeeData, representativeId, req.ip);

    if (!result.success) {
      const statusCode = result.message?.includes("denied") || result.message?.includes("Lead not found") ? 403 : 400;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("ADD SINGLE EMPLOYEE CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred while adding employee",
    });
  }
};

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
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const { lead_id, employees } = req.body;

    if (!representativeId) {
      return res.status(401).json({ success: false, message: "Representative ID not found in token." });
    }

    const result = await brokerImportEmployeesService(lead_id, employees, representativeId, req.ip);

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

/**
 * @swagger
 * /broker/employees/{leadId}:
 *   get:
 *     summary: Get all employees for a specific lead
 *     tags: [Broker Employees]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the lead
 *     responses:
 *       200:
 *         description: List of employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BrokerEmployee'
 *       500:
 *         description: Internal server error
 */
export const getEmployeesController = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const result = await getEmployeesByLeadIdService(leadId);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("GET EMPLOYEES CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred while fetching employees",
    });
  }
};

/**
 * @swagger
 * /broker/employees/{leadId}/{employeeId}:
 *   patch:
 *     summary: Update an employee's details (Scoped to Lead and Representative)
 *     tags: [Broker Employees]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the lead
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the employee to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [M, F, Other]
 *               income:
 *                 type: number
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               idNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       403:
 *         description: Access denied or lead not found
 *       404:
 *         description: Employee not found in this lead
 *       500:
 *         description: Internal server error
 */
export const updateEmployeeController = async (req: Request, res: Response) => {
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const { leadId, employeeId } = req.params;
    const data = req.body;

    if (!representativeId) {
      return res.status(401).json({ success: false, message: "Representative ID not found in token." });
    }

    const result = await updateEmployeeService(leadId, employeeId, data, representativeId, req.ip);

    if (!result.success) {
      const statusCode = result.message?.includes("denied") || result.message?.includes("Lead not found") ? 403 : 404;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("UPDATE EMPLOYEE CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred while updating employee",
    });
  }
};

/**
 * @swagger
 * /broker/employees/{leadId}/{employeeId}:
 *   delete:
 *     summary: Delete an employee (Scoped to Lead and Representative)
 *     tags: [Broker Employees]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the lead
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the employee to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       403:
 *         description: Access denied or lead not found
 *       404:
 *         description: Employee not found in this lead
 *       500:
 *         description: Internal server error
 */
export const deleteEmployeeController = async (req: Request, res: Response) => {
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const { leadId, employeeId } = req.params;

    if (!representativeId) {
      return res.status(401).json({ success: false, message: "Representative ID not found in token." });
    }

    const result = await deleteEmployeeService(leadId, employeeId, representativeId, req.ip);

    if (!result.success) {
      const statusCode = result.message?.includes("denied") || result.message?.includes("Lead not found") ? 403 : 404;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("DELETE EMPLOYEE CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred while deleting employee",
    });
  }
};
