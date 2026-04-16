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

const childrenAgeBenefitRule = async (benefitRules: any, benefits : any):Promise<RuleResult<any,Error>> => {

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

    const childAgeRule = (benefitRules: any, child: any) => ({
            conditions: {
                all: [{
                    fact: 'isChild',
                    operator: 'equal',
                    value: true,
                },
                {
                    fact: 'age',
                    operator: 'greaterThanInclusive',
                    value: benefitRules.childMinAge,
                    params: {
                        age: child.age
                    }
                },{
                    fact: 'age',
                    operator: 'lessThanInclusive',
                    value: benefitRules.childMaxAge,
                    params: {
                        age: child.age
                    }
                }]
            },
            event: {
                type: benefitRules.childMinAge === 0 && benefitRules.childMaxAge === 0 ? 
                    `valid_allowed_age_of_children-must-be-zero-for-this-benefit` : 
                    `valid_allowed_age_of_children-must-be-greater-then-${benefitRules.childMinAge}-and-less-than-${benefitRules.childMaxAge}`,
            }
    })

    /**
     * 3. ADD RULES TO THE ENGINE
     * @function addRule
     * @description This function is used to add rules to the engine
     * @params {Object} rule
     * @returns {void}
     */

    /**
     * 4.2. DEFINE RUNTIME FACTS FOR NUMBER OF CHILDREN.
     */

    const childrenAges = benefits.children.filter((child: any) => child.isChild === true)

    if (childrenAges.length === 0) {
        return {
            success: true,
            message: 'No child(ren) age to be allocated to the policy benefit.',
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
    
        const resultChildrenAges = childrenAges.map(async (child: any) => {
        
        engine.addRule(childAgeRule(benefitRules, child))
        
            const output = await engine.run({ ...child })
        
            return output
        })


        const result = await Promise.all(resultChildrenAges)
            .then(result => result)
            .catch(err => err)

        const { events, failureEvents } = result[0]

        return failureEvents.length > 0 ? {
            success: false,
            message: 'Allocated child(ren) age failed validation due to violation of the following benefit rules.',
            err: [...failureEvents]
        } : {
            success: true,
            message: 'Valid age for child(ren) policy benefit to be allocated.',
            data: [...events] 
        }
    }
}

export default childrenAgeBenefitRule