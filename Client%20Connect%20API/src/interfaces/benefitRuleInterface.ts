import { RuleResult } from "../lib/functional-types/result"

export interface ChildBenefitInterface {
    age: number,
    student: boolean,
    disabled: boolean
}

export interface FamilyMemberInterface {
    age: number,
}

export interface ExtendedFamilyMemberInterface {
    age: number,
}
export interface BenefitInterface {
    productId: number,
    productOptionId: number,
    benefit: string,
    benefitAmount: number,
    mainMemberAge: number,
    spouse: number,
    children: ChildBenefitInterface[],
    familyMembers: FamilyMemberInterface[],
    extended: ExtendedFamilyMemberInterface[]
}

export interface BenefitRuleInterface {
    id: string,
    productId: number,
    productOptionId: number,
    benefitId: number,
    benefitAmount: number,
    benefit: string,
    coverMemberType: string,
    minAge: number,
    maxAge: number,
    spouse: number,
    children: number,
    childMinAge: number,
    childMaxAge: number,
    studentChildMinAge: number,
    studentChildMaxAge: number,
    disabledChildMinAge: number,
    disabledChildMaxAge: number,
    familyMembers: number,
    familyMembersMinAge: number,
    familyMembersMaxAge: number,
    extended: number,
    createdAt: Date,
    updatedAt: Date
}

export interface MainMemberBenefitRuleInterface {
    validateBenefitAgainstBenefitRule: (benefitRule: BenefitRuleInterface, benefit: BenefitInterface) => Promise<RuleResult<any,Error>>[]
}
