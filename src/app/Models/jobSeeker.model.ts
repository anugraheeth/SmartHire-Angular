export interface JobSeeker{
    jobSeekerID :number;
    fullName : string;      
    email : string;
    isAproved : boolean;
    isActive : boolean; 
    phoneNumber : number;
    gender : string;
    experience : number;
    skills : string;
    education : string;
    application : number | null;
    createdAt:Date;
    address:string
}