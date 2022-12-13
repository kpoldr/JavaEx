import { ICompany } from "./ICompany";
import { IPerson } from "./IPerson";

export interface IEventParticipation {
    id?: number;
    eventId: number;
    personId?: number;
    person?: IPerson;
    companyId?: number;
    company?: ICompany;
    numOfParticipants: number;
    paymentType: string;
    extraInfo: string;
}