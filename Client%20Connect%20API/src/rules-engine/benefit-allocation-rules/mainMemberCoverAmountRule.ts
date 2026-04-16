import { RuleResult } from "../../lib/functional-types/result";
const { Engine } = require('json-rules-engine');

import { getAgeByPolicyJoinDate } from "../../../src/utils/dates";
import getBenefitsByCoverMemberType from "../helpers/benefitsByCoverMemberType"

const mainMemberCoverAmountRule = async (policyBenefits: any, data: any):Promise<RuleResult<any, Error>> => {

    const engine = await new Engine();

    const { policy, benefits } = policyBenefits
    const { coverAmount } = data

    const output = getBenefitsByCoverMemberType(benefits, 1, coverAmount)

    const policyMembers = data.members.reduce((acc: any, member: any) =>
        member?.dateOfBirth && member?.dateOfBirth != null ?
            {
                membersAcceptedByDOB: [...acc.membersAcceptedByDOB, {
                    firstName: member.firstName,
                    age: getAgeByPolicyJoinDate(member.dateOfBirth, data.joinDate),
                    coverMemberType: member.PolicyMember.memberTypeId
                }
                ]
            } : {
                membersRejectedByDOB: [...acc.membersRejectedByDOB, {
                    firstName: member.firstName,
                    age: getAgeByPolicyJoinDate(member.dateOfBirth, data.joinDate),
                    coverMemberType: member.PolicyMember.memberTypeId
                }
                ]
            },
        { membersAcceptedByDOB: [], membersRejectedByDOB: [] })


    const memberTypeCount = policyMembers.membersAcceptedByDOB.reduce((acc: any, member: any) =>
        acc[member.coverMemberType] ?
            {...acc, [member.coverMemberType]: { count: acc[member.coverMemberType].count + 1 }}
            : {...acc, [member.coverMemberType]: { count: 1 }}, [])

    
    const allowedNumberOfMemberRule = {
        conditions: {
            any: [{
                fact: 'memberTypeCount',
                path: '$.1.count',
                params: {
                    count: 1                    
                },
                operator: 'equal',
                value: 1,
                factResult: true
            }]
        },
        event: {
            type: 'allowedNumberOfMainMembers',
            params: {
                message: 'Allowed number of main members found',
            }
        }
    }

    engine.addRule(allowedNumberOfMemberRule)

    engine.addFact('1', async (params: any, almanac: any) => {
        return almanac.factValue('1').then((memberType: any) => {
            return memberType.count === params.count
        })
    })

    const result = await engine.run({ memberTypeCount })

    const { events, failureEvents } = result

    return failureEvents.length > 0 ? {
        success: false,
        message: `Invalid number of main members found`,
        err: [ ...failureEvents ]
    } : {
        success: true,
        message: `Valid number of main members found`,
        data: [ ...events ]
    }
}


export default mainMemberCoverAmountRule