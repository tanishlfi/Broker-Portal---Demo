function DifferencesInPolicies(array1, array2) {
  const findMatchingObjects = (arr1, arr2) => {
    const newArr = [];
    arr1.forEach((item1) => {
      arr2.forEach((item2) => {
        if (item1.rolePlayerId === item2.rolePlayerId) {
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
    const diffObj = { rolePlayerId: obj1.rolePlayerId };

    const fieldsToCompare = [
      "cellNumber",
      "dateOfBirth",
      "dateVopdVerified",
      "emailAddress",
      "firstName",
      "gender",
      "preferredCommunicationTypeId",
      "surname",
      "tellNumber",
      "title",
      "isStudent",
      "isDisabled",
      "addressLine1",
      "addressLine2",
      "city",
      "updatedAt",
      "postalCode",
      "statedBenefit",
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

export default DifferencesInPolicies;
