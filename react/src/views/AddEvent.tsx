import { Alert, Box, Button, Checkbox, Container, FormControl, Grid, InputAdornment, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { EventService } from "../services/EventService";

interface IFormInput {
  name: string;
  description: string;
  address: string;
  deadline: string;
  price: number;
}

function AddEvent() {
  const {
    control,
    register,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      deadline: "",
      price: 0,
    },
  });

  const nameLimit = 64;
  const addressLimit = 80;
  const descriptionLimit = 1000;

  const [checked, setChecked] = useState(false);
  const [paymentDisabled, setPaymentDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const [resStatus, setResStatus] = useState(500);
  const [value, setValue] = useState<Dayjs | null>(dayjs());

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<IFormInput> = (data: IFormInput) => TryCreate(data);

  const handleDateCheckbox = () => {
    setChecked(!checked);
    setPaymentDisabled(!paymentDisabled);
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setValue(newValue);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const TryCreate = async (data: IFormInput) => {
    const eventService = new EventService();

    let dateToAdd: string;

    if (value !== null) {
      dateToAdd = value?.format();
    } else {
      dateToAdd = dayjs().format();
    }

    let priceToAdd = data.price;

    if (isNaN(data.price as any)) {
      if (paymentDisabled) {
        priceToAdd = 0;
      } else {
        setError("price", { type: "price" });

        return;
      }
    }

    var res = await eventService.add({
      name: data.name,
      description: data.description,
      date: dateToAdd,
      address: data.address,
      price: priceToAdd,
      eventParticipations: null,
    });

    setResStatus(res.status);

    setOpen(true);

    if (res.status < 300) {
      navigate("/");
    }
  };

  return (
    <>
      <Container component="main" maxWidth="md">
        <FormControl fullWidth>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Paper sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}>
                <Typography component="h1" variant="h4" sx={{ textAlign: "center", mb: 1 }}>
                  Lisa Üritus
                </Typography>
                <Grid container spacing={5}>
                  
                  <Grid item xs={12} md={6}>

                    <Controller
                      name="name"
                      control={control}
                      render={() => (
                        <TextField
                          {...register("name", {
                            required: true,
                            maxLength: 64,
                          })}
                          margin="normal"
                          error={Boolean(errors.name)}
                          helperText={Boolean(errors.name) ? "Nimi on vaalik" : ""}
                          required
                          fullWidth
                          label="Ürituse nimi"
                          name="name"
                          autoComplete="todo"
                          autoFocus
                          variant="filled"
                          inputProps={{
                            maxLength: nameLimit,
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...register("address", {
                            required: true,
                            maxLength: 128,
                          })}
                          error={Boolean(errors.address)}
                          helperText={Boolean(errors.address) ? "Aadress on vajalik" : ""}
                          margin="normal"
                          required
                          fullWidth
                          label="Aadress"
                          name="address"
                          autoComplete="todo"
                          autoFocus
                          variant="filled"
                          inputProps={{
                            maxLength: addressLimit,
                          }}
                        />
                      )}
                    />

                    <Grid container spacing={1}>
                      <Grid item xs={2} display="flex" alignItems="center" justifyContent="center">
                        <Checkbox checked={checked} onChange={handleDateCheckbox} sx={{ pt: 2 }} />
                      </Grid>
                      <Grid item xs={10}>
                        <Controller
                          name="price"
                          control={control}
                          render={() => (
                            <TextField
                              {...register("price")}
                              margin="normal"
                              error={Boolean(errors.price)}
                              helperText={Boolean(errors.price) ? "Sisesta korrektne number" : ""}
                              required
                              fullWidth
                              disabled={paymentDisabled}
                              label="Osavõtutasu"
                              name="price"
                              autoComplete="todo"
                              autoFocus
                              variant="filled"
                              type="text"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>

                    <DateTimePicker label="Kuupäev*" inputFormat="DD/MM/YYYY HH:mm" ampm={false} value={value} onChange={handleDateChange} minDate={dayjs()} renderInput={(params) => <TextField {...params} fullWidth variant="filled" sx={{ mt: 2 }} />} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field: { onChange, value } }) => (

                        <TextField
                          {...register("description", { maxLength: 1000 })}
                          onChange={onChange}
                          value={value}
                          margin="normal"
                          sx={{ pb: 0 }}
                          variant="filled"
                          fullWidth
                          multiline
                          rows={11.5}
                          helperText={`${value.length}/${descriptionLimit}`}
                          name="description"
                          label="Lisa Info"
                          type="Description"
                          autoComplete="description"
                          inputProps={{
                            maxLength: descriptionLimit,
                          }}
                        />

                      )}
                    />

                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" fullWidth variant="contained" color="success">
                      Lisa
                    </Button>
                    <Button fullWidth component={NavLink} to="/" variant="contained" sx={{ mt: 2 }}>
                      Tagasi
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>
        </FormControl>

        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          {resStatus < 300 ? (
            <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
              Üritus lisatud
            </Alert>
          ) : (
            <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
              Lisamisel tekkis probleem
            </Alert>
          )}
        </Snackbar>
      </Container>
    </>
  );
}

export default AddEvent;
