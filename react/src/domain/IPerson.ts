import { IEventParticipation } from "./IEventParticipation";

export interface IPerson {
    id?: number;
    firstName: string;
    lastName: string;
    idCode: string;
    eventParticipations: IEventParticipation[];
}