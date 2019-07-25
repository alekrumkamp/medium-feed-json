const { graphqlRequestBody } = require('../../Model/graphqlRequestBody/graphqlRequestBody');
const { Post } = require('../../Model/Post/Post');

class GraphqlFeedController {
  constructor() {
    this.allPosts = [];
  }

  getGraphqlFeedPath() {
    return 'https://medium.com/_/graphql';
  }

  adaptPosts(response) {
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

    return { data: { posts: this.allPosts }, next: next ? next.to : undefined };
  }

  getFeed(userId, to) {
    return fetch(this.getGraphqlFeedPath(), {
      method: 'POST',
      body: graphqlRequestBody(userId, to),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(jsonResponse => this.adaptPosts(jsonResponse, userId));
  }
}


exports.GraphqlFeedController = GraphqlFeedController;
