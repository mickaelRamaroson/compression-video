import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useLocation, useNavigate } from "react-router";
import "./styles.scss";

const urls = ["/", "/videos"];

export default function Navbars() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(urls[newValue]);
    setValue(newValue);
  };

  useEffect(() => {
    setValue(urls.findIndex((item) => item === location.pathname));
  }, [location]);

  return (
    <Box className="navbar-container" sx={{ width: "100%" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="nav tabs example"
        centered
      >
        <Tab label="Uploader une vidéo" />
        <Tab label="Voir la liste des vidéos" />
      </Tabs>
    </Box>
  );
}
