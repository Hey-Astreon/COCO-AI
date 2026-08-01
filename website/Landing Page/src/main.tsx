import React from "react";
import ReactDOM, { type Root } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// Persist the React root on the element so HMR re-mounts into the same root
// instead of creating a second one (avoids the "already mounted" warning).
type RootElement = HTMLElement & { _reactRoot?: Root };

const rootElement = document.getElementById("root") as RootElement | null;
if (rootElement) {
  const root = rootElement._reactRoot || ReactDOM.createRoot(rootElement);
  rootElement._reactRoot = root;
  root.render(
    <React.StrictMode>
      <RouterProvider router={getRouter()} />
    </React.StrictMode>,
  );
}
