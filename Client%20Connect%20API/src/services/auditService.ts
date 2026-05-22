const { BrokerAudit } = require("../models");
import { AuditEventType, ActionOutcome } from "../enums/brokerPortalEnums";

export interface AuditLogPayload {
  eventType: AuditEventType;
  outcome: ActionOutcome;
  userId?: string;
  metadata?: any;
  ipAddress?: string;
}

export class AuditService {
  /**
   * Log an audit event to the database
   * @param payload The audit event data
   * @param transaction Optional database transaction
   */
  static async logEvent(payload: AuditLogPayload, transaction?: any) {
    try {
      await BrokerAudit.create({
        audit_event_type: payload.eventType,
        action_outcome: payload.outcome,
        user_id: payload.userId,
        metadata: payload.metadata,
        ip_address: payload.ipAddress,
        action_date_time: new Date(),
      }, { transaction });
    } catch (error) {
      console.error("AUDIT LOGGING ERROR:", error);
      // We don't throw here to avoid breaking the main business flow if auditing fails
    }
  }

  /**
   * Get audit logs with optional filtering
   * @param filters Filtering options
   */
  static async getLogs(filters: any) {
    const { eventType, outcome, userId, startDate, endDate, limit = 50, offset = 0 } = filters;
    const where: any = {};

    if (eventType) where.audit_event_type = eventType;
    if (outcome) where.action_outcome = outcome;
    if (userId) where.user_id = userId;
    
    if (startDate || endDate) {
      where.action_date_time = {};
      if (startDate) where.action_date_time[require('sequelize').Op.gte] = new Date(startDate);
      if (endDate) where.action_date_time[require('sequelize').Op.lte] = new Date(endDate);
    }

    return await BrokerAudit.findAndCountAll({
      where,
      limit: parseInt(String(limit)),
      offset: parseInt(String(offset)),
      order: [["action_date_time", "DESC"]],
    });
  }
}
