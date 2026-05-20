import { Request, Response, NextFunction } from "express";
import * as Yup from "yup";
import { 
  createLeadSchema, 
  updateLeadSchema, 
  cancelLeadSchema, 
  quickQuoteSchema, 
  fullQuoteSchema, 
  sendOtpSchema, 
  verifyOtpSchema, 
  employerOnboardingSchema,
  brokerImportEmployeesSchema
} from "../utils/brokerValidation";

const validate = (schema: Yup.AnyObjectSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.inner?.map((e: any) => ({
        field: e.path,
        message: e.message
      })) || [{ message: err.message }]
    });
  }
};

export const validateCreateLead = validate(createLeadSchema);
export const validateUpdateLead = validate(updateLeadSchema);
export const validateCancelLead = validate(cancelLeadSchema);
export const validateQuickQuote = validate(quickQuoteSchema);
export const validateFullQuote = validate(fullQuoteSchema);
export const validateSendOtp = validate(sendOtpSchema);
export const validateVerifyOtp = validate(verifyOtpSchema);
export const validateEmployerOnboarding = validate(employerOnboardingSchema);
export const validateBrokerEmployeeImport = validate(brokerImportEmployeesSchema);

