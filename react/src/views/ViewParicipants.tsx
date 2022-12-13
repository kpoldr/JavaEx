import { Box, Button, Container, Grid, IconButton, Modal, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { IEventParticipation } from "../domain/IEventParticipation";
import { EventParticipationService } from "../services/EventParticipationService";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Backdrop from "@mui/material/Backdrop";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import TableRow from "@mui/material/TableRow";
import { EventService } from "../services/EventService";
import AddParticipant from "./AddParticipant";
import { IEvent } from "../domain/IEvent";
import EditCompany from "../components/EditCompany";
import EditPerson from "../components/EditPerson";
import DetailsPerson from "../components/DetailsPerson";
import DetailsCompany from "../components/DetailsCompany";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  height: "100%",
  boxShadow: 24,
  pb: 5,
};

const initialSelectedEvent: IEvent = {
  id: -1,
  name: "",
  description: "",
  date: dayjs("2014-08-18T21:11:54").toString(),
  address: "",
  price: 0,
  eventParticipations: [],
};

const initialSelectedParticipation: IEventParticipation = {
  id: 0,
  eventId: 0,
  personId: 0,
  person: undefined,
  companyId: 0,
  company: undefined,
  numOfParticipants: 0,
  paymentType: "",
  extraInfo: "",
};

