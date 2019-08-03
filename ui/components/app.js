import { h, Component } from "preact";
const queryString = require("query-string");

import Header from "./header";
import Footer from "./footer";
import Form from "./form";
import Table from "./table";
import { post, createAbortController } from "../utils/api";

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

  abortController = null;

  loadData = params => {
    this.abortController = createAbortController();
    this.setState({
      isLoading: true,
      error: null
    });

    post({
      path: "/",
      data: params,
      options: { signal: this.abortController.signal }
    })
      .then(data => {
        this.setState({
          data,
          params,
          isLoading: false
        });
      })
      .catch(e => {
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
    if (!this.state.isLoading) {
      this.loadData(params);
      const stringifyUrl = queryString.stringify(params);
      window.history.pushState(null, "", "/?" + stringifyUrl);

      // stop loading and abort the request
    } else if (this.state.isLoading && this.abortController) {
      this.abortController.abort();
    }
  };

  render(_, { data, params, isLoading, error }) {
    return (
      <div id="app">
        <Header />
        <main class="main container">
          <Form
            params={params}
            onSubmit={this.handleSubmit}
            isLoading={isLoading}
          />

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
