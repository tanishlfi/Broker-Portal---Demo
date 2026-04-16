function FindDiff(array1, array2) {
  const findMatchingObjects = (arr1, arr2) => {
    const newArr = [];
    arr1.forEach((item1) => {
      arr2.forEach((item2) => {
        if (item1.RolePlayerId === item2.RolePlayerId) {
          newArr.push([item1, item2]);
        }
      });
    });
    return newArr;
  };

  const groupByRolePlayID = (arr1, arr2) => findMatchingObjects(arr1, arr2);

  const grouped = groupByRolePlayID(array1, array2);
  const differences = [];

  grouped.forEach((pair) => {
    const [obj1, obj2] = pair;
    const diffObj = { RolePlayerId: obj1.RolePlayerId };

    const fieldsToCompare = [
      "Benefit",

      "BenefitAmount",

      "BenefitId",

      "CoverAmount",

      "DateOfBirth",

      "DateOfDeath",

      "DateVopdVerified",

      "DeathCertificateNumber",

      "EmailAddress",

      "FirstName",

      "Gender",

      "IdNumber",

      "IdTypeId",

      "IsAlive",

      "IsBeneficiary",

      "IsVopdVerified",

      "MaritalStatus",

      "MemberType",

      "MemberTypeId",

      "MobileNumber",

      "PreferredCommunicationTypeId",

      "Premium",

      "RolePlayerId",

      "SecondaryNumber",

      "Surname",

      "endDate",
      "CoverAmount",
    ];

    fieldsToCompare.forEach((field) => {
      if (obj1[field] !== obj2[field]) {
        diffObj[field] = {
          from: obj1[field] !== undefined ? obj1[field] : "",
          to: obj2[field] !== undefined ? obj2[field] : "",
        };
      }
    });

    if (Object.keys(diffObj).length > 1) {
      // More than just rolePlayerId
      differences.push(diffObj);
    }
  });

  return differences;
}

export default FindDiff;
