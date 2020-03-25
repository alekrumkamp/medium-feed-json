class Post {
  constructor(anId, aUrl, aCreationDate) {
    this.id = this.requiredProperty(anId);
    this.url = this.requiredProperty(aUrl);
    this.createdAt = this.requiredProperty(aCreationDate);
    this.title = "";
    this.description = "";
    this.imageUrl = "";
  }

  requiredProperty(property) {
    if (!property) {
      throw "A property is missing to create a new post";
    }
    return property;
  }
}

exports.Post = Post;
