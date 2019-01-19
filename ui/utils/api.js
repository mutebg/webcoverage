import { map } from "lodash";

const config = {
  API_URL: process.env.API_URL
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

  return fetch(url, options).then(response => {
    const contentType = response.headers.get("content-type") || false;
    const type =
      contentType && contentType.indexOf("json") >= 0 ? "json" : "text";

    if (!response.ok) {
      return response[type]().then(err => Promise.reject(err));
    }

    return response[type]();
  });

  // return fetch(url, options).then(response => {
  //   if ( response.ok ) {
  //     return response.json()
  //   } else {
  //     return Promise.reject(response.json())
  //   }

  // }
};

// ajax get method
export const get = path => apiFetch(config.API_URL + path, "GET", null);

// ajax post method
export const post = (path, data) =>
  apiFetch(config.API_URL + path, "POST", data);
