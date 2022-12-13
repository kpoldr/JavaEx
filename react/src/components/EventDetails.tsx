import { Box, Button, CssBaseline, Grid, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentIcon from "@mui/icons-material/Payment";
import { IEvent } from "../domain/IEvent";
import { IEventParticipation } from "../domain/IEventParticipation";
import PersonIcon from "@mui/icons-material/Person";
import { NavLink } from "react-router-dom";

function EventDetails(event: IEvent) {
  
  const [participants, setParticipants] = useState(0);


  useEffect(() => {
    let allParticipants: number = 0;

    if (event.eventParticipations != null) {
      event.eventParticipations.forEach((participant: IEventParticipation) => {
        allParticipants += participant.numOfParticipants;
      });
    }

    setParticipants(allParticipants);
  }, [event]);


  return (
    <>
      {event?.name !== "" ? (
        <Box
          sx={{
            wordBreak: "break-all",
            height: "100%",
            width: "100%",
            overflow: "auto",
          }}>
          <CssBaseline />

          <Grid container sx={{ mt: 1 }} maxWidth="md" spacing={1.5}>
            <Grid item xs={12}>
              <Typography gutterBottom sx={event.name.length < 32 ? { pt: 3, pl: 1, fontSize: "1.8rem", fontWeight: "bold" } : { pt: 3, pl: 1, pb: 1.4, fontSize: "1.4rem", fontWeight: "bold" }}>
                {event.name}
              </Typography>
            </Grid>

            <Grid item xs={12} md={8} sx={{ height: 170 }}>
              <Paper sx={{ height: "100%" }}>
                <Grid container direction={"column"} sx={{ height: "100%" }}>
                  <Grid item xs={8}>
                    <Typography sx={event.address.length < 64 ? { p: 2, fontSize: "1.4rem" } : { p: 2, fontSize: "1.3rem" }} variant="h6">
                      {event.address}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography sx={{ pl: 2 }} variant="h6" display="flex" alignItems="bottom">
                      <CalendarMonthIcon sx={{ mr: 1 }} /> {dayjs(event.date).format("DD/MM/YY hh:mm")}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} sx={{ height: 170 }}>
              <Paper sx={{ width: "100%", height: "100%" }}>
                <Grid container direction={"column"} sx={{ p: 2, height: "100%" }}>
                  <Grid item xs={6}>
                    <Typography sx={{ pt: 2 }} variant="h5" alignItems="center" display="flex">
                      <PersonIcon sx={{ fontSize: "1.5em", mr: 1 }} /> {participants}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ pt: 2 }} variant="h5" alignItems="center" display="flex">
                      <PaymentIcon sx={{ fontSize: "1.5em", mr: 1 }} /> 

                      {event.price > 0 ? (event.price + "€") : ("TASUTA")}
            
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} sx={{ pb: 1, height: 450 }}>
              <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
                <Typography sx={{ p: 2, whiteSpace: "pre-line" }} variant="h6">
                  {event.description}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} sx={{ height: 40 }}>
              <Button fullWidth disabled={(dayjs(event.date) < dayjs())} component={NavLink} to={`/Event/${event.id}/Add/`} color="success" variant="contained">
                Lisa osaleja
              </Button>
            </Grid>
            <Grid item xs={12} md={6} sx={{ height: 40 }}>
              <Button fullWidth component={NavLink} to={`/Event/${event.id}/Participants`} state={{event: event}} color="secondary" variant="contained">
                Vaata osalejaid
              </Button>
            </Grid>
          </Grid>

        </Box>
      ) : (
        <Box sx={{ height: "100%" }} display="flex" justifyContent="center" alignItems="center">
          <h1>Vali Üritus</h1>
        </Box>
      )}
    </>
  );
}

export default EventDetails;
