export interface Claim{
    claimId?:number;
    patientId:number;
    providerId:number;
    payerId:number;
    amount:number;
    diagnosis:string;
    treatment:string;
    status?:string;
    rejectionReason?:string;
}