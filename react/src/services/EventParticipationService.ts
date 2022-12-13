import { IEventParticipation } from "../domain/IEventParticipation";
import { BaseService } from "./BaseService";
import httpClient from "./HttpClient";

export class EventParticipationService extends BaseService<IEventParticipation> {
  constructor() {
    super("eventparticipation");
  }

  async getAllId(id: number): Promise<IEventParticipation[]> {
    
    let response = await httpClient.get(`/eventparticipation/${id}`);
    let res = response.data as IEventParticipation[];
    return res;
  }

  async getPerson(personId: number, eventId: number): Promise<IEventParticipation> {
    
    let response = await httpClient.get(`/eventparticipation/person/${personId}/${eventId}`);
    let res = response.data as IEventParticipation;
    return res;
  }
  
  async getCompany(companyId: number, eventId: number): Promise<IEventParticipation> {
    
    let response = await httpClient.get(`/eventparticipation/company/${companyId}/${eventId}`);
    let res = response.data as IEventParticipation;
    return res;
  }

  async deletePerson(personId: number, eventId: number): Promise<IEventParticipation[]> {
    
    let response = await httpClient.delete(`/eventparticipation/person/${personId}/${eventId}`);
    let res = response.data as IEventParticipation[];
    return res;
  }

  async deleteCompany(companyId: number, eventId: number): Promise<IEventParticipation[]> {
    
    let response = await httpClient.delete(`/eventparticipation/company/${companyId}/${eventId}`);
    let res = response.data as IEventParticipation[];
    return res;
  }
}
