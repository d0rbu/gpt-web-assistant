import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "./pages/Popup";
import { MemoryRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.body).render(
  <React.StrictMode>
    <Router>
      <Popup />
    </Router>
  </React.StrictMode>,
);
