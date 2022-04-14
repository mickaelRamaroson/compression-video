import { useRoutes } from "react-router-dom";
import React from "react";

const Homepage = React.lazy(() => import("../view/Homepage"));
const VideosList = React.lazy(() => import("../view/VideosList"));

const RouterView = () => {
  let routes = useRoutes([
    { path: "/", element: <Homepage /> },
    { path: "/videos", element: <VideosList /> },
  ]);
  return routes;
};

export default RouterView;
