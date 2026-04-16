import { RuleResult } from "../../lib/functional-types/result";
const { Engine } = require("json-rules-engine");

/**
 * BENEFIT RULE
 * @description This function is used to check if the main member age is greater than 18 and less than 64
 * @async
 * @param {*} benefitRules
 * @param {*} benefits
 * @returns valid or invalid age to be that can be added to the policy.
 */

const disabledChildrenBenefitRule = async (
  benefitRules: any,
  benefits: any,
): Promise<RuleResult<any, Error>> => {
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

  const disabledChildRule = (benefitRules: any, child: any) => ({
    conditions: {
      all: [
        {
          fact: "disabled",
          operator: "equal",
          value: true,
          params: {
            disabledBenefit: child.disabled,
          },
        },
        {
          fact: "age",
          operator: "lessThanInclusive",
          value: benefitRules.disabledChildMaxAge,
          params: {
            age: child.age,
          },
        },
        {
          fact: "age",
          operator: "greaterThanInclusive",
          value: benefitRules.disabledChildMinAge,
          params: {
            age: child.age,
          },
        },
      ],
    },
    event: {
      type:
        benefitRules.disabledChildMinAge === 0 &&
        benefitRules.disabledChildMaxAge === 0
          ? `valid_allowed_age_of_disabled-children-must-be-zero-for-this-benefit`
          : `valid_allowed_age_of_disabled-children-must-be-greater-then-${benefitRules.disabledChildMinAge}-and-less-than-${benefitRules.disabledChildMaxAge}`,
    },
  });

  /**
   * 3. ADD RULES TO THE ENGINE
   * @function addRule
   * @description This function is used to add rules to the engine
   * @params {Object} rule
   * @returns {void}
   */

  /**
   * 4.2. DEFINE RUNTIME FACTS FOR STUDENT OF CHILDREN.
   */

  const disabled = benefits.children.filter(
    (child: any) => child.disabled === true,
  );

  if (disabled.length === 0) {
    return {
      success: true,
      message: "No disabled child(ren) to be allocated.",
      data: [],
    };
  } else {
    /**
     * 5. RUN THE ENGINE WITH THE RUNTIME FACTS.
     * @await
     * @description This is used to run the engine with the runtime facts.
     * @function run
     * @params {Object} facts
     */

    const resultDisabledChildren = disabled.map(async (child: any) => {
      engine.addRule(disabledChildRule(benefitRules, child));

      const output = await engine.run({
        disabled: child.disabled,
        age: child.age,
      });

      return output;
    });

    const result = await Promise.all(resultDisabledChildren)
      .then((result) => result)
      .catch((err) => err);

    // console.log(result)

    const { events, failureEvents } = result[0];

    return failureEvents.length > 0
      ? {
          success: false,
          message:
            "Allocation of disabled child(ren) failed validation due to violation of the following benefit rules.",
          err: [...failureEvents],
        }
      : {
          success: true,
          message: "Valid disabled child(ren) policy benefit to be allocated.",
          data: [...events],
        };
  }
};

export default disabledChildrenBenefitRule;
