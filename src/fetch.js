const { GraphqlFeedController } = require('./Controller/GraphqlFeedController/GraphqlFeedController');
const { UserController } = require('./Controller/UserController/UserController');
const { OpenGraphController } = require('./Controller/OpenGraphController/OpenGraphController');

const cloudflareCache = caches.default;

function createResponse(content) {
  const responseHeader = new Headers();
  responseHeader.append('Content-Type', 'application/json');
  responseHeader.append('Access-Control-Allow-Origin', '*');
  const response = new Response(JSON.stringify(content), { headers: responseHeader });
  return response;
}

function cacheResponse(event, response) {
  return cloudflareCache.put(event.request, response.clone())
    .then(() => response);
}

exports.handleRequest = async function handleRequest(event) {
  const cachedResponse = await cloudflareCache.match(event.request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const finalPosts = [];
  const graphqlFeedController = new GraphqlFeedController();
  const userController = new UserController();
  const openGraphController = new OpenGraphController();
  return userController.getUserId()
    .then(userId => graphqlFeedController.getFeed(userId))
    .then(latestsPosts => openGraphController.completePosts(latestsPosts, finalPosts))
    .then(latestsPosts => createResponse(latestsPosts))
    .then(response => cacheResponse(event, response));
};
