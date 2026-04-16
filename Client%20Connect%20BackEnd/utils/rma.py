def returnMemberType(MemberType):
    match MemberType:
        case "Main Member":
            return 1
        case "Spouse":
            return 2
        case "Child":
            return 3
        case "Extended Family":
            return 4
        case "Stillborn":
            return 5
    return 6


def returnRolePlayerType(MemberTypeId):
    match MemberTypeId:
        case 1:
            return 10
        case 2:
            return 11
        case 3:
            return 32
        case 5:
            return 32
        case 4:
            return 38
        case 6:
            return 41
    return 0


def returnMemberTypeFromRolePlayer(RolePlayerTypeId):
    match RolePlayerTypeId:
        case 10:
            return 1
        case 11:
            return 2
        case 32:
            return 3
        case 38:
            return 4
        case 41:
            return 6
    return 0


def returnCoverAmount(Benefit):

    if not Benefit:
        return 0
    if "100k" in Benefit.replace(" ", "").lower():
        return 100000
    if "95k" in Benefit.replace(" ", "").lower():
        return 95000
    if "90k" in Benefit.replace(" ", "").lower():
        return 90000
    if "85k" in Benefit.replace(" ", "").lower():
        return 85000
    if "80k" in Benefit.replace(" ", "").lower():
        return 80000
    if "75k" in Benefit.replace(" ", "").lower():
        return 75000
    if "70k" in Benefit.replace(" ", "").lower():
        return 70000
    if "65k" in Benefit.replace(" ", "").lower():
        return 65000
    if "60k" in Benefit.replace(" ", "").lower():
        return 60000
    if "55k" in Benefit.replace(" ", "").lower():
        return 55000
    if "50k" in Benefit.replace(" ", "").lower():
        return 50000
    if "45k" in Benefit.replace(" ", "").lower():
        return 45000
    if "40k" in Benefit.replace(" ", "").lower():
        return 40000
    if "35k" in Benefit.replace(" ", "").lower():
        return 35000
    if "30k" in Benefit.replace(" ", "").lower():
        return 30000
    if "25k" in Benefit.replace(" ", "").lower():
        return 25000
    if "20k" in Benefit.replace(" ", "").lower():
        return 20000
    if "18k" in Benefit.replace(" ", "").lower():
        return 18000
    if "15k" in Benefit.replace(" ", "").lower():
        return 15000
    if "10k" in Benefit.replace(" ", "").lower():
        return 10000
    if "7.5k" in Benefit.replace(" ", "").lower():
        return 7500
    if "5k" in Benefit.replace(" ", "").lower():
        return 5000

    return 0


def returnCommunicationType(Type):
    match Type:
        case "Email":
            return 1
        case "SMS":
            return 3
        case "Post":
            return 1
        case "Phone":
            return 3
        case _:
            return 3
