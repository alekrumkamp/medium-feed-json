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
    finishedPost.description = this.findPostPropertyFromString('property="og:description" content="', '"', partialHTMLFromPost);
    finishedPost.title = this.findPostPropertyFromString('property="og:title" content="', '"', partialHTMLFromPost);
    finishedPost.imageUrl = this.findPostPropertyFromString('property="og:image" content="', '"', partialHTMLFromPost);
    return finishedPost;
  }

  completePosts(response, finalPosts) {
    const anIncompletePost = response.data.posts.pop();

    if (anIncompletePost) {
      return fetch(anIncompletePost.url)
        .then(res => res.text())
        .then(res => this.fillRemainingPostInfo(anIncompletePost, res))
        .then((res) => {
          finalPosts.push(res);
          return this.completePosts(response, finalPosts);
        });
    }

    response.data.posts = finalPosts;

    return response;
  }
}

exports.OpenGraphController = OpenGraphController;
