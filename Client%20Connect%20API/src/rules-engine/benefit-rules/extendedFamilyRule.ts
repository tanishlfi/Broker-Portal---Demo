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

const extendedFamilyBenefitRule = async (benefitRules: any, benefits : any):Promise<RuleResult<any, Error>> => {

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

    const extendedFamilyRule = {
        conditions: {
            all: [{
                fact: 'numberOfExtendedFamilyMembers',
                operator: 'lessThanInclusive',
                value: benefitRules.extended,
                params: {
                    extended: benefits.extended.length
                }
            },{
                fact: 'numberOfExtendedFamilyMembers',
                operator: 'greaterThan',
                value: -1,
                params: {
                    extended: benefits.extended.length
                }
            }]
        },
        event: {
            type: `valid_allowed_number_of_extended-family-members_equals-${benefitRules.extended}: allocated:${benefits.extended.length}`,
        }
    }

    /**
     * 3. ADD RULES TO THE ENGINE.
     * @function addRule
     * @description This function is used to add rules to the engine
     * @params {Object} rule
     * @returns {void}
     */

    engine.addRule(extendedFamilyRule)
    /**
     * 4. DEFINE RUNTIME FACTS.
     * @description This is used to define the facts that will be passed to the engine when it runs.
     */

    /**
     * 4.2. DEFINE RUNTIME FACTS FOR NUMBER OF CHILDREN.
     */

    const numberOfExtendedFamilyMembers = benefits.extended.length
    
    /**
     * 5. RUN THE ENGINE WITH THE RUNTIME FACTS.
     * @await
     * @description This is used to run the engine with the runtime facts.
     * @function run
     * @params {Object} facts
     */
    
    const resultNumberOfFamilyMembers = await engine.run({ numberOfExtendedFamilyMembers })

    const { events, failureEvents } = resultNumberOfFamilyMembers

    return failureEvents.length > 0 ? {
        success: false,
        message: 'Allocated extended family members benefit failed validation due to violation of the following benefit rules',
        err: [...failureEvents ]
    } : {
        success: true,
        message: 'Valid extended family members policy benefit can be allocated',
        data: [...events ]
    }
}

export default extendedFamilyBenefitRule