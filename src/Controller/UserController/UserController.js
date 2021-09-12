class UserController {
  getUserPath() {
    return `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40${USERNAME}&api_key=${API_KEY}`;
  }

  extractIdFromString(string) {
    return string.split("-")[1];
  }

  getUserId() {
    return fetch(this.getUserPath())
      .then(response => response.json())
      .then(jsonResponse => {
        if (jsonResponse.status === 'error') return console.error(jsonResponse)
        return this.extractIdFromString(jsonResponse.feed.link)
      }).catch((error) => console.error(error));
  }
}

exports.UserController = UserController;
