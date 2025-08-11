export interface Jobs {
  jobID: number;
  employerID: number;
  employerName: string;
  companyName: string;
  contactNumber: string;
  title: string;
  description: string;
  companyLocation: string;
  ctc: string;
  postedDate: string;    // or Date if you convert it to Date type
  expiryDate: string;    // or Date if you convert it to Date type
  category: string;
  applicationsCount:number|null;
  isActive: boolean;
}
