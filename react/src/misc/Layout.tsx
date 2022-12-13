import { Container } from "@mui/system";
import { Outlet } from 'react-router';
import Header from "./Header";

function Layout() {
    return (
        <>
       <Header />
        <Container maxWidth="xl" sx={{ mt:4, mb: 4}}>
          <Outlet />
        </Container>
        </>
    );
}

export default Layout;
