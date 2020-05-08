class OpenGraphController {
  findPostPropertyFromString(startNeedle, finishNeedle, haystack) {
    let finding = haystack.split(startNeedle)[1];
    if (finding) {
      finding = finding.split(finishNeedle)[0];
    }
    return finding;
  }

  fillRemainingPostInfo(post, partialHTMLFromPost) {
    const finishedPost = post;
    finishedPost.author = this.findPostPropertyFromString(
      'name="author" content="',
      '"',
      partialHTMLFromPost
    );
    finishedPost.authorLink = this.findPostPropertyFromString(
      'property="article:author" content="',
      '"',
      partialHTMLFromPost
    );
    finishedPost.description = this.findPostPropertyFromString(
      'property="og:description" content="',
      '"',
      partialHTMLFromPost
    );
    finishedPost.title = this.findPostPropertyFromString(
      'property="og:title" content="',
      '"',
      partialHTMLFromPost
    );
    finishedPost.imageUrl = this.findPostPropertyFromString(
      'property="og:image" content="',
      '"',
      partialHTMLFromPost
    );
    finishedPost.pubDate = this.findPostPropertyFromString(
      'property="article:published_time" content="',
      '"',
      partialHTMLFromPost
    );
    return finishedPost;
  }


  getImageIdFromUrl(payload){
    const url = new URL(payload);
    const path = url.pathname.split('/');
    const imageId = path[3];
    //console.log(path[3]);
    return imageId;
  }

  completePosts(response, finalPosts) {
    const anIncompletePost = response.data.posts.pop();

    if (anIncompletePost) {
      return fetch(anIncompletePost.url)
        .then(res => res.text())
        .then(res => this.fillRemainingPostInfo(anIncompletePost, res))
        .then(res => {
          finalPosts.push(res);
          return this.completePosts(response, finalPosts);
        });
    }

    response.data.posts = finalPosts;

    return response;
  }
}

exports.OpenGraphController = OpenGraphController;
