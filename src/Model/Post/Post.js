
class Post {
  constructor(anId,
    aTitle,
    aShortDescription,
    anImageUrl,
    aUrl,
    aCreationDate) {
    this.id = this.requiredProperty(anId);
    this.title = aTitle;
    this.shortDescription = aShortDescription;
    this.imageUrl = anImageUrl;
    this.url = this.requiredProperty(aUrl);
    this.createdAt = this.requiredProperty(aCreationDate);
  }

  requiredProperty(property) {
    if (!property) {
      throw 'A property is missing to create a new post';
    }
    return property;
  }
}

exports.Post = Post;
