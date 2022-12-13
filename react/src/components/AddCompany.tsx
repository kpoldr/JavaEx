import { Alert, Box, Button, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Snackbar, TextField, Typography } from "@mui/material";
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

function AddCompany(props: any) {
  const {
    control,
    register,
    resetField,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({
    defaultValues: {
      name: "",
      registerCode: "",
      extraInfo: "",
      numOfParticipants: 0,
    },
  });

  const nameLimit = 50;
  const registreCodeLimit = 8;
  const extraInfoLimit = 5000;

  let { id } = useParams();

  const [open, setOpen] = useState(false);
  const [eventFree, setEventFree] = useState(false);
  const [payment, setPayment] = useState("Pangaülekanne");

  const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayment((event.target as HTMLInputElement).value);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (props.price === 0) {
      setEventFree(true)
      setPayment("N/A")
    }
  
  }, [props.price])

  const [resStatus, setResStatus] = React.useState(500);

  const onSubmit: SubmitHandler<IFormInput> = (data: IFormInput) => TryCreate(data);

  const TryCreate = async (data: IFormInput) => {
    const companyService = new CompanyService();

    let participantAmount = Number(data.numOfParticipants);
    let registerCode = parseInt(data.registerCode);

    if (isNaN(data.numOfParticipants) || participantAmount % 1 !== 0 || participantAmount < 1) {
      setError("numOfParticipants", { type: "numOfParticipants" });
      return;
    }

    if (isNaN(registerCode) || registerCode.toString().length !== 8) {
      setError("registerCode", { type: "registerCode" });
      return;
    }

    const eventParticipation: IEventParticipation = {
      eventId: Number(id),
      numOfParticipants: participantAmount,
      paymentType: payment,
      extraInfo: data.extraInfo,
    };

    var res = await companyService.add({
      name: data.name,
      registerCode: data.registerCode,
      eventParticipations: [eventParticipation],
    });

    if (res.status < 300 && res.data!["id"] === null) {
      setResStatus(-1);
    } else {
      setResStatus(res.status);

      if (res.status < 300) {
        resetField("name");
        resetField("registerCode");
        resetField("numOfParticipants");
        props.AddButtonClicked();
      }
    }

    setOpen(true);
  };

  return (
    <>
      <FormControl fullWidth>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" sx={{ textAlign: "center", mb: 1 }}>
            Lisa Ettevõte
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
                      helperText={Boolean(errors.name) ? "Ettevõtte nimi on vajalik" : ""}
                      required
                      fullWidth
                      label="Ettevõtte nimi"
                      name="name"
                      autoComplete="name"
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
                        minLength: 8,
                      })}
                      error={Boolean(errors.registerCode)}
                      helperText={Boolean(errors.registerCode) ? "Sisesta korrektne registrikood" : ""}
                      margin="normal"
                      required
                      fullWidth
                      label="Registrikood"
                      name="registerCode"
                      autoComplete="registerCode"
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
                  render={() => (
                    <TextField
                      {...register("numOfParticipants", {
                        required: true,
                        maxLength: 8,
                      })}
                      margin="normal"
                      error={Boolean(errors.numOfParticipants)}
                      helperText={Boolean(errors.numOfParticipants) ? "Palun sisesta korrektne osalejate arv" : ""}
                      required
                      fullWidth
                      label="Osalejate arv"
                      name="numOfParticipants"
                      autoComplete="numOfParticipants"
                      variant="filled"
                      type="text"
                      inputProps={{
                        maxLength: 8,
                      }}
                    />
                  )}
                />

                <Box sx={{ pl: 1.5, pt: 2 }}>
                  <FormLabel id="payment">Makseviis</FormLabel>

                    <RadioGroup row aria-labelledby="payment" value={payment} onChange={handlePaymentChange}>
                      <Grid container>
                        <Grid item xs={6}>
                          <FormControlLabel disabled={eventFree} value="Pangaülekanne" control={<Radio />} label="Pangaülekanne" />
                        </Grid>

                        <Grid item xs={6}>
                          <FormControlLabel sx={{ pl: 4 }} disabled={eventFree} value="Sularaha" control={<Radio />} label="Sularaha" />
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
                      label="Lisainfo"
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
                  Lisa
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </FormControl>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        {resStatus === -1 ? (
          <Alert onClose={handleClose} severity="warning" sx={{ width: "100%" }}>
            Ettevõte juba lisatud üritusele
          </Alert>
        ) : resStatus < 300 ? (
          <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
            Ettevõte lisatud
          </Alert>
        ) : (
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Lisamisel tekkis probleem
          </Alert>
        )}
      </Snackbar>
    </>
  );
}

export default AddCompany;
