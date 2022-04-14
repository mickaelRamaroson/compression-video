import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import RouterView from "./router";
import "./styles/index.scss";

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <Router>
        <RouterView />
      </Router>
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
