const { graphqlRequestBody } = require('../../Model/graphqlRequestBody/graphqlRequestBody');

class GraphqlFeedController {
  getGraphqlFeedPath() {
    return 'https://medium.com/_/graphql';
  }

  getFeed(userId, to) {
    return fetch(this.getGraphqlFeedPath(), {
      method: 'POST',
      body: graphqlRequestBody(userId, to),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.text());
  }
}

exports.GraphqlFeedController = GraphqlFeedController;
