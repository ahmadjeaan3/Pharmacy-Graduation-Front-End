import React from "react";
import ReactDOM from "react-dom/client";

import App from "../src/app/App";
import "../src/shared/i18n/i18n";
import "../src/shared/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
