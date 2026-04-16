const DataParserForSubmission = ({ members, policyDetails, status }) => {
  const membersArr = members.map((member) => {
    return {
      ...member,

      dateOfBirth: new Date(member?.dateOfBirth),
      PolicyMember: {
        ...member.PolicyMember,
      },
    };
  });

  // if the item is empty, this will remove it from the array
  const newArr = membersArr.map((obj) => {
    const newObj = { ...obj };
    for (const prop in newObj) {
      if (newObj[prop] === "") {
        newObj[prop] = null;
      }
    }

    // check props in newObj.policyMember
    if (newObj.PolicyMember) {
      for (const prop in newObj.PolicyMember) {
        if (newObj.PolicyMember[prop] === "") {
          newObj.PolicyMember[prop] = null;
        }
      }
    }

    // if newObj.id is not an integer or empty remove it
    if (!Number.isInteger(newObj.id) || newObj.id === "") {
      delete newObj.id;
    }
    return newObj;
  });

  policyDetails.status = status;

  // in policyDetails, if prop providerInceptionDate is not null convert to date only
  if (policyDetails.providerInceptionDate) {
    policyDetails.providerInceptionDate = new Date(
      policyDetails.providerInceptionDate,
    );
  }

  const data = {
    ...policyDetails,
    members: newArr,
  };

  return data;
};

export default DataParserForSubmission;
