const { handleRequest } = require("./src/fetch");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});
