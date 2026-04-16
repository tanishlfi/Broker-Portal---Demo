import _isEqual from "lodash/isEqual";

/**
 * Checks if a value is not null, undefined, or an empty/whitespace string.
 * @param {*} value The value to check.
 * @returns {boolean} True if the value has a meaningful value.
 */
const hasMeaningfulValue = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
};

/**
 * Compares two arrays of member objects and generates a list of changes (ADDED, MODIFIED, REMOVED).
 *
 * @param {Array<Object>} initialMembers The initial array of member objects. Each object must have an 'id'.
 * @param {Array<Object>} currentMembers The current array of member objects. Each object must have an 'id'.
 * @param {Array<string>} keysToTrack An array of object keys to monitor for changes.
 * @param {Array<string>} [keysToIgnore=[]] An optional array of additional keys to ignore during comparison.
 * @returns {Array<Object>} An array of change objects.
 */
export const generateMemberChanges = (
  initialMembers,
  currentMembers,
  keysToTrack,
  keysToIgnore = []
) => {
  const changes = [];
  const initialMembersMap = new Map(
    initialMembers.map((member) => [member.id, member])
  );
  const currentMembersMap = new Map(
    currentMembers.map((member) => [member.id, member])
  );

  // Use a Set for more efficient lookups (O(1))
  const ignoredKeysSet = new Set([
    "id",
    "policyId",
    "createdAt",
    "updatedAt",
    "deletedAt",
    ...keysToIgnore,
  ]);

  // Check for ADDED and MODIFIED members
  for (const [id, currentMember] of currentMembersMap) {
    const initialMember = initialMembersMap.get(id);

    if (!initialMember) {
      // Member was ADDED
      const addedModifications = keysToTrack
        .filter((key) => hasMeaningfulValue(currentMember[key]))
        .map((key) => ({
          field: key,
          newValue: currentMember[key],
        }));

      if (addedModifications.length > 0) {
        changes.push({
          type: "ADDED",
          memberId: currentMember.id,
          modifications: addedModifications,
          newData: currentMember, // Providing the full new object is useful
        });
      }
      continue;
    }

    // Member exists in both, check for MODIFICATIONS
    const modifications = [];
    for (const key of keysToTrack) {
      if (ignoredKeysSet.has(key)) {
        continue;
      }

      const oldValue = initialMember[key];
      const newValue = currentMember[key];

      const oldHasValue = hasMeaningfulValue(oldValue);
      const newHasValue = hasMeaningfulValue(newValue);

      // Refactored Logic: A change occurs if meaningfulness changes,
      // or if values change while both are meaningful.
      if (
        oldHasValue !== newHasValue ||
        (oldHasValue && !_isEqual(oldValue, newValue))
      ) {
        modifications.push({ field: key, oldValue, newValue });
      }
    }

    if (modifications.length > 0) {
      changes.push({
        type: "MODIFIED",
        memberId: id,
        modifications: modifications,
      });
    }
  }

  // Check for REMOVED members
  for (const [id, initialMember] of initialMembersMap) {
    if (!currentMembersMap.has(id)) {
      const removedModifications = keysToTrack
        .filter((key) => hasMeaningfulValue(initialMember[key]))
        .map((key) => ({
          field: key,
          oldValue: initialMember[key],
        }));

      // Log removal if the member had meaningful data, or if we are not tracking specific keys (meaning any removal is important).
      if (removedModifications.length > 0 || keysToTrack.length === 0) {
        changes.push({
          type: "REMOVED",
          memberId: id,
          originalData: initialMember, // Providing original data is great for context/logging
          // Assuming plain JS objects now. If member is a Map, use .get()
          client_type: initialMember.client_type || "unknown",
        });
      }
    }
  }

  return changes;
};
