const {
  GraphqlFeedController
} = require("./Controller/GraphqlFeedController/GraphqlFeedController");
const {
  UserController
} = require("./Controller/UserController/UserController");
const {
  OpenGraphController
} = require("./Controller/OpenGraphController/OpenGraphController");

const cloudflareCache = caches.default;
const username = "alekrumkamp";

function createResponse(content) {
  const responseHeader = new Headers();
  responseHeader.append("Content-Type", "application/json");
  responseHeader.append("Access-Control-Allow-Origin", "*");
  const response = new Response(JSON.stringify(content), {
    headers: responseHeader
  });
  return response;
}

function cacheResponse(event, response) {
  return cloudflareCache
    .put(event.request, response.clone())
    .then(() => response);
}

function getSearchFromUrl(url, queryParam) {
  const possibleMatches = url.split("?")[1];
  const queryParams = new URLSearchParams(possibleMatches);
  return queryParams.get(queryParam);
}

exports.handleRequest = async function handleRequest(event) {
  const cachedResponse = await cloudflareCache.match(event.request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const finalPosts = [];
  const nextPageId = getSearchFromUrl(event.request.url, "next");

  const graphqlFeedController = new GraphqlFeedController();
  const userController = new UserController(username);
  const openGraphController = new OpenGraphController();

  return userController
    .getUserId()
    .then(userId => graphqlFeedController.getFeed(userId, nextPageId))
    .then(latestIncompletePosts =>
      openGraphController.completePosts(latestIncompletePosts, finalPosts)
    )
    .then(latestPosts => createResponse(latestPosts))
    .then(response => cacheResponse(event, response));
};
