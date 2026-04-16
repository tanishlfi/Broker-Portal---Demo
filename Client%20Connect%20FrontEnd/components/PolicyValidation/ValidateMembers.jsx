import dayjs from "dayjs";
import * as Yup from "yup";

let mainMember = Yup.object({
  idTypeId: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  surname: Yup.string().required("Required"),
  idNumber: Yup.string().when("idTypeId", {
    is: "1",
    then: Yup.string()
      .required("Id Number is required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid"
      ),
  }),

  thisField: Yup.number().required("Required"),

  preferredCommunicationTypeId: Yup.string().required("Required"),

  cellNumber: Yup.number()
    .nullable()
    .when("preferredCommunicationTypeId", {
      is: (val) => String(val) === "2" || String(val) === "3",
      then: Yup.number().required(
        "Cell Number is required when preferred communication is Phone or SMS"
      ),
    }),

  emailAddress: Yup.string()
    .nullable()
    .when("preferredCommunicationTypeId", {
      is: (val) => String(val) === "1",
      then: Yup.string()
        .email("Invalid email address")
        .required(
          "Email address is required if preferred communication is email"
        ),
    }),

  PolicyMember: Yup.object({
    memberTypeId: Yup.number().required("Required"),
    statedBenefitId: Yup.number().required("Required"),
  }),

  // age cannot be more than 65 Or less than 18
  dateOfBirth: Yup.date()
    .required("Required")
    .max(dayjs().subtract(18, "year"), "You must be at least 18 years old")
    .min(dayjs().subtract(65, "year"), "You must be less than 65 years old"),
});

const spouse = Yup.object({
  idTypeId: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  surname: Yup.string().required("Required"),
  idNumber: Yup.string().when("idTypeId", {
    is: "1",
    then: Yup.string()
      .required("Id Number is required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid"
      ),
  }),

  preferredCommunicationTypeId: Yup.string().nullable(),

  cellNumber: Yup.number().when("preferredCommunicationTypeId", {
    is: (val) => String(val) === "2" || String(val) === "3",
    then: Yup.number().required(
      "Cell Number is required when preferred communication is Phone or SMS"
    ),
  }),

  emailAddress: Yup.string().when("preferredCommunicationTypeId", {
    is: (val) => String(val) === "1",
    then: Yup.string()
      .email("Invalid email address")
      .required(
        "Email address is required if preferred communication is email"
      ),
  }),

  dateOfBirth: Yup.string().when("idType", {
    is: 2,
    then: Yup.string().required("Required"),
  }),
});

const ValidateMembers = async () => {
  let members = [
    {
      id: "45f7da87-3f13-4544-87bd-80bc578d05e2",
      client_type: "main_member",
      confirmed: false,
      title: "",
      firstName: "test",
      surname: "test",
      idNumber: "324344",
      dateOfBirth: "1987-06-07T13:12:37.000Z",
      idTypeId: 2,
      isVopdVerified: false,
      dateVopdVerified: "",
      cellNumber: "",
      emailAddress: "test@email.com",
      preferredCommunicationTypeId: 1,
      tellNumber: "",
      gender: 1,
      addressTypeId: 1,
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      countryId: "",
      PolicyMember: {
        memberTypeId: 1,
        isBeneficiary: false,
        notes: [],
      },
    },
  ];
  let errors = [];

  // try {
  //   let stuff = await mainMember.validate(members, { returnError: true });
  //   console.log(stuff);
  // } catch (error) {
  //   errors.push({
  //     message: error.message,
  //     field: error.path,
  //     memberId: members.PolicyMember.memberTypeId,
  //   });
  // }

  members.forEach(async (member) => {
    if (member.PolicyMember.memberTypeId === 1) {
      try {
        let stuff = await mainMember.validate(member);
        console.log(stuff);
      } catch (error) {
        errors.push({
          message: error.message,
          field: error.path,
          memberId: member.PolicyMember.memberTypeId,
        });
      }
    }
    if (member.PolicyMember.memberTypeId === 2) {
      try {
        await spouse.validate(member, { returnError: true });
      } catch (error) {
        errors.push({
          message: error.message,
          field: error.path,
          memberId: member.PolicyMember.memberTypeId,
        });
      }
    }
  });

  if (errors.length > 0) {
    return errors;
  } else {
    return "valid";
  }
  // return stuff;
};

export default ValidateMembers;
