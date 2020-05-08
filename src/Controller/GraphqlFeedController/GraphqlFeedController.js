const {
  graphqlRequestBody
} = require("../../Model/graphqlRequestBody/graphqlRequestBody");
const { Post } = require("../../Model/Post/Post");

class GraphqlFeedController {
  constructor() {
    this.allPosts = [];
  }

  getGraphqlFeedPath() {
    return "https://medium.com/_/graphql";
  }

  getImageIdFromUrl(payload){
    const url = new URL(payload);
    const path = url.pathname.split('/');
    const imageId = path[3];
    //console.log(path[3]);
    return imageId;
  }

  adaptPosts(response,userImage) {
    response.data.user.latestStreamConnection.stream.forEach(item => {
      if (item.itemType.post) {
        const p = new Post(
          item.itemType.post.id,
          item.itemType.post.mediumUrl,
          item.itemType.post.createdAt,
          userImage
        );
        this.allPosts.push(p);
      }
    });

    const nextPagingInfo = response.data.user.latestStreamConnection.pagingInfo;
    const nextId =
      nextPagingInfo && nextPagingInfo.next
        ? nextPagingInfo.next.to
        : undefined;

    return {
      data: { posts: this.allPosts },
      next: nextId
    };
  }

  extractIdFromString(string) {
    return string.split("-")[1];
  }

  getFeed(user, to, limit) {

    const userId = this.extractIdFromString(user.link);
    const userImage = user.image;
    return fetch(this.getGraphqlFeedPath(), {
      method: "POST",
      body: graphqlRequestBody(userId, to, limit),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(jsonResponse => this.adaptPosts(jsonResponse, userImage));
  }
}

exports.GraphqlFeedController = GraphqlFeedController;
