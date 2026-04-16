import { CoverMemberTypeEnums, ParserCoverMemberTypeEnums } from "../../enums/rolePlayerTypeEnums"
import { getAgeByPolicyJoinDate } from "../../utils/dates"

const getBenefitsByCoverMemberType = (benefits: any, coverMemberType: number, coverAmount: number) =>
    benefits.data.reduce((acc: any, benefit: any) => 
        benefit.coverMemberType === coverMemberType && benefit.benefitRates[0].benefitAmount === coverAmount ?
        [...acc, {
            benfitId: benefit.id,
            name: benefit.name, 
            coverMemberType: benefit.coverMemberType,
            benefitAmount: benefit.benefitRates[0].benefitAmount,
            ruleItems: benefit.ruleItems
        }] : [...acc], 
    [])

const filterByCoverMemberType = (arr: any[], coverMemberType: number) =>
    arr.filter((item: any) => item.PolicyMember.memberTypeId === coverMemberType)

export const policyParser = (benefitRule: any, policy: any) => {
    const supportedCoverMemberTypes = [2, 3, 4]

    const { members } = policy

    const mainMember = filterByCoverMemberType(members, 1)

    const dependants = supportedCoverMemberTypes.reduce((acc: any, coverMemberType: number) =>
        ({
            ...acc,
            [ParserCoverMemberTypeEnums[coverMemberType]]: filterByCoverMemberType(members, coverMemberType)
                .map((member: any) => ({...member, age: getAgeByPolicyJoinDate(member.dateOfBirth, policy.joinDate)}))
        })
    , {})

    return {
        productId: benefitRule.productId,
        productOptionId: benefitRule.productOptionId,
        benefit: benefitRule.benefit,
        mainMemberAge: getAgeByPolicyJoinDate(mainMember[0].dateOfBirth, policy.joinDate),
        benefitAmount: policy.coverAmount,
        spouse: dependants.spouse.length,
        children: dependants.children || [],
        familyMembers: dependants.familyMembers || [],
        extended: dependants.extended || [],
    }
}

export default getBenefitsByCoverMemberType