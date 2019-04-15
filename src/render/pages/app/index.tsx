import * as React from "react";
import { render } from "react-dom";

import "./index.css";

class App extends React.PureComponent {
  render() {
    return <div>hello world!</div>;
  }
}

const root = document.querySelector("#app");
render(<App />, root);
