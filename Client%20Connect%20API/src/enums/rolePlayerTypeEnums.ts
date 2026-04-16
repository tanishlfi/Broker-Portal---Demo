export enum RolePlayerTypeEnums {
    POLICY_OWNER = 1,
    'Policy Owner' = POLICY_OWNER,

    POLICY_PAYEE = 2,
    'Policy Payee' = POLICY_PAYEE,

    INSURED_LIFE = 3,
    'Insured Life' = INSURED_LIFE,

    FINANCIAL_SERVICE_PROVIDER = 4,
    'Financial Service Provider' = FINANCIAL_SERVICE_PROVIDER,

    CLAIMANT = 5,
    'Claimant' = CLAIMANT,

    MEDICAL_SERVICE_PROVIDER = 6,
    'Medical Service Provider' = MEDICAL_SERVICE_PROVIDER,

    FUNERAL_PARLOR = 7,
    'Funeral Parlor' = FUNERAL_PARLOR,

    BODY_COLLECTOR = 8,
    'Body Collector' = BODY_COLLECTOR,

    UNDERTAKER = 9,
    'Undertaker' = UNDERTAKER,

    MAIN_MEMBER_SELF = 10,
    'Main Member (self)' = MAIN_MEMBER_SELF,

    SPOUSE = 11,
    'Spouse' = SPOUSE,

    DAUGHTER = 12,
    'Daughter' = DAUGHTER,

    DAUGHTER_IN_LAW = 13,
    'Daughter In Law' = DAUGHTER_IN_LAW,

    SON_IN_LAW = 14,
    'Son In Law' = SON_IN_LAW,

    SON = 15,
    'Son' = SON,

    PARENT = 16,
    'Parent' = PARENT,

    PARENT_IN_LAW = 17,
    'Parent In Law' = PARENT_IN_LAW,

    GRAND_PARENT = 18,
    'Grandparent' = GRAND_PARENT,

    MOTHER = 19,
    'Mother' = MOTHER,

    MOTHER_IN_LAW = 20,
    'Mother In Law' = MOTHER_IN_LAW,

    FATHER = 21,
    'Father' = FATHER,

    FATHER_IN_LAW = 22,
    'Father In Law' = FATHER_IN_LAW,

    BROTHER = 23,
    'Brother' = BROTHER,

    BROTHER_IN_LAW = 24,
    'Brother In Law' = BROTHER_IN_LAW,

    SISTER = 25,
    'Sister' = SISTER,

    SISTER_IN_LAW = 26,
    'Sister In Law' = SISTER_IN_LAW,

    AUNT = 27,
    'Aunt' = AUNT,

    NIECE = 28,
    'Niece' = NIECE,

    NEPHEW = 29,
    'Nephew' = NEPHEW,

    HUSBAND = 30,
    'Husband' = HUSBAND,

    WIFE = 31,
    'Wife' = WIFE,

    CHILD = 32,
    'Child' = CHILD,

    SPECIAL_CHILD = 33,
    'Special Child' = SPECIAL_CHILD,

    OTHER = 34,
    'Other' = OTHER,

    GUARDIAN_RECIPIENT = 35,
    'GuardianRecipient' = GUARDIAN_RECIPIENT,

    PERSON_INDIVIDUAL = 36,
    'PersonIndividual' = PERSON_INDIVIDUAL,

    PENSIONER = 37,
    'Pensioner' = PENSIONER,

    EXTENDED = 38,
    'Extended' = EXTENDED,

    DISABLED_CHILD = 39,
    'DisabledChild' = DISABLED_CHILD,

    UNCLE = 40,
    'Uncle' = UNCLE,

    BENEFICIARY = 41,
    'Beneficiary' = BENEFICIARY,

    COUSIN = 42,
    'Cousin' = COUSIN,

    GRAND_CHILD = 44,
    'GrandChild' = GRAND_CHILD,

    FRIEND = 45,
    'Friend' = FRIEND,
}

export enum CoverMemberTypeEnums {
    MAIN_MEMBER = 1,
    "Main Member" = MAIN_MEMBER,

    SPOUSE = 2,
    "Spouse" = SPOUSE,

    CHILD = 3,
    "Child" = CHILD,

    EXTENDED_FAMILY = 4,
    "Extended Family" = EXTENDED_FAMILY,

    STILL_BORN = 5,
    "Stillborn" = STILL_BORN,

    NOT_APPLICABLE = 6,
    "Not Applicable" = NOT_APPLICABLE,
}

export enum ParserCoverMemberTypeEnums {
    "spouse" = 2,
    "children" = 3,
    "extended" = 4,
}