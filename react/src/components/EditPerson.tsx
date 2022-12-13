import { Alert, Box, Button, Container, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Snackbar, TextField, Typography } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { IEventParticipation } from "../domain/IEventParticipation";
import { PersonService } from "../services/PersonService";

interface IFormInput {
  firstName: string;
  lastName: string;
  idCode: string;
  extraInfo: string;
}

function EditPerson(props: any) {
  const {
    control,
    register,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({
    defaultValues: {
      firstName: props.eventParticipation.person.firstName,
      lastName: props.eventParticipation.person.lastName,
      idCode: props.eventParticipation.person.idCode,
      extraInfo: props.eventParticipation.extraInfo,
    },
  });

  let { id } = useParams();

  const nameLimit = 32;
  const idCodeLimit = 11;
  const extraInfoLimit = 1500;

  const [open, setOpen] = useState(false);
  const [resStatus, setResStatus] = useState(500);
  const [payment, setPayment] = useState("Pangaülekanne");
  const [eventFree, setEventFree] = useState(false);

  const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayment((event.target as HTMLInputElement).value);
  };

  const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
  
    if (props.eventParticipation.paymentType === "N/A") {
      setEventFree(true);
      setPayment("N/A")
    }

  }, [props.eventParticipation]);

  const onSubmit: SubmitHandler<IFormInput> = (data: IFormInput) => TryCreate(data);

  const CheckIdCode = (idCode: string) => {
    let controlNumber = 0;
    let counter = 0;

    for (let i = 0; i < 10; i++) {
      if (i + 1 >= 10) {
        counter = i - 8;
      } else {
        counter = i + 1;
      }

      controlNumber += parseInt(idCode[i]) * counter;
    }

    let moduloNumber = controlNumber % 11;

    if (moduloNumber < 9) {
      if (parseInt(idCode[10]) === moduloNumber) {
        return true;
      }

      return false;
    }

    controlNumber = 0;

    for (let i = 0; i < 10; i++) {
      if (i + 3 >= 10) {
        counter = i - 6;
      } else {
        counter = i + 3;
      }

      controlNumber += parseInt(idCode[i]) * counter;
    }

    if (moduloNumber < 9) {
      if (parseInt(idCode[10]) === moduloNumber) {
        return true;
      }
    }

    if (parseInt(idCode[10]) === 0) {
      return true;
    }

    return false;
  };

  const TryCreate = async (data: IFormInput) => {
    const personService = new PersonService();

    let idCodeNumeric = parseInt(data.idCode);

    if (isNaN(idCodeNumeric) || idCodeNumeric.toString().length !== 11 || CheckIdCode(data.idCode) === false) {
      setError("idCode", { type: "idCode" });
      return;
    }

    const eventParticipation: IEventParticipation = {
      eventId: Number(id),
      numOfParticipants: 1,
      paymentType: payment,
      extraInfo: data.extraInfo,
    };

    var res = await personService.update(props.eventParticipation.eventId, {
      id: props.eventParticipation.personId!,
      firstName: data.firstName,
      lastName: data.lastName,
      idCode: data.idCode,
      eventParticipations: [eventParticipation],
    });

    if (res.status < 300) {
      props.AddButtonClicked();
      props.closeModal(false);
    }

    setResStatus(res.status);

    setOpen(true);
  };

  return (
    <Container component="main" maxWidth="md" sx={{ pt: 5 }}>
      <Paper sx={{ px: 4, pb: 4, pt: 3 }}>
        <FormControl fullWidth>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h5" sx={{ textAlign: "center", mb: 1 }}>
              Muuda Isikut
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={() => (
                      <TextField
                        {...register("firstName", {
                          required: true,
                          maxLength: 64,
                        })}
                        margin="normal"
                        error={Boolean(errors.firstName)}
                        helperText={Boolean(errors.firstName) ? "Eesnimi on vajalik" : ""}
                        required
                        fullWidth
                        label="Eesnimi"
                        name="firstName"
                        autoComplete="firstName"
                        variant="filled"
                        inputProps={{
                          maxLength: nameLimit,
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="lastName"
                    control={control}
                    render={() => (
                      <TextField
                        {...register("lastName", {
                          required: true,
                          maxLength: 64,
                        })}
                        error={Boolean(errors.lastName)}
                        helperText={Boolean(errors.lastName) ? "Perekonnanimi on vajalik" : ""}
                        margin="normal"
                        required
                        fullWidth
                        label="Perekonnanimi"
                        name="lastName"
                        autoComplete="lastName"
                        variant="filled"
                        inputProps={{
                          maxLength: nameLimit,
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="idCode"
                    control={control}
                    render={() => (
                      <TextField
                        {...register("idCode", {
                          required: true,
                          maxLength: 11,
                          minLength: 11,
                        })}
                        margin="normal"
                        error={Boolean(errors.idCode)}
                        helperText={Boolean(errors.idCode) ? "Sisesta korrektne isikukood" : ""}
                        required
                        fullWidth
                        label="Isikukood"
                        name="idCode"
                        autoComplete="idCode"
                        variant="filled"
                        type="text"
                        inputProps={{
                          maxLength: idCodeLimit,
                        }}
                      />
                    )}
                  />

                  <Box sx={{ pt: 2 }}>
                    <FormLabel id="payment">Makseviis</FormLabel>
                    <RadioGroup row aria-labelledby="payment" value={payment} onChange={handlePaymentChange}>
                      <Grid container>
                        <Grid item xs={6}>
                          <FormControlLabel disabled={eventFree} value="Pangaülekanne" control={<Radio />} label="Pangaülekanne" />
                        </Grid>

                        <Grid item xs={6}>
                          <FormControlLabel disabled={eventFree} sx={{ pl: 4 }} value="Sularaha" control={<Radio />} label="Sularaha" />
                        </Grid>
                      </Grid>
                    </RadioGroup>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="extraInfo"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        {...register("extraInfo", { maxLength: 1500 })}
                        onChange={onChange}
                        value={value}
                        margin="normal"
                        sx={{ pb: 0 }}
                        variant="filled"
                        fullWidth
                        multiline
                        rows={11.5}
                        helperText={`${value.length}/${extraInfoLimit}`}
                        name="extraInfo"
                        label="Lisa Info"
                        autoComplete="extraInfo"
                        inputProps={{
                          maxLength: extraInfoLimit,
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" fullWidth variant="contained" color="success">
                    Muuda
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      props.closeModal(false);
                    }}
                    variant="contained"
                    sx={{ mt: 2 }}>
                    Tagasi
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </FormControl>

        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          {resStatus === 409 ? (
            <Alert onClose={handleClose} severity="warning" sx={{ width: "100%" }}>
              Kahel isikul ei saa olla sama isikukood
            </Alert>
          ) : resStatus < 300 ? (
            <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
              Isik muudetud
            </Alert>
          ) : (
            <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
              Muutmisel tekkis probleem
            </Alert>
          )}
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default EditPerson;
