import { Divider, Toolbar, Typography } from "@mui/material";
import EventNoteIcon from '@mui/icons-material/EventNote';
import { NavLink } from "react-router-dom";

function Header() {

  return (
    <>
      <Toolbar sx={{ flexWrap: "wrap", mx: 2, pt: 1}}>
        <EventNoteIcon />
        <Typography variant="h6" color="inherit" component={NavLink} to="/" noWrap sx={{ pl: 1,flexGrow: 1, textDecoration: 'none' }}>
          Ürituse App
        </Typography>
      </Toolbar>
      <Divider />
    </>
  );
}

export default Header;
