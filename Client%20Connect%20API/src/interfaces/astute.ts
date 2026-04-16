interface VerificationDetailsObj {
  Gender: string;
  MaritalStatus: string;
  DateOfDeath: Date;
  DateOfBirth: Date;
  PlaceOfDeath: string;
  CauseOfDeath: string;
  DeathUnderInvestigation: boolean;
  VopdVerificationType: number;
  IdNumber: string;
  ErrorMessage: string;
  SmartId: string;
  Surname: string;
  Forename: string;
  DeceasedStatus: string;
  RequestMessageId: string;
}

export interface ResponseDataObj {
  TransRefGuid: string;
  // TrackingReference: string;
  // RequestDateTime: Date;
  VopdRequestStatus: number;
  VopdRequestSource: number;
  VerificationDetails: VerificationDetailsObj[];
}
