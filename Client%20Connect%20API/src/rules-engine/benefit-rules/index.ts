import { BenefitRuleInterface, BenefitInterface } from "../../interfaces/benefitRuleInterface";

import mainMemberBenefitRule from "./mainMemberBenefitRule";
import mainMemberAgeBenefitRule from "./mainMemberBenefitRule";
import childrenAgeBenefitRule from "./childAgesRule";
import childrenBenefitRule from "./childrenRule";
import studentChildrenBenefitRule from "./studentChildRule";
import disabledChildrenBenefitRule from "./disabledChildRule";
import familyMemberAgeBenefitRule from "./familyMemberAgeRule";
import familyMemberBenefitRule from "./familyMembersRule";
import extendedFamilyBenefitRule from "./extendedFamilyRule";

/**
 * @rules array
 * @description This is used to define a rule that will be run during validation, rules can be commission and decommissioned as needed from this array.
 */
const rules = [
    mainMemberBenefitRule,
    mainMemberAgeBenefitRule,
    childrenAgeBenefitRule,
    childrenBenefitRule,
    studentChildrenBenefitRule,
    disabledChildrenBenefitRule,
    familyMemberAgeBenefitRule,
    familyMemberBenefitRule,
    extendedFamilyBenefitRule
]

const validatePolicyBenefit = async (
    benefitRules: BenefitRuleInterface,
    benefits: BenefitInterface) =>
        await Promise.all(rules.map(async rule => await rule(benefitRules, benefits))
    )


export default validatePolicyBenefit