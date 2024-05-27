export interface ResponseObject {
  primaryContatctId: number;
  emails: String[];
  phoneNumbers: String[];
  secondaryContactIds: number[];
}

export interface RequestData {
  phoneNumber: string | null;
  email: string | null;
}