function ViewParticpants() {
  const eventParticipationService = new EventParticipationService();
  const eventService = new EventService();

  const handleClose = () => setOpen(false);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IEvent>(initialSelectedEvent);
  const [selectedParticipation, setSelectedParticipation] = useState<IEventParticipation>(initialSelectedParticipation);
  const [participants, setParticipants] = useState<IEventParticipation[]>([]);
  const [personRows, setPersonRows] = useState<IEventParticipation[]>([]);
  const [companyRows, setCompanyRows] = useState<IEventParticipation[]>([]);
  const [toOpen, setToOpen] = useState("");

  let { id } = useParams();

  const DeletePerson = async (personId: number, orderId: number) => {
    eventParticipationService.deletePerson(personId, Number(id));

    const arrCopy = Array.from(personRows);

    arrCopy.splice(orderId, 1);

    setPersonRows(arrCopy);
  };

  const DeleteCompany = async (companyId: number, orderId: number) => {
    eventParticipationService.deleteCompany(companyId, Number(id));

    const arrCopy = Array.from(companyRows);

    arrCopy.splice(orderId, 1);

    setCompanyRows(arrCopy);
  };

  const AddButtonClicked = () => {
    eventParticipationService.getAllId(Number(id)).then((data) => setParticipants(data));
  };

  const handleOpen = (toOpen: string, participation?: IEventParticipation) => {
    if (participation !== undefined) {
      setSelectedParticipation(participation)
    }

    setToOpen(toOpen);
    setOpen(true);
  };

  useEffect(() => {
    eventParticipationService.getAllId(Number(id)).then((data) => setParticipants(data));
    
    eventService
      .get(Number(id))
      .then((data) => setCurrentEvent(data))
      .catch(() => navigate("/404"));
  }, []);

  useEffect(() => {
    let personsFromDb: IEventParticipation[] = [];
    let companiesFromDb: IEventParticipation[] = [];

    participants.forEach((participant) => {
      if (participant.person !== null) {
        personsFromDb.push(participant);
      } else if (participant.company !== null) {
        companiesFromDb.push(participant);
      }
    });

    setPersonRows(personsFromDb);
    setCompanyRows(companiesFromDb);

  }, [participants]);

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}>
        <Box display="flex" alignItems="center" justifyContent="center" sx={modalStyle}>
          {toOpen === "addParticipant" ? <AddParticipant AddButtonClicked={() => AddButtonClicked()} closeModal={(open: boolean) => setOpen(open)} /> : null}
          {toOpen === "editCompany" ? <EditCompany eventParticipation={selectedParticipation} AddButtonClicked={() => AddButtonClicked()} closeModal={(open: boolean) => setOpen(open)} /> : null}
          {toOpen === "editPerson" ? <EditPerson  eventParticipation={selectedParticipation} AddButtonClicked={() => AddButtonClicked()} closeModal={(open: boolean) => setOpen(open)} /> : null}
          {toOpen === "detailsPerson" ? <DetailsPerson eventParticipation={selectedParticipation} AddButtonClicked={() => AddButtonClicked()} closeModal={(open: boolean) => setOpen(open)} /> : null}
          {toOpen === "detailsCompany" ? <DetailsCompany eventParticipation={selectedParticipation} AddButtonClicked={() => AddButtonClicked()} closeModal={(open: boolean) => setOpen(open)} /> : null}
        </Box>
      </Modal>

      <Container component="main" maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={4} md={6}>
            <Box display="flex" alignItems="center" sx={{ pl: 2, height: "100%" }}>
            <Typography variant="h5"  sx={currentEvent.name.length < 50 ? {fontSize: "1.6rem"} : {fontSize: "1.3rem"}}>
              {currentEvent.name}
            </Typography>
            </Box>
          </Grid>

          <Grid item xs={4} md={3}>
            <Button fullWidth disabled={dayjs(currentEvent.date) < dayjs()} onClick={() => handleOpen("addParticipant", undefined)} color="success" variant="contained">
              Lisa
            </Button>
          </Grid>
          <Grid item xs={4} md={3}>
            <Button fullWidth component={NavLink} to={"/"} variant="contained">
              Tagasi
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={5}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 720,
              }}>
              <TableContainer sx={{ maxHeight: "100%" }}>
                <Table stickyHeader size="small" aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={6}>
                        Isikud
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align={"left"} sx={{ width: 30, height: 60 }}>
                        Id
                      </TableCell>
                      <TableCell align={"left"} sx={{ width: 130 }}>
                        Eesnimi
                      </TableCell>
                      <TableCell align={"left"} sx={{ width: 130 }}>
                        Perekonnanimi
                      </TableCell>
                      <TableCell align={"left"} sx={{ width: 120 }}>
                        Isikukood
                      </TableCell>
                      <TableCell align={"center"} sx={{ width: 30 }}>
                        Makse
                      </TableCell>
                      <TableCell align={"left"} sx={{ width: 70 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {personRows.map((item, index) => {
                      return (
                        <TableRow hover={!hovered} onClick={() => !hovered ? handleOpen("detailsPerson", item) : null } key={index} sx={{ wordWrap: "break-word", whiteSpace: "normal", cursor: "pointer" }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.person!.firstName}</TableCell>
                          <TableCell>{item.person!.lastName}</TableCell>
                          <TableCell>{item.person!.idCode}</TableCell>
                          <TableCell align={"center"}>
                            {item.paymentType === "Sularaha" ? (
                              <Tooltip title="Sularaha">
                                <Typography variant="subtitle2">S</Typography>
                              </Tooltip>
                            ) : (item.paymentType === "Pangaülekanne") ? (
                              <Tooltip title="Pangaülekanne">
                                <Typography variant="subtitle2">P</Typography>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Tasuta üritus">
                                <Typography variant="subtitle2">N/A</Typography>
                              </Tooltip>
                            )}
                          </TableCell>

                          <TableCell align={"right"}>
                            <Grid container>
                              <Grid item xs={6}>
                                <IconButton color="success" onMouseOut={() => setHovered(false)} onMouseOver={() => setHovered(true)} onClick={() => handleOpen("editPerson", item)} aria-label="Muuda isikut" component="label">
                                  <EditIcon />
                                </IconButton>
                              </Grid>
                              <Grid item xs={6}>
                                <IconButton color="error" onMouseOut={() => setHovered(false)} onMouseOver={() => setHovered(true)} sx={{ pl:1 }} onClick={() => DeletePerson(item.personId!, index)} aria-label="Eemalda isik" component="label">
                                  <DeleteForeverIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={5}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 720,
              }}>
              <TableContainer sx={{ maxHeight: "100%" }}>
                <Table stickyHeader size="small" aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={6}>
                        Ettevõtted
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align={"left"} style={{ width: 30, height: 60 }}>
                        Id
                      </TableCell>
                      <TableCell align={"left"} style={{ width: 150 }}>
                        Nimi
                      </TableCell>
                      <TableCell align={"left"} style={{ width: 100 }}>
                        Registrikood
                      </TableCell>
                      <TableCell align={"center"} style={{ width: 120 }}>
                        Osalejate arv
                      </TableCell>
                      <TableCell align={"center"} sx={{ width: 30 }}>
                        Makse
                      </TableCell>
                      <TableCell align={"left"} style={{ width: 70 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companyRows.map((item, index) => {
                      return (
                        <TableRow hover={!hovered} onClick={() => !hovered ? handleOpen("detailsCompany", item) : null } sx={{ whiteSpace: "nowrap",  cursor: "pointer"}} key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.company!.name}</TableCell>
                          <TableCell>{item.company!.registerCode}</TableCell>
                          <TableCell align={"center"}>{item.numOfParticipants}</TableCell>
                          <TableCell align={"center"}>
                            {item.paymentType === "Sularaha" ? (
                              <Tooltip title="Sularaha">
                                <Typography variant="subtitle2">S</Typography>
                              </Tooltip>
                            ) : (item.paymentType === "Pangaülekanne") ? (
                              <Tooltip title="Pangaülekanne">
                                <Typography variant="subtitle2">P</Typography>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Tasuta üritus">
                                <Typography variant="subtitle2">N/A</Typography>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell align={"right"}>
                            <Grid container>
                              <Grid item xs={6}>
                                <IconButton  onMouseOut={() => setHovered(false)} onMouseOver={() => setHovered(true)}  color="success" onClick={() => handleOpen("editCompany", item)} aria-label="Muuda ettevõtet" component="label">
                                  <EditIcon />
                                </IconButton>
                              </Grid>
                              <Grid item xs={6}>
                                <IconButton  onMouseOut={() => setHovered(false)} onMouseOver={() => setHovered(true)}  color="error" sx={{ pl: 1 }} onClick={() => DeleteCompany(item.companyId!, index)} aria-label="Eemalda firma" component="label">
                                  <DeleteForeverIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default ViewParticpants;


