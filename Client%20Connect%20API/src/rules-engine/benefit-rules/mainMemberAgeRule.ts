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

const mainMemberAgeRule = async (benefitRules: any, benefits : any):Promise<RuleResult<any, Error>> => {

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

    const memberAgeRule = {
        conditions: {
            all: [{
                fact: 'mainMemberAge',
                operator: 'greaterThanInclusive',
                value: benefitRules.minAge,
                params: {
                    mainMemberAge: benefits.mainMemberAge
                }
            },{
                fact: 'mainMemberAge',
                operator: 'lessThanInclusive',
                value: benefitRules.maxAge,
                params: {
                    mainMemberAge: benefits.mainMemberAge
                }
            }]
        },
        event: {
            type: `main-member-age-must-be-greater-then-${benefitRules.minAge}-and-less-than-${benefitRules.maxAge}`,
        }
    }

    const spouseRule = {
        conditions: {
            all: [{
                fact: 'spouse',
                operator: 'equal',
                value: benefitRules.spouse,
                params: {
                    spouse: benefits.spouse
                }
            }]
        },
        event: {
          type: `valid_allowed_number_of_spouse(s)-equals-${benefitRules.spouse}`,
        }
    }
    
    /**
     * 3. ADD RULES TO THE ENGINE
     * @function addRule
     * @description This function is used to add rules to the engine
     * @params {Object} rule
     * @returns {void}
     */

    engine
        .addRule(memberAgeRule)
        .addRule(spouseRule)
        

    engine.on('success', (event: any, almanac: any, ruleResult: any) =>
        //console.log('success', event, almanac, ruleResult)
        console.log('Hi')
    );

    engine.on('failure', (event: any, almanac: any, ruleResult: any) =>
        //console.log('failure', event, almanac, ruleResult)
        console.log('Bye')
    );

    /**
     * 4. DEFINE RUNTIME FACTS.
     * @description This is used to define the facts that will be passed to the engine when it runs.
     */

    const runTimeFacts = {
        ...benefits
    }
    /**
     * 5. RUN THE ENGINE WITH THE RUNTIME FACTS.
     * @await
     * @description This is used to run the engine with the runtime facts.
     * @function run
     * @params {Object} facts
     */

    const output = await engine.run(runTimeFacts)

    const { events, failureEvents } = output

    //console.log(events, failureEvents)
    return  failureEvents.length > 0 ? {
        success: false,
        message: 'Allocated main member benefit failed validation due to violation of the following benefit rules',
        err: [...failureEvents]
        
    } : {
        success: true,
        message: 'Valid main member age benefit can be allocated',
        data: [...events]
    }
}
export default mainMemberAgeRule