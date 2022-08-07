import React from "react";
import { render } from "react-dom";
import App from "./App";
import API from "./API";
import { view } from "@transformd-ltd/sandbox-bridge";

let props = {};
try {
  props = JSON.parse(window.name);
} catch (e) {
  console.error(e);
}

try {
  const {pat, apiUrl} = props;
  API.init(`${apiUrl}/v3/`, pat);

  view
    .createHistory()
    .then((newHistory) => {
      render(
        <React.StrictMode>
          <App {...props} history={newHistory} />
        </React.StrictMode>,
        document.getElementById("root"),
      );
    });
} catch (e) {
  console.error(e);
}
