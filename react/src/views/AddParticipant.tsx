import { Box, Button, CircularProgress, Container, Divider, Paper, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IEvent } from "../domain/IEvent";
import { EventService } from "../services/EventService";
import AddCompany from "../components/AddCompany";
import AddPerson from "../components/AddPerson";

const initialSelectedEvent: IEvent = {
  id: -1,
  name: "",
  description: "",
  date: dayjs("2014-08-18T21:11:54").toString(),
  address: "",
  price: 0,
  eventParticipations: [],
};


function AddParticipant(props: any) {

  const navigate = useNavigate();

  const [selectedParticipant, setParticipant] = useState<string | null>("person");
  const [loading, setLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<IEvent>(initialSelectedEvent);

  const location = useLocation();
  let { id } = useParams();


  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment !== null) {
      setParticipant(newAlignment);
    }
  };


  const BackButtonAction = () => {
    if (dayjs(currentEvent.date) < dayjs()) {
      navigate("/");
    } else if (location.pathname === `/Event/${id}/Add/`) {
      navigate(-1);
    } else {
      props.closeModal(false);
    }
  };


  const AddButtonClicked = () =>  {
    
    if (location.pathname === `/Event/${id}/Participants`) {
      props.AddButtonClicked();
    }
    
  };


  useEffect(() => {

    const eventService = new EventService();

    eventService
      .get(Number(id))
      .then((data) => setCurrentEvent(data))
      .then(() => setLoading(false))
      .catch((e) => navigate("/404"));

  }, [id, navigate]);

  
  return (
    <>
      {loading ? (
        <Box minHeight="70vh" display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <Container component="main" maxWidth="md" sx={{pt:5}}>
          {dayjs(currentEvent.date) > dayjs() ? (
            <Paper sx={{ px: 4, pb: 3, pt: 2 }}>
              <Box display="flex" justifyContent="center" sx={{ pb: 2 }}>
                <ToggleButtonGroup size="medium" value={selectedParticipant} exclusive onChange={handleAlignment} aria-label="text alignment">
                  <ToggleButton sx={{width: 100}} value="person" aria-label="left aligned">
                    Isik
                  </ToggleButton>
                  <ToggleButton sx={{width: 100}} value="company" aria-label="centered">
                    Firma
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Divider />

              <Box sx={{ pt: 3 }}>
                {selectedParticipant === "person" && <AddPerson price={currentEvent.price}  AddButtonClicked={() => AddButtonClicked()} />}
                {selectedParticipant === "company" && <AddCompany price={currentEvent.price} AddButtonClicked={() => AddButtonClicked()} />}
              </Box>
              <Button
                fullWidth
                onClick={(e) => {
                  BackButtonAction();
                }}
                variant="contained"
                sx={{ mt: 2 }}>
                Tagasi
              </Button>
            </Paper>
          ) : (
            <>
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ pt: 20, height: "100%" }}>
                <Typography sx={{ fontSize: "1.8rem", fontWeight: "bold" }}>Üritus on möödnud</Typography>
              </Box>
              <Button
                fullWidth
                onClick={(e) => {
                  BackButtonAction();
                }}
                variant="contained"
                sx={{ mt: 2 }}>
                Tagasi
              </Button>
            </>
          )}
        </Container>
      )}
    </>
  );
}

export default AddParticipant;
