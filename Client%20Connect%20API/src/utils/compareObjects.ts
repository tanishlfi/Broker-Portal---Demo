export const compareObjects: any = (obj1: any, obj2: any, fields: string[]) => {
  // return the original values and what it is changed to if it is changed for a field, format should be {field: [originalValue, newValue]}
  const changes: any = {};
  fields.forEach((field) => {
    // console.log(field);
    // console.log(`obj1[field]: ${obj1[field]} obj2[field]: ${obj2[field]}`);
    // compare two date objects
    if (obj1[field] instanceof Date && obj2[field] instanceof Date) {
      if (obj1[field].getTime() !== obj2[field].getTime()) {
        changes[field] = [obj1[field], obj2[field]];
      }
    } else if (obj1[field] !== obj2[field]) {
      changes[field] = [obj1[field], obj2[field]];
    }
  });
  // console.log(changes);
  return changes;
};
