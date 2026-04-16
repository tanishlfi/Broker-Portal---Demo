import os
import utils
import logging
from models import (
    BenefitRule,
    ProductOptionBenefit,
    DependantBenefitRule,
    BenefitDependantBenefitRule,
    productOption,
)
from sqlalchemy import update, func, cast, Date, insert, exists, or_, select
import utils
import json


# @description: get main member benefit based on file benefit
# @params: conn, productionOptionId, coverAmount, age, spouse, children, extended, fileBenefit
# @returns: benefitId
def getMainMemberBenefitFileBenefit(
    conn, productionOptionId, coverAmount, age, spouse, children, extended, fileBenefit
):
    logging.debug(
        f"getMainMemberBenefitPerFile {productionOptionId} {coverAmount} {age} {spouse} {children} {extended} {fileBenefit}"
    )

    # get main member benefit
    try:
        fileBenefitPerFile = {}
        # check if benefit on file can be used for allocation
        s = (
            BenefitRule.__table__.select()
            .with_hint(BenefitRule, "WITH (NOLOCK)")
            .join(
                ProductOptionBenefit,
                ProductOptionBenefit.benefitId == BenefitRule.benefitId,
            )
            .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
            .where(
                ProductOptionBenefit.productOptionId == productionOptionId,
                # BenefitRule.benefit == fileBenefit,
                BenefitRule.benefitAmount == coverAmount,
                BenefitRule.minAge <= age,
                BenefitRule.maxAge >= age,
            )
            .with_only_columns(
                BenefitRule.benefitId,
                BenefitRule.benefit,
                BenefitRule.children,
                BenefitRule.spouse,
                BenefitRule.familyMembers,
                BenefitRule.parentBenefit,
                BenefitRule.otherBenefit,
            )
        )
        getBenefits = conn.execute(s)
        for benefit in getBenefits.mappings().all():
            # compare the fileBenefit with the benefit["benefit"] and if equal set fileBenefitPerFile, comparison needs to be done ignoring case and spaces
            if fileBenefit.lower().replace(" ", "") == benefit[
                "benefit"
            ].lower().replace(" ", ""):
                fileBenefitPerFile = benefit
                break
            if (
                "Full Family Option" in fileBenefit
                and "Full Family Option" in benefit["benefit"]
            ):
                fileBenefitPerFile = benefit
                break
            if (
                "Full Family Funeral" in fileBenefit
                and "Full Family Funeral" in benefit["benefit"]
            ):
                fileBenefitPerFile = benefit
                break
            if "comm" in fileBenefit.lower() and "comm" in benefit["benefit"].lower():
                fileBenefitPerFile = benefit
                break

        if not fileBenefitPerFile:
            return None

        if children > 0:
            children = 6

        benefitAllowed = True

        logging.debug(fileBenefitPerFile)

        if spouse > 0 and fileBenefitPerFile["spouse"] == 0:
            benefitAllowed = False
        if children > 0 and fileBenefitPerFile["children"] == 0:
            benefitAllowed = False
        if extended > 0 and fileBenefitPerFile["familyMembers"] == 0:
            benefitAllowed = False

        # main member only
        if (
            spouse == 0
            and children == 0
            and extended == 0
            and fileBenefitPerFile["spouse"] > 0
        ):
            benefitAllowed = False
        if (
            spouse == 0
            and children == 0
            and extended == 0
            and fileBenefitPerFile["children"] > 0
        ):
            benefitAllowed = False
        if (
            spouse == 0
            and children == 0
            and extended == 0
            and fileBenefitPerFile["familyMembers"] > 0
        ):
            benefitAllowed = False

        if benefitAllowed:
            return fileBenefitPerFile

    except Exception as e:
        logging.error(
            f"getMainMemberBenefit per file {productionOptionId} {coverAmount} {age} {spouse} {children} {extended} {e}"
        )
    return None


