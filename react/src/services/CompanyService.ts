import { ICompany } from "../domain/ICompany";
import { BaseService } from "./BaseService";

export class CompanyService extends BaseService<ICompany> {
  constructor() {
    super("companies");
  }
}
