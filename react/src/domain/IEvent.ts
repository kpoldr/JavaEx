export interface IEvent {
    id?: number;
    name: string;
    description: string;
    date: string;
    address: string;
    price: number;
    eventParticipations: [] | null;
}