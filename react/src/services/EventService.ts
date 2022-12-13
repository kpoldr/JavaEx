import { IEvent } from "../domain/IEvent";
import { BaseService } from "./BaseService";

export class EventService extends BaseService<IEvent> {
  constructor() {
    super("events");
  }
}
