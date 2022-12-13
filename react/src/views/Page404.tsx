import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Button, CircularProgress, Container } from "@mui/material";
import { NavLink } from "react-router-dom";

function Page404() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <h1>Lehte ei leitud</h1>
    </Box>
  );
}

export default Page404;
