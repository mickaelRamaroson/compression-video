import { FC, ReactNode } from "react";
import Navbar from "../navbar/Navbar";
import Helmet from "react-helmet";
import { Container } from "@mui/material";

export interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: FC<LayoutProps> = ({ children, title }) => {
  return (
    <>
      <Helmet title={title} />
      <header>
        <Navbar />
      </header>
      <main>
        <Container maxWidth="lg">{children}</Container>
      </main>
    </>
  );
};

export default Layout;
