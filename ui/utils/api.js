import { map } from "lodash";

const config = {
  //API_URL: process.env.API_URL
  API_URL: "http://localhost:3000/api"
};

const toQueryString = obj =>
  map(obj, (v, k) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join(
    "&"
  );

const apiFetch = (url, method = "get", data = {}) => {
  const options = {
    method
  };
  if (data) {
    options.headers = {
      Accept: "application/json",
      "Content-Type": "application/json"
    };
    options.body = JSON.stringify(data);
  }
  return fetch(url, options).then(response => response.json());
};

// ajax get method
export const get = path => apiFetch(config.API_URL + path, "GET", null);

// ajax post method
export const post = (path, data) =>
  apiFetch(config.API_URL + path, "POST", data);