# @description: get main member benefit for age and member counts
# @params: conn, productionOptionId, coverAmount, age, spouse, children, extended
# @returns: benefitId
def getMainMemberBenefit(
    conn, productionOptionId, coverAmount, age, spouse, children, extended
):
    logging.debug(
        f"getMainMemberBenefit {productionOptionId} {coverAmount} {age} {spouse} {children} {extended} "
    )

    # get main member benefit
    try:

        if children > 0:
            children = 6
        if extended > 0:
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.familyMembers > 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
            )
        elif (
            spouse == 0
            and children == 0
            and productionOptionId
            in [
                239,
                171,
                21,
                341,
                363,
                6,
                122,
                363,
                127,
                85,
                344,
                117,
                460,
                86,
                181,
                494,
                529,
                532,
                444,
            ]
        ):
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.spouse >= 0,
                    BenefitRule.children >= 0,
                    BenefitRule.familyMembers == 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
            )

        elif spouse == 0 and children == 0 and productionOptionId in [77, 80]:
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.spouse >= 0,
                    BenefitRule.children == 0,
                    BenefitRule.familyMembers == 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
            )
        else:
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.spouse == spouse,
                    BenefitRule.children == children,
                    BenefitRule.familyMembers == 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
                .order_by(BenefitRule.benefitId)
            )

        getBenefits = conn.execute(s)

        result = getBenefits.mappings().all()

        if result:
            return result[0]

        if spouse > 0 or children > 0:
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.spouse == spouse,
                    BenefitRule.children == children,
                    BenefitRule.familyMembers == 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
            )
            getBenefits = conn.execute(s)
            result = getBenefits.mappings().all()

            # print(getBenefits.mappings().all())

            # logging.debug(f"here {result}")

            if result:
                return result[0]

        if spouse > 0 or children > 0:
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.spouse > 0,
                    BenefitRule.children > 0,
                    BenefitRule.familyMembers == 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
            )
            getBenefits = conn.execute(s)
            result = getBenefits.mappings().all()

            # print(getBenefits.mappings().all())

            # logging.debug(f"here {result}")

            if result:
                return result[0]

        if extended > 0:
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.spouse == 0,
                    BenefitRule.children == 0,
                    BenefitRule.familyMembers == 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
            )

            getBenefits = conn.execute(s)
            result = getBenefits.mappings().all()

            # print(getBenefits.mappings().all())

            # logging.debug(f"here {result}")

            # exit()

            if result:
                return result[0]

        if extended > 0:
            s = (
                select(ProductOptionBenefit)
                .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
                .join(
                    BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId
                )
                .with_hint(BenefitRule, "WITH (NOLOCK)")
                .where(
                    ProductOptionBenefit.productOptionId == productionOptionId,
                    BenefitRule.benefitAmount == coverAmount,
                    BenefitRule.minAge <= age,
                    BenefitRule.maxAge >= age,
                    BenefitRule.spouse >= 0,
                    BenefitRule.children >= 0,
                    BenefitRule.familyMembers == 0,
                )
                .with_only_columns(
                    ProductOptionBenefit.benefitId,
                    BenefitRule.benefit,
                    BenefitRule.otherBenefit,
                    BenefitRule.parentBenefit,
                )
            )

            getBenefits = conn.execute(s)
            result = getBenefits.mappings().all()

            # print(getBenefits.mappings().all())

            # logging.debug(f"here {result}")

            # exit()

            if result:
                return result[0]

        return None
    except Exception as e:
        logging.error(
            f"getMainMemberBenefit {productionOptionId} {coverAmount} {age} {spouse} {children} {extended} {e}"
        )
    return None


