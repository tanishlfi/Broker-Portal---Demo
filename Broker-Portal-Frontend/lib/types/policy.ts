export interface Member {
  id: string;
  name: string;
  gender: string;
  premium: number;
  lastPayment: string;
}

export interface PolicyCover {
  type: string;
  policyNo: string;
  coverPerEmployee: number;
  employeesCovered: number;
  totalCoverage: number;
  monthlyPremium: number;
  status: "Active" | "Expired" | "Cancelled" | "Pending";
}

export interface PolicyDetail {
  policyNumber: string;
  companyName: string;
  registrationNumber: string;
  industry: string;
  numberOfEmployees: number;
  address: string;
  contactPerson: string;
  position: string;
  email: string;
  phone: string;
  covers: PolicyCover[];
}
