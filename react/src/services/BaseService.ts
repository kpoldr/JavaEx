import httpClient from "./HttpClient";
import type { AxiosError } from "axios";
import { IServiceResult } from "../domain/IServiceResult";


export class BaseService<Tentity> {

  constructor(private path: string) {}
  async getAll(): Promise<Tentity[]> {
    
    try {
      let response = await httpClient.get(`/${this.path}`);

      let res = response.data as Tentity[];

      return res;

    } catch (e) {
      let errorMessage : any = (e as AxiosError).response!.data

      let response = {
          status: (e as AxiosError).response!.status,
          errorMessage: errorMessage.errors.code,
          arguments: errorMessage.errors.arguments,
      };

    }

    return [];
  }

  async get(id: number): Promise<Tentity> {
    let response = await httpClient.get(`/${this.path}/${id}`);
    
    let res = response.data as Tentity;
    return res;
  }

  async add(entity: Tentity): Promise<IServiceResult<void>> {

    let response;
    try {
      response = await httpClient.post(`/${this.path}`, entity);
    } catch (e) {
      
      let errorMessage : any = (e as AxiosError)

      let response = {
          code: errorMessage.response.data.code,
          errorMessages: errorMessage.response.data.arguments,
      };
      
      return {status: errorMessage.response.status, errorMessage: response};
    }

    return {data: response.data, status: response.status};
  }

  async update(id: string, entity: Tentity): Promise<IServiceResult<void>> {

    let response;
    try {
      response = await httpClient.put(`/${this.path}/${id}`, entity);
    } catch (e) {

      let errorMessage : any = (e as AxiosError)

      let response = {
          code: errorMessage.response.data.code,
          errorMessages: errorMessage.response.data.arguments,
      };
      
      return {status: errorMessage.response.status, errorMessage: response};
    }

    return { status: 200 };
  }

  async delete(id: number): Promise<IServiceResult<void>> {

    let response;

    try {
      response = await httpClient.delete(`/${this.path}/${id}`);
    } catch (e) {
      
      let errorMessage : any = (e as AxiosError)

      let error = {
          code: errorMessage.response.data.code,
          errorMessages: errorMessage.response.data.arguments,
      };
      
      return {status: errorMessage.response.status, errorMessage: error};
    }

    return { status: 200 };
  }
}