# @description: get dependant benefit for main member benefit, member type, age and sub group
# @params: conn, mainMemberBenefitId, memberType, age, subGroup
# @returns: dependantBenefitId
def getDependantBenefit(
    conn,
    mainMemberBenefitId,
    coverAmount,
    memberType,
    age,
    productOptionId,
    subGroup=None,
):
    logging.debug(
        f"getDependantBenefit {mainMemberBenefitId} {memberType} {age} {subGroup} {coverAmount}"
    )
    # get dependant benefit
    try:
        s = (
            BenefitDependantBenefitRule.__table__.select()
            .with_hint(BenefitDependantBenefitRule, "WITH (NOLOCK)")
            .join(
                DependantBenefitRule,
                DependantBenefitRule.id
                == BenefitDependantBenefitRule.dependantBenefitId,
            )
            .with_hint(DependantBenefitRule, "WITH (NOLOCK)")
            .join(productOption, productOption.benefitId == DependantBenefitRule.id)
            .with_hint(productOption, "WITH (NOLOCK)")
            .where(
                BenefitDependantBenefitRule.mainBenefitId == mainMemberBenefitId,
                DependantBenefitRule.coverMemberType == memberType,
                DependantBenefitRule.minAge <= age,
                DependantBenefitRule.maxAge >= age,
                DependantBenefitRule.subGroup == subGroup,
                DependantBenefitRule.benefitAmount == coverAmount,
                productOption.productOptionId == productOptionId,
            )
            .with_only_columns(
                BenefitDependantBenefitRule.dependantBenefitId,
                DependantBenefitRule.benefit,
                DependantBenefitRule.baseRate,
            )
        )
        getBenefits = conn.execute(s)
        dependantBenefit = getBenefits.mappings().all()
        logging.debug(f"dependantBenefit {dependantBenefit}")
        dependantBen = []
        for dependant in dependantBenefit:
            if memberType == "Spouse" and "G.S.Spouse@" in dependant["benefit"].replace(
                " ", ""
            ):
                dependantBen.append(dependant)
                break

            if memberType == "Child" and "G.S.Child(0-0)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break
            elif memberType == "Child" and "G.S.Child(1-5)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break
            elif memberType == "Child" and "G.S.Child(6-13)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break
            elif memberType == "Child" and "G.S.Child(14-21)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

            if memberType == "Extended Family" and "G.S.Other@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

            if memberType == "Extended Family" and "G.S.Parent@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

            if memberType == "Extended Family" and "G.S.Extended(" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

        if not dependantBen and dependantBenefit:
            dependantBen.append(dependantBenefit[0])
        if dependantBen:
            return dependantBen

    except Exception as e:
        logging.error(
            f"getDependantBenefit {mainMemberBenefitId} {memberType} {age} {subGroup} {e}"
        )
    return None


def getExtendedMaxCoverBenefit(
    conn,
    mainMemberBenefitId,
    coverAmount,
    memberType,
    age,
    productOptionId,
    subGroup=None,
):
    logging.debug(
        f"getDependantBenefit {mainMemberBenefitId} {memberType} {age} {subGroup} {coverAmount}"
    )
    # get dependant benefit
    try:
        s = (
            BenefitDependantBenefitRule.__table__.select()
            .with_hint(BenefitDependantBenefitRule, "WITH (NOLOCK)")
            .join(
                DependantBenefitRule,
                DependantBenefitRule.id
                == BenefitDependantBenefitRule.dependantBenefitId,
            )
            .with_hint(DependantBenefitRule, "WITH (NOLOCK)")
            .join(productOption, productOption.benefitId == DependantBenefitRule.id)
            .with_hint(productOption, "WITH (NOLOCK)")
            .where(
                BenefitDependantBenefitRule.mainBenefitId == mainMemberBenefitId,
                DependantBenefitRule.coverMemberType == memberType,
                DependantBenefitRule.minAge <= age,
                DependantBenefitRule.maxAge >= age,
                DependantBenefitRule.subGroup == subGroup,
                DependantBenefitRule.benefitAmount <= coverAmount,
                productOption.productOptionId == productOptionId,
            )
            .with_only_columns(
                BenefitDependantBenefitRule.dependantBenefitId,
                DependantBenefitRule.benefit,
                DependantBenefitRule.baseRate,
                DependantBenefitRule.benefitAmount,
            )
        )
        getBenefits = conn.execute(s)
        dependantBenefit = getBenefits.mappings().all()
        logging.debug(f"dependantBenefit {dependantBenefit}")
        dependantBen = []
        for dependant in dependantBenefit:
            if memberType == "Spouse" and "G.S.Spouse@" in dependant["benefit"].replace(
                " ", ""
            ):
                dependantBen.append(dependant)
                break

            if memberType == "Child" and "G.S.Child(0-0)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break
            elif memberType == "Child" and "G.S.Child(1-5)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break
            elif memberType == "Child" and "G.S.Child(6-13)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break
            elif memberType == "Child" and "G.S.Child(14-21)@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

            if memberType == "Extended Family" and "G.S.Other@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

            if memberType == "Extended Family" and "G.S.Parent@" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

            if memberType == "Extended Family" and "G.S.Extended(" in dependant[
                "benefit"
            ].replace(" ", ""):
                dependantBen.append(dependant)
                break

        # get the max cover amount
        if dependantBenefit:
            dependantBenefit.sort(key=lambda x: x["benefitAmount"], reverse=True)
            # return dependantBen[0]

        # print(dependantBenefit[0])
        # exit()

        if not dependantBen and dependantBenefit:
            dependantBen.append(dependantBenefit[0])
        if dependantBen:
            return dependantBen

    except Exception as e:
        logging.error(
            f"getDependantBenefit {mainMemberBenefitId} {memberType} {age} {subGroup} {e}"
        )
    return None


