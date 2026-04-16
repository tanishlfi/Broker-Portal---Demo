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

const familyMemberAgeBenefitRule = async (benefitRules: any, benefits: any): Promise<RuleResult<any, Error>> => {

    /**
     * 1. CREATE A NEW ENGINE INSTANCE.
     * @description This is used to create a new engine instance.
     * @constructor Engine
     */

    const engine = new Engine();

    /**
     * 2. DEFINE A RULE.
     * @description This is used to define a rule that will be added to the engine.
     * @object memberAgeRule
     */



    const familyMemberAgeRule = (benefitRules: any, age: any) => ({
        conditions: {
            all: [
                {
                    fact: 'age',
                    operator: 'greaterThanInclusive',
                    value: benefitRules.familyMemberMinAge,
                    params: {
                        age: age
                    }
                },
                {
                    fact: 'age',
                    operator: 'lessThanInclusive',
                    value: benefitRules.familyMemberMaxAge,
                    params: {
                        age: age
                    }
                }]
        },
        event: {
            type: benefitRules.familyMemberMinAge === 0 && benefitRules.familyMemberMaxAge === 0 ?
                `valid_allowed_age_of_family-member-must-be-zero-for-this-benefit` :
                `valid_allowed_age_of_family-member-must-be-greater-then-${benefitRules.familyMemberMinAge}-and-less-than-${benefitRules.familyMemberMaxAge}: ${age}`,
        }
    })

    /**
     * 3. ADD RULES TO THE ENGINE.
     * @function addRule
     * @description This function is used to add rules to the engine
     * @params {Object} rule
     * @returns {void}
     */

    /**
     * 4.2. DEFINE RUNTIME FACTS FOR NUMBER OF CHILDREN.
     */

    if (benefits.familyMembers == null) {
        return {
            success: true,
            message: 'No familyMembers to be allocated to the policy benefit.',
            data: []
        }
    } else {

        /**
        * 5. RUN THE ENGINE WITH THE RUNTIME FACTS.
        * @await
        * @description This is used to run the engine with the runtime facts.
        * @function run
        * @params {Object} facts
        */
        const familyMembers = benefits?.familyMembers.map((familyMember: any) => familyMember.age) ?? []
        const resultfamilyMembersAges = familyMembers.map(async (age: any) => {

            engine.addRule(familyMemberAgeRule(benefitRules, age))

            const output = await engine.run({ age })

            return output
        })


        const result = await Promise.all(resultfamilyMembersAges)
            .then(result => result)
            .catch(err => err)


        const { events, failureEvents } = result.reduce((acc: any, curr: any) => {
            return {
                events: [...acc.events, ...curr.events],
                failureEvents: [...acc.failureEvents, ...curr.failureEvents]
            }
        }, { events: [], failureEvents: [] })


        return failureEvents.length > 0 ? {
            success: false,
            message: 'Allocated family member benefit failed validation due to violation of the following benefit rules.',
            err: [...failureEvents]
        } : {
            success: true,
            message: 'Valid age for family member policy benefit to be allocated.',
            data: [...events]
        }
    }
}

export default familyMemberAgeBenefitRule