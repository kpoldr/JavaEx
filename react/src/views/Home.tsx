import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import EventDetails from "../components/EventDetails";
import EventList from "../components/EventList";
import { IEvent } from "../domain/IEvent";
import dayjs from "dayjs";
import { EventService } from "../services/EventService";

const initialSelectedEvent: IEvent = {
  id: -1,
  name: "",
  description: "",
  date: dayjs("2014-08-18T21:11:54").toString(),
  address: "",
  price: 0,
  eventParticipations: [],
};

const eventsFromDb: IEvent[] = [];

function Home() {
  const [selectedEventId, setSelectedEventId] = useState(-1);
  const [selectedEvent, setSelectedEvent] = useState(initialSelectedEvent);


  const [events, setEvents] = useState(eventsFromDb);

  useEffect(() => {
    const eventService = new EventService();

    if (selectedEventId > 0) {
      eventService.get(selectedEventId).then((data) => setSelectedEvent(data));
    }
  }, [selectedEventId]);

  useEffect(() => {
    
    const eventService = new EventService();

    eventService.getAll().then((data) => setEvents(data));
  }, []);

  return (
    <>
      <Grid container spacing={5}>
        <Grid item xs={12} md={5}>
          <Paper
            elevation={5}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 800,
            }}>
            <EventList events={events} onChange={(value: number) => setSelectedEventId(value)} />

          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={4}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 800,
            }}>
            <EventDetails {...selectedEvent} />
          </Paper>
        </Grid>
      </Grid>

    </>
  );
}

export default Home;
