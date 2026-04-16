import { RuleResult } from '../../lib/functional-types/result';
const { Engine } = require('json-rules-engine');

/**
 * BENEFIT RULE
 * @description This function is used to check if the main member age is greater than 18 and less than 64
 * @async
 * @param {*} benefitRules
 * @param {*} benefits
 * @returns valid or invalid age to be that can be added to the policy.
 */

const familyMembersBenefitRule = async (benefitRules: any, benefits : any):Promise<RuleResult<any, Error>> => {

    /**
     * 1. CREATE A NEW ENGINE.
     * @description This is used to create a new engine instance.
     * @constructor Engine
     */

    const engine = new Engine();

    /**
     * 2. DEFINE A RULE.
     * @description This is used to define a rule that will be added to the engine.
     * @object memberAgeRule
     */

    const familyMembersRule = {
        conditions: {
            all: [{
                fact: 'numberOfFamilyMembers',
                operator: 'lessThanInclusive',
                value: benefitRules.familyMembers,
                params: {
                    familyMembers: benefits.familyMembers.length
                }
            },{
                fact: 'numberOfFamilyMembers',
                operator: 'greaterThan',
                value: -1,
                params: {
                    familyMembers: benefits.familyMembers.length
                }
            }]
        },
        event: {
            type: `valid_allowed_number_of_family-members_equals-${benefitRules.familyMembers}: allocated:${benefits.familyMembers.length}`,
        }
    }

    const numberOfFamilyMembersOver64 = benefits.familyMembers.filter((member: any) => member.age > 64).length

    const familyMembersOver64Rule = {
        conditions: {
            all: [{
                fact: 'numberOfFamilyMembersOver64',
                operator: 'lessThanInclusive',
                value: benefitRules.familyMembersOver64,
                params: {
                    familyMembersOver64: benefits.familyMembers.filter((member: any) => member.age > 64).length
                }
            }]
        },
        event: {
            type: `valid_allowed_number_of_family-members-over-64_equals-${benefitRules.familyMembersOver64}: allocated:${numberOfFamilyMembersOver64}`,
        }
    }

    /**
     * 3. ADD RULES TO THE ENGINE.
     * @function addRule
     * @description This function is used to add rules to the engine
     * @params {Object} rule
     * @returns {void}
     */

    engine
        .addRule(familyMembersRule)
        .addRule(familyMembersOver64Rule)
    /**
     * 4. DEFINE RUNTIME FACTS.
     * @description This is used to define the facts that will be passed to the engine when it runs.
     */

    
    /**
     * 4.2. DEFINE RUNTIME FACTS FOR NUMBER OF FAMILY MEMBERS.
     */

    const numberOfFamilyMembers = benefits.familyMembers.length
    
    /**
     * 5. RUN THE ENGINE WITH THE RUNTIME FACTS.
     * @await
     * @description This is used to run the engine with the runtime facts.
     * @function run
     * @params {Object} facts
     */
    
    const resultNumberOfFamilyMembers = await engine.run({ numberOfFamilyMembers, numberOfFamilyMembersOver64 })

    const { events, failureEvents } = resultNumberOfFamilyMembers

    return failureEvents.length > 0 ? {
        success: false,
        message: 'Allocated family members benefit failed validation due to violation of the following benefit rules',
        err: [...failureEvents ]
    } : {
        success: true,
        message: 'Valid family members policy benefit can be allocated',
        data: [...events ]
    }
}

export default familyMembersBenefitRule