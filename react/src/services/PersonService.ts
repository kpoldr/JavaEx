import { IPerson } from "../domain/IPerson";
import { BaseService } from "./BaseService";

export class PersonService extends BaseService<IPerson> {
  constructor() {
    super("people");
  }

}
