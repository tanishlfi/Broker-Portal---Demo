export const getAgeByPolicyJoinDate = (dob: Date, joinDate: Date): number => {
  try {
    if (dob && joinDate !== null) {
      return Math.abs(
        new Date(joinDate).getFullYear() - new Date(dob).getFullYear(),
      );
    }

    return -1;
  } catch (err) {
    return -1;
  }
};
