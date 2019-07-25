const { GraphqlFeedController } = require('./Controller/GraphqlFeedController/GraphqlFeedController');
const { UserController } = require('./Controller/UserController/UserController');

const cache = caches.default;

function createResponse(content) {
  const responseHeader = new Headers();
  responseHeader.append('Content-Type', 'application/json');
  responseHeader.append('Access-Control-Allow-Origin', '*');
  const response = new Response(JSON.stringify(content), { headers: responseHeader });
  return response;
}

function cacheResponse(event, response) {
  return cache.put(event.request, response.clone())
    .then(() => response);
}

exports.handleRequest = async function handleRequest(event) {
  const cachedResponse = await cache.match(event.request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const graphqlFeedController = new GraphqlFeedController();
  const userController = new UserController();
  return userController.getUserId()
    .then(userId => graphqlFeedController.getFeed(userId))
    .then(latestsPosts => createResponse(latestsPosts))
    .then(response => cacheResponse(event, response));
};
