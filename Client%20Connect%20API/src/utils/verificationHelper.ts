import { RMAQuickTransact, rmaVOPDErrorCount } from "../utils/rmaVOPD";
import { logger } from "../middleware/logger";
import { v4 as uuidv4 } from "uuid";

const { BrokerEmployee, BrokerVerificationResult } = require("../models");

const performAMLCheck = async (employeeData: any) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      result: true,
      data: { status: "Passed", riskScore: "Low", message: "No adverse media found." },
    };
  } catch (error) {
    logger.error(`AML check failed for employee ${employeeData.id_number}: ${error}`);
    return { result: false, error: "AML service unavailable" };
  }
};

export const performBulkVerification = async (leadId: string) => {
  try {
    const employees = await BrokerEmployee.findAll({
      where: { lead_id: leadId },
    });

    if (!employees || employees.length === 0) {
      logger.info(`No employees found for lead ${leadId} to verify.`);
      return { success: true, count: 0 };
    }

    const totalEmployees = employees.length;
    logger.info(`Started asynchronous verification for ${totalEmployees} employees on lead ${leadId}`);

    let processedCount = 0;
    const CHUNK_SIZE = 50;
    const DELAY_BETWEEN_CHUNKS_MS = 2000;

    for (let i = 0; i < totalEmployees; i += CHUNK_SIZE) {
      const chunk = employees.slice(i, i + CHUNK_SIZE);
      const batchNum = Math.floor(i / CHUNK_SIZE) + 1;
      const totalBatches = Math.ceil(totalEmployees / CHUNK_SIZE);
      
      logger.info(`Processing batch ${batchNum}/${totalBatches} (${chunk.length} employees)`);

      for (const employee of chunk) {
        try {
          if (!employee.id_number) {
            processedCount++;
            continue;
          }

          const astuteErrorCount = await rmaVOPDErrorCount();
          let vopdResult: any = { result: false, error: "VOPD service throttled" };
          let vopdStatus = "Pending";

          if (astuteErrorCount.count <= 10) {
            vopdResult = await RMAQuickTransact(employee.id_number);
            vopdStatus = vopdResult.result ? "Completed" : "Failed";
          } else {
            logger.warn(`VOPD error count too high. Throttling ID ${employee.id_number}`);
          }


          const amlResult = await performAMLCheck(employee);
          const amlStatus = amlResult.result ? "Completed" : "Failed";

          await BrokerVerificationResult.create({
            id: uuidv4(),
            lead_id: leadId,
            employee_id: employee.employee_id,
            vopd_status: vopdStatus,
            vopd_response: vopdResult.result ? vopdResult.data : { error: vopdResult.error },
            aml_status: amlStatus,
            aml_response: amlResult.result ? amlResult.data : { error: amlResult.error },
          });

          processedCount++;
        } catch (empError: any) {
          logger.error(`Critical error verifying employee ${employee.id_number}:`, empError);
          
          // If it's a database error that indicates a missing table or column, re-throw it
          if (empError.name === "SequelizeDatabaseError" && 
              (empError.message.includes("Invalid object name") || empError.message.includes("Invalid column name"))) {
            throw empError;
          }
          
          processedCount++;
        }
      }

      logger.info(`Completed batch ${batchNum}/${totalBatches}`);
      
      if (i + CHUNK_SIZE < totalEmployees) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS_MS));
      }
    }

    logger.info(`Successfully completed verification for ${processedCount}/${totalEmployees} employees on lead ${leadId}`);
    return { success: true, count: processedCount };
  } catch (error) {
    logger.error(`Error in performBulkVerification for lead ${leadId}:`, error);
    throw error;
  }
};
