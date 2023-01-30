import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StickyHeaderProvider } from "./lib";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StickyHeaderProvider>
    <App />
  </StickyHeaderProvider>
);