# @description: get dependant benefit for debpendent based on benefit from file
# @params: conn, mainMemberBenefitId, benefitName
# @returns: benefitId
def getDependantBenefitByName(conn, mainMemberBenefitId, benefitName):
    logging.debug(f"getDependantBenefit {mainMemberBenefitId} {benefitName}")
    # get dependant benefit
    try:
        s = (
            BenefitDependantBenefitRule.__table__.select()
            .with_hint(BenefitDependantBenefitRule, "WITH (NOLOCK)")
            .join(
                DependantBenefitRule,
                DependantBenefitRule.id
                == BenefitDependantBenefitRule.dependantBenefitId,
            )
            .with_hint(DependantBenefitRule, "WITH (NOLOCK)")
            .where(
                BenefitDependantBenefitRule.mainBenefitId == mainMemberBenefitId,
                DependantBenefitRule.benefit == benefitName,
            )
            .with_only_columns(
                BenefitDependantBenefitRule.dependantBenefitId,
                DependantBenefitRule.benefit,
                DependantBenefitRule.baseRate,
            )
        )
        getBenefits = conn.execute(s)
        dependantBenefit = getBenefits.mappings().all()
        logging.debug(f"dependantBenefit {dependantBenefit}")
        return dependantBenefit

    except Exception as e:
        logging.error(f"getDependantBenefit {mainMemberBenefitId} {benefitName} {e}")
    return None


# @description: get member benefit by name
# @params: conn, benefitName
# @returns: benefit, benefitAmount, CoverAmount
def getMemberBenefitByName(conn, benefitName):
    logging.debug(f"getMemberBenefitByName {benefitName}")
    # get dependant benefit
    try:
        s = (
            BenefitRule.__table__.select()
            .with_hint(BenefitRule, "WITH (NOLOCK)")
            .where(
                BenefitRule.benefit == benefitName,
            )
            .with_only_columns(
                BenefitRule.benefit,
                BenefitRule.benefitAmount,
            )
        )
        getBenefits = conn.execute(s)
        memberBenefit = getBenefits.mappings().all()
        logging.debug(f"memberBenefit {memberBenefit}")
        return memberBenefit

    except Exception as e:
        logging.error(f"getMemberBenefitByName {benefitName} {e}")
    return None


# @description: get main member benefit for age and member counts
# @params: conn, productionOptionId, coverAmount, age, spouse, children, extended
# @returns: benefitId
def getMainMemberBenefitByBenefitId(conn, mainMemberBenefitId):
    logging.debug(f"getMainMemberBenefit {mainMemberBenefitId}")

    # get main member benefit
    try:
        s = (
            ProductOptionBenefit.__table__.select()
            .with_hint(ProductOptionBenefit, "WITH (NOLOCK)")
            .join(BenefitRule, ProductOptionBenefit.benefitId == BenefitRule.benefitId)
            .with_hint(BenefitRule, "WITH (NOLOCK)")
            .where(
                BenefitRule.benefitId == mainMemberBenefitId,
            )
            .with_hint(BenefitRule, "WITH (NOLOCK)")
            .with_only_columns(
                ProductOptionBenefit.benefitId,
                BenefitRule.benefit,
                BenefitRule.otherBenefit,
                BenefitRule.parentBenefit,
            )
            .order_by(BenefitRule.benefitId)
        )
        getBenefits = conn.execute(s)
        return getBenefits.mappings().all()[0]

    except Exception as e:
        logging.error(f"getMainMemberBenefit {mainMemberBenefitId} {e}")
    return None
