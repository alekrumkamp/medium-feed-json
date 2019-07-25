class UserController {
  constructor(aUsername) {
    this.username = aUsername;
  }

  getUserPath() {
    return `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40${this.username}`;
  }

  extractIdFromString(string) {
    return string.split('-')[1];
  }

  getUserId() {
    return fetch(this.getUserPath())
      .then(response => response.json())
      .then(jsonResponse => this.extractIdFromString(jsonResponse.feed.link));
  }
}

exports.UserController = UserController;
