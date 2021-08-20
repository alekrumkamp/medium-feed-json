class Post {
  constructor(id, url, creationDate, collection) {
    this.id = this.requiredProperty(id);
    this.url = this.requiredProperty(url);
    this.createdAt = this.requiredProperty(creationDate);
    this.publicationName = collection ? collection.name : "";
    this.title = "";
    this.description = "";
    this.imageUrl = "";
  }

  requiredProperty(property) {
    if (!property) throw "A property is missing to create a new post";
    return property;
  }
}

exports.Post = Post;
