const {
  BrokerLead,
  BrokerEmployer,
  BrokerEmployee,
  BrokerQuote,
  onboardingPolicy,
  onboardingData,
  sequelize
} = require("../models");
import { logger } from "../middleware/logger";


export class BrokerOnboardingService {
  static async createOnboardingRequestFromLead(leadId: string, initialStatus: string = "Pending Approval", initialNotes: string = "") {
    const t = await sequelize.transaction();
    try {
      const lead = await BrokerLead.findByPk(leadId, {
        include: [
          { model: BrokerEmployer, as: "employer" },
          { model: BrokerEmployee, as: "employees" },
          { 
            model: BrokerQuote, 
            as: "quotes", 
            where: { quote_status: "Accepted" },
            limit: 1,
            order: [["updatedAt", "DESC"]]
          }
        ],
        transaction: t
      });

      if (!lead) {
        throw new Error(`Lead with ID ${leadId} not found.`);
      }

      if (!lead.quotes || lead.quotes.length === 0) {
        throw new Error(`No accepted quote found for Lead ${leadId}. Acceptance must be verified first.`);
      }

      const acceptedQuote = lead.quotes[0];

      const newPolicy = await onboardingPolicy.create({
        providerId: 1, 
        ProductOptionId: lead.product_id || null,
        brokerageId: lead.broker_id,
        brokerageName: lead.employer?.employer_name || "Unknown Employer",
        coverAmount: acceptedQuote.total_premium,
        status: initialStatus,
        createdBy: lead.representative_id,
        joinDate: new Date().toISOString().split('T')[0],
        statusNote: initialNotes || `Automatically created from Broker Portal Lead: ${lead.lead_reference}`,
      }, { transaction: t });

      if (lead.employees && lead.employees.length > 0) {
        const memberData = lead.employees.map((emp: any) => {
          return {
            policyId: newPolicy.id,
            firstName: emp.first_name,
            surname: emp.last_name,
            idNumber: emp.id_number,
            dateOfBirth: emp.date_of_birth,
            memberTypeId: 1, // Default to Main Member
            status: "New",
            client_type: "Broker Portal",
            isVopdVerified: false,
            dateVopdVerified: null,
            vopdResponse: null,
            notes: initialNotes || "VOPD/AML Verification: In Progress"
          };
        });

        await onboardingData.bulkCreate(memberData, { transaction: t });
      }

      await lead.update({ lead_status: "Onboarding Submitted" }, { transaction: t });

      await t.commit();
      logger.info(`Onboarding workflow started: Policy ID ${newPolicy.id} created from Lead ${leadId}`);
      
      return {
        success: true,
        policyId: newPolicy.id,
        memberCount: lead.employees ? lead.employees.length : 0
      };
    } catch (error: any) {
      if (t) {
        try {
          await t.rollback();
        } catch (rbErr) {
          // Transaction already closed
        }
      }
      logger.error(`CRITICAL: Failed to create onboarding request for Lead ${leadId}:`, error);
      throw error; 
    }
  }
}
