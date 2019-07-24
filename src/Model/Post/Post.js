
class Post {
  constructor(anId,
    aTitle,
    aShortDescription,
    anImageUrl,
    aUrl,
    aCreationDate,
    aLanguage,
    someTags) {
    this.id = this.requiredProperty(anId);
    this.title = this.requiredProperty(aTitle);
    this.shortDescription = this.requiredProperty(aShortDescription);
    this.imageUrl = anImageUrl;
    this.url = this.requiredProperty(aUrl);
    this.createdAt = this.requiredProperty(aCreationDate);
    this.language = aLanguage;
    this.tags = someTags;
  }

  requiredProperty(property) {
    if (!property) {
      throw 'A property is missing to create a new post';
    }
    return property;
  }
}

export default Post;
