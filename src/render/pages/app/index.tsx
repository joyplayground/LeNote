import "./index.css";
import * as React from "react";
import { render } from "react-dom";
import AppLayout from "../../comonents/Layout";

class App extends React.PureComponent {
  render() {
    return (
      <AppLayout>
        <div>hello world!</div>
      </AppLayout>
    );
  }
}

const root = document.querySelector("#app");
render(<App />, root);
