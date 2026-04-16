import { logger } from "../middleware/logger";

export const contactNoValidator = (contactNo: string) => {
  // if contactNo is empty
  if (contactNo === "" || !contactNo) {
    return null;
  }

  // remove all spaces from contactNo
  contactNo = String(contactNo).replace(/\s/g, "");

  const regex = /^0[6-8][0-9]{8}$/;
  if (!regex.test(contactNo)) {
    console.log("contactNo is invalid: must be 10 digits starting with 06, 07 or 08");
    return null;
  }

  return contactNo;
};

export const emailValidator = (email: string): boolean => {
  // regex check if email is valid
  // alt if below gives issues /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return false;
  }

  return true;
};

export const SAIDValidator = (idNumber: string) => {
  // remove all spaces from idNumber
  idNumber = String(idNumber).replace(/\s/g, "");

  // regex check if idNumber contains only numbers
  const regex = /^[0-9]+$/;
  if (!regex.test(idNumber)) {
    return false;
  }

  // check if idNumber is 13 digits
  let idLength: number = idNumber.length;

  if (idLength != 13) {
    return false;
  }

  // check if first 6 digits are a valid date
  let year: number = Number(idNumber.substring(0, 2));
  let month: number = Number(idNumber.substring(2, 4));
  let day: number = Number(idNumber.substring(4, 6));

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  logger.debug(`Year: ${year}, Month: ${month}, Day: ${day}`);

  // set dob to date object
  let dob: Date = new Date(year, month - 1, day);

  // calculate age from dob
  let age: number = new Date().getFullYear() - dob.getFullYear();

  // assume age is less than 100
  if (age > 100) {
    dob = new Date(year + 2000, month - 1, day);
  }

  logger.debug(`DOB: ${dob}`);

  // luhn to loop over idNumber
  let luhn1: number = 0;
  let luhn2: string = "";
  for (let i = 0; i < idLength - 1; i++) {
    if (i % 2 == 0) {
      luhn1 += Number(idNumber.substring(i, i + 1));
    } else {
      luhn2 = luhn2.concat(idNumber.substring(i, i + 1));
    }
  }

  luhn2 = String(Number(luhn2) * 2);

  for (let i = 0; i < luhn2.length; i++) {
    luhn1 += Number(luhn2.substring(i, i + 1));
  }

  luhn1 =
    String(luhn1).substring(1, 2) == "0"
      ? 0
      : 10 - Number(String(luhn1).substring(1, 2));

  // check if last digit is equal to luhn1
  if (luhn1 != Number(idNumber.substring(idLength - 1, idLength))) {
    return false;
  }

  // check if last 7 characters are 0000000
  if (idNumber.substring(6, 13) == "0000000") {
    return false;
  }

  // return true
  return true;
};
