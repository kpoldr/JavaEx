import { Alert, Box, Button, Container, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Snackbar, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { IEventParticipation } from "../domain/IEventParticipation";
import { CompanyService } from "../services/CompanyService";

interface IFormInput {
  name: string;
  registerCode: string;
  numOfParticipants: number;
  extraInfo: string;
}

function EditCompany(props: any) {

  const {
    control,
    register,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({
    defaultValues: {
      name: props.eventParticipation.company.name,
      registerCode: props.eventParticipation.company.registerCode,
      numOfParticipants: props.eventParticipation.numOfParticipants,
      extraInfo: props.eventParticipation.extraInfo,
    },
  });

  let { id } = useParams();

  const nameLimit = 50;
  const registreCodeLimit = 8;
  const extraInfoLimit = 5000;

  const [open, setOpen] = useState(false);
  const [payment, setPayment] = useState("Pangaülekanne");
  const [eventFree, setEventFree] = useState(false);
  
  const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayment((event.target as HTMLInputElement).value);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const [resStatus, setResStatus] = React.useState(500);

  const onSubmit: SubmitHandler<IFormInput> = (data: IFormInput) => TryCreate(data);

  useEffect(() => {

    if (props.eventParticipation.paymentType === "N/A") {
      setEventFree(true);
      setPayment("N/A")
    }

  }, [props.eventParticipation]);

  const TryCreate = async (data: IFormInput) => {
    const companyService = new CompanyService();

    let participantAmount = Number(data.numOfParticipants);

    if (isNaN(data.numOfParticipants) || participantAmount % 1 !== 0 || participantAmount < 1) {
      setError("numOfParticipants", { type: "amountOfParticipants" });
      return;
    }

    const eventParticipation: IEventParticipation = {
      eventId: Number(id),
      numOfParticipants: participantAmount,
      paymentType: payment,
      extraInfo: data.extraInfo,
    };

    var res = await companyService.update(props.eventParticipation.eventId, {
      id: props.eventParticipation.companyId!,
      name: data.name,
      registerCode: data.registerCode,
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
              Muuda Ettevõtet
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
                    name="name"
                    control={control}
                    render={() => (
                      <TextField
                        {...register("name", {
                          required: true,
                          maxLength: nameLimit,
                        })}
                        margin="normal"
                        error={Boolean(errors.name)}
                        helperText={Boolean(errors.name) ? "Firma nimi on vajalik" : ""}
                        required
                        fullWidth
                        label="Firma nimi"
                        name="name"
                        autoComplete="todo"
                        variant="filled"
                        inputProps={{
                          maxLength: nameLimit,
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="registerCode"
                    control={control}
                    render={() => (
                      <TextField
                        {...register("registerCode", {
                          required: true,
                          maxLength: 8,
                        })}
                        error={Boolean(errors.registerCode)}
                        helperText={Boolean(errors.registerCode) ? "Registrikood on vajalik" : ""}
                        margin="normal"
                        required
                        fullWidth
                        label="Registrikood"
                        name="registerCode"
                        autoComplete="todo"
                        variant="filled"
                        inputProps={{
                          maxLength: registreCodeLimit,
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="numOfParticipants"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        {...register("numOfParticipants", {
                          required: true,
                        })}
                        margin="normal"
                        error={Boolean(errors.numOfParticipants)}
                        helperText={Boolean(errors.numOfParticipants) ? "Palun sisesta korrektne osalejate arv" : ""}
                        required
                        fullWidth
                        label="Osalejate arv"
                        name="numOfParticipants"
                        autoComplete="todo"
                        variant="filled"
                        type="text"
                        inputProps={{
                          maxLength: 8,
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
                        {...register("extraInfo", { maxLength: 5000 })}
                        margin="normal"
                        sx={{ pb: 0 }}
                        variant="filled"
                        fullWidth
                        multiline
                        rows={11.5}
                        onChange={onChange}
                        value={value}
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
              Kahel ettevõte ei saa olla sama registrikood
            </Alert>
          ) : resStatus < 300 ? (
            <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
              Ettevõte muudetud
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

export default EditCompany;
