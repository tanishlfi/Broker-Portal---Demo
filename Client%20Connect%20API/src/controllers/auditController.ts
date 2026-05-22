import { Request, Response } from "express";
import { AuditService } from "../services/auditService";

/**
 * @swagger
 * /audit/logs:
 *   get:
 *     summary: Retrieve audit logs with filtering and pagination
 *     tags: [Audit]
 *     parameters:
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *       - in: query
 *         name: outcome
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of audit logs
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditService.getLogs(req.query);
    return res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: logs
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching audit logs"
    });
  }
};
