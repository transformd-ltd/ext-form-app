import React from "react";
import { render } from "react-dom";
import App from "./App";

let props = {};
try {
  props = JSON.parse(window.name);
} catch (e) {
  console.error(e);
}

render(
  <React.StrictMode>
    <App {...props} />
  </React.StrictMode>,
  document.getElementById("root"),
);
