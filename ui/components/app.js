import { h, Component } from "preact";
const queryString = require("query-string");

import Header from "./header";
import Footer from "./footer";
import Form from "./form";
import Table from "./table";
import { post } from "../utils/api";

if (module.hot) {
  require("preact/debug");
}

export default class App extends Component {
  state = {
    data: [],
    params: {}
  };

  componentDidMount() {
    const params = queryString.parse(location.search);
    console.log({ params });

    if (params.pages) {
      post("/", params).then(data => {
        this.setState({
          data,
          params
        });
      });
    }
  }

  render(_, { data, params }) {
    return (
      <div id="app">
        <Header />
        <main class="main container">
          <Form params={params} />
          <Table rows={data} />
        </main>
        <Footer />
      </div>
    );
  }
}
