import { createClient, gql } from "/web_modules/simple-gql.js";
export const client = createClient('http://localhost:8080/v1/graphql', {
  headers: {}
});
export const query = (queryString, vars) => {
  let _cb;

  let lastResult;
  return {
    subscribe(cb) {
      _cb = cb;
    },

    fetchMore({
      variables
    }) {
      const prom = client.request(queryString, variables);

      if (_cb) {
        _cb(prom);
      }

      return prom;
    }

  };
};