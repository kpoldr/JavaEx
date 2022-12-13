import { IEventParticipation } from "./IEventParticipation";

export interface ICompany {
    id?: number;
    name: string;
    registerCode: string;
    eventParticipations: IEventParticipation[];
}