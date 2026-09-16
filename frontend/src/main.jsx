import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import NitiMitraChat from "./NitiMitraChat";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NitiMitraChat />
  </StrictMode>,
);