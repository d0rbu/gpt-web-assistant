import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter as Router } from 'react-router-dom';
import Popup from "./pages/Popup";

ReactDOM.createRoot(document.body).render(
  <React.StrictMode>
    <Router>
      <Popup />
    </Router>
  </React.StrictMode>,
);
