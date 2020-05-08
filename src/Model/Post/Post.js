class Post {
  constructor(anId, aUrl, aCreationDate, aAuthorImage) {
    this.id = this.requiredProperty(anId);
    this.url = this.requiredProperty(aUrl);
    this.createdAt = this.requiredProperty(aCreationDate);
    this.title = "";
    this.description = "";
    this.imageUrl = "";
    this.author = "";
    this.authorLink = "";
    this.authorImage = this.requiredProperty(aAuthorImage);
    this.pubDate = "";
  }

  requiredProperty(property) {
    if (!property) {
      throw "A property is missing to create a new post";
    }
    return property;
  }
}

exports.Post = Post;
