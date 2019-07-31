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
    params: {},
    isLoading: false,
    error: null
  };

  loadData = params => {
    this.setState({
      isLoading: true,
      error: null
    });
    post("/", params)
      .then(data => {
        this.setState({
          data,
          params,
          isLoading: false
        });
      })
      .catch(e => {
        console.log({ e });
        this.setState({
          isLoading: false,
          error: e.message
        });
      });
  };

  componentDidMount() {
    const params = queryString.parse(location.search);

    // prefill input fields
    this.setState({
      params
    });

    // load data
    if (params.pages && params.viewports && params.viewports.length) {
      this.loadData(params);
    }
  }

  handleSubmit = params => {
    this.loadData(params);

    const stringifyUrl = queryString.stringify(params);
    window.history.pushState(null, "", "/?" + stringifyUrl);
  };

  render(_, { data, params, isLoading, error }) {
    return (
      <div id="app">
        <Header />
        <main class="main container">
          <Form params={params} onSubmit={this.handleSubmit} />

          {error && <p class="banner banner--error">Error: {error}</p>}
          {isLoading ? (
            <p class="banner banner--loading">Loading data</p>
          ) : (
            <Table rows={data} />
          )}
        </main>
        <Footer />
      </div>
    );
  }
}
