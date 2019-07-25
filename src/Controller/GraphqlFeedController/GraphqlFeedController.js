const { graphqlRequestBody } = require('../../Model/graphqlRequestBody/graphqlRequestBody');
const { Post } = require('../../Model/Post/Post');

const imagesCDNUrl = '';

class GraphqlFeedController {
  constructor() {
    this.allPosts = [];
  }

  getGraphqlFeedPath() {
    return 'https://medium.com/_/graphql';
  }

  process(response, userId) {
    response.data.user.latestStreamConnection.stream.forEach((item) => {
      if (item.itemType.post) {
        const { paragraphs } = item.itemType.post.previewContent.bodyModel;
        const p = new Post(item.itemType.post.id,
          item.itemType.post.mediumUrl,
          item.itemType.post.createdAt);
        this.allPosts.push(p);
      }
    });
    const { next } = response.data.user.latestStreamConnection.pagingInfo;
    if (!next) {
      return JSON.stringify(response);
    }
    const nextPageId = next.to;
    return this.getFeed(userId, nextPageId);
  }

  getFeed(userId, to) {
    return fetch(this.getGraphqlFeedPath(), {
      method: 'POST',
      body: graphqlRequestBody(userId, to),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(jsonResponse => this.process(jsonResponse, userId))
      .then(() => this.allPosts);
  }
}


exports.GraphqlFeedController = GraphqlFeedController;
