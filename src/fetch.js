const { GraphqlFeedController } = require('./Controller/GraphqlFeedController/GraphqlFeedController');
const { UserController } = require('./Controller/UserController/UserController');

function createResponse(content) {
  const response = new Response(JSON.stringify(content));
  response.headers.append('Content-Type', 'application/json');
  response.headers.append('Access-Control-Allow-Origin', '*');
  return response;
}

exports.handleRequest = async function handleRequest() {
  const graphqlFeedController = new GraphqlFeedController();
  const userController = new UserController();
  return userController.getUserId()
    .then(userId => graphqlFeedController.getFeed(userId))
    .then(latestsPosts => createResponse(latestsPosts));
};
