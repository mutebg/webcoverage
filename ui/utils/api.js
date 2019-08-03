import { map } from "lodash";

const config = {
  API_URL: process.env.API_URL
};

const toQueryString = obj =>
  map(obj, (v, k) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join(
    "&"
  );

const apiFetch = (url, method = "get", data = {}, options = {}) => {
  const fetchOptions = {
    method,
    ...options
  };
  if (data) {
    fetchOptions.headers = {
      Accept: "application/json",
      "Content-Type": "application/json"
    };
    fetchOptions.body = JSON.stringify(data);
  }

  return fetch(url, fetchOptions).then(response => {
    const contentType = response.headers.get("content-type") || false;
    const type =
      contentType && contentType.indexOf("json") >= 0 ? "json" : "text";

    if (!response.ok) {
      return response[type]().then(err => Promise.reject(err));
    }

    return response[type]();
  });
};

// ajax get method
export const get = ({ path, options }) =>
  apiFetch(config.API_URL + path, "GET", null, options);

// ajax post method
export const post = ({ path, data, options }) =>
  apiFetch(config.API_URL + path, "POST", data, options);

export const createAbortController = () => {
  return new AbortController();
};
