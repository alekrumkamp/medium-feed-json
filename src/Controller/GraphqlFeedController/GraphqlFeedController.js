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


  getParagraphByName(paragraphs, name) {
    return paragraphs.findIndex(paragraph => paragraph.name === name);
  }

  getPostImage(paragraphs) {
    if (this.getParagraphByName(paragraphs, 'previewImage').length > 2) {
      return imagesCDNUrl + paragraphs[0].metadata.id;
    }
  }

  getPostTitle(paragraphs) {
    if (this.getPostImage(paragraphs)) {
      return this.getParagraphByName(paragraphs, 'previewTitle') >= 0 ? this.getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[1].text;
    }
    return this.getParagraphByName(paragraphs, 'previewTitle') >= 0 ? this.getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[0].text;
  }

  getPostSubTitle(paragraphs) {
    if (this.getPostImage(paragraphs)) {
      return this.getParagraphByName(paragraphs, 'previewSubtitle') >= 1 ? this.getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[2].text;
    }
    return this.getParagraphByName(paragraphs, 'previewSubtitle') >= 1 ? this.getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[1].text;
  }

  process(response, userId) {
    response.data.user.latestStreamConnection.stream.forEach((item) => {
      if (item.itemType.post) {
        const { paragraphs } = item.itemType.post.previewContent.bodyModel;
        const p = new Post(item.itemType.post.id,
          this.getPostTitle(paragraphs),
          this.getPostSubTitle(paragraphs),
          this.getPostImage(paragraphs),
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
