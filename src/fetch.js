const { GraphqlFeedController } = require('./Controller/GraphqlFeedController/GraphqlFeedController');
const { UserController } = require('./Controller/UserController/UserController');

function createResponse(content) {
  const responseHeader = new Headers();
  responseHeader.append('Content-Type', 'application/json');
  responseHeader.append('Access-Control-Allow-Origin', '*');
  const response = new Response(JSON.stringify(content), { headers: responseHeader });
  return response;
}

exports.handleRequest = async function handleRequest() {
  const graphqlFeedController = new GraphqlFeedController();
  const userController = new UserController();
  return userController.getUserId()
    .then(userId => graphqlFeedController.getFeed(userId))
    .then(latestsPosts => createResponse(latestsPosts));
};
