import Home from "./views/Home";
import { Route, Routes } from "react-router";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./App.css";
import Layout from "./misc/Layout";
import AddParticipant from "./views/AddParticipant";
import ViewParticpants from "./views/ViewParicipants";
import Page404 from "./views/Page404";
import AddEvent from "./views/AddEvent";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* {!loading &&  */}

      <Routes>
       
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/Create" element={<AddEvent />} />
            <Route path="/Event/:id/Add" element={<AddParticipant />} />
            <Route path="/Event/:id/Participants" element={<ViewParticpants />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="*" element={<Page404 />} />
          </Route>

      </Routes>

      {/* } */}
    </ThemeProvider>
  );
}

export default App;
