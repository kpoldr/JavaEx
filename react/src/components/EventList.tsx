import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import DeleteIcon from "@mui/icons-material/Delete";
import { IEvent } from "../domain/IEvent";
import { EventService } from "../services/EventService";
import dayjs from "dayjs";
import { NavLink } from "react-router-dom";


const EventList = (props: any) => {

  const [events, setEvents] = useState<IEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const eventService = new EventService();


  useEffect(() => {
    
    let tempEvents: IEvent[] = [];
    let tempPastEvents: IEvent[] = [];

    props.events.forEach((dbEvent: IEvent) => {
      if (dayjs(dbEvent.date) > dayjs()) {
        tempEvents.push(dbEvent);
      } else {
        tempPastEvents.push(dbEvent);
      }
    });

    setEvents(tempEvents);
    setPastEvents(tempPastEvents);
    setLoading(false);

  }, [props.events]);


  const DeleteEvent = async (id: number, index: number) => {

    eventService.delete(id);
    const arrCopy = Array.from(events);
    arrCopy.splice(index, 1);
    setEvents(arrCopy);
  };


  const DeletePastEvent = async (id: number, index: number) => {

    eventService.delete(id);
    const arrCopy = Array.from(pastEvents);
    arrCopy.splice(index, 1);
    setPastEvents(arrCopy);
  };


  return (
    <>
      <List
        sx={{ height: "100%", width: "100%", bgcolor: "background.paper", overflow: "auto" }}
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            <Grid container>
              <Grid item xs={12} md={8}>
                <h2>Üritused</h2>
              </Grid>
              <Grid item xs={12} md={4} display="flex" justifyContent="center" alignItems="center">
                <Button fullWidth component={NavLink} to="/Create" color="success" variant="contained">
                  Lisa
                </Button>
              </Grid>
            </Grid>
          </ListSubheader>
        }>
        {loading ? (
          <Box sx={{ height: "85%" }} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          events.map((item, index) => {
            return (
                <ListItem
                  disablePadding
                  key={item.id}
                  secondaryAction={
                    <IconButton  onClick={() => DeleteEvent(item.id!, index)} edge="end" aria-label="delete">
                      <DeleteIcon htmlColor="#ff7b7b" />
                    </IconButton>
                  }>
                  <ListItemButton  onClick={(index) => props.onChange(item.id)}>
                    <Grid container  display="flex" alignItems="center">
                      <Grid item xs={1}>
                        <ListItemIcon >
                          <EventIcon/>
                        </ListItemIcon>
                      </Grid>
                      <Grid item  xs={8}>
                        <ListItemText 
                          primary={
                            <Typography noWrap sx={{ mr: 2 }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography noWrap sx={{ fontSize: "0.8rem", color: "text.secondary", mr: 2 }}>
                              {item.address}
                            </Typography>
                          }
                        />
                      </Grid >
                      <Grid item  xs={3}>
                        <Typography> {dayjs(item.date).format("DD/MM/YY - HH:mm")} </Typography>
                      </Grid>
                    </Grid>
                  </ListItemButton>
                </ListItem>
            );
          })
        )

        }

        {!loading && pastEvents.length > 0 && events.length > 0 ? <Divider /> : null}

        
        {!loading ? 
        
        (pastEvents.map((item, index) => {
          return (
              <ListItem
                disablePadding
                key={index}
                secondaryAction={
                  <IconButton onClick={() => DeletePastEvent(item.id!, index)} edge="end" aria-label="delete">
                    <DeleteIcon  color="error" />
                  </IconButton>
                }>
                <ListItemButton  key={index} onClick={(index) => props.onChange(item.id)}>
                  <Grid container display="flex" alignItems="center">
                    <Grid item xs={1} >
                      <ListItemIcon>
                        <EventIcon color="disabled" />
                      </ListItemIcon>
                    </Grid>
                    <Grid item xs={8}>
                      <ListItemText
                        primary={
                          <Typography color="darkgray" noWrap sx={{ mr: 2 }}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography noWrap sx={{ fontSize: "0.8rem", color: "gray", mr: 2 }}>
                            {item.address}
                          </Typography>
                        }
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Typography color="gray"> {dayjs(item.date).format("DD/MM/YY - HH:mm")} </Typography>
                    </Grid>
                  </Grid>
                </ListItemButton>
              </ListItem>
          );
        })): null}
      </List>
    </>
  );
};

export default EventList;
