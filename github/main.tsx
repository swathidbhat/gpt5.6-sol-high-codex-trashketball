import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TrashketballGame from "../app/TrashketballGame";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TrashketballGame />
  </StrictMode>
);
