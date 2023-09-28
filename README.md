# Medium Feed JSON

### What's inside this repository?

A [facade pattern](https://en.wikipedia.org/wiki/Facade_pattern) that glues together different Medium APIs to get a Medium user feed.

It contains all the code neccesary to be deployed using [Cloudflare Workers](https://workers.cloudflare.com/).

## Usage

To get a glance of how easy is to fetch your own Medium Feed, do the following: 
1. Clone this repository locally
2. Install [Wrangler](https://github.com/cloudflare/wrangler) via `pnpm install`
3. Change the `USERNAME` variable in `wrangler.toml` to your Medium username
4. Head to [rss2json](https://rss2json.com/) and sign up for an account
5. Copy your rss2json API key
6. Run `wrangler secret put API_KEY` then paste your API key when prompted
7. Run `wrangler login` and create a Cloudflare account if you don't already have one
8. Create a worker subdomain with `wrangler subdomain desired_name_here`
9. Run `wrangler dev` to test locally or `wrangler publish` to push your code to production
10. Retrieve your Medium feed!

### Retrieving all your posts

Each request brings up to 10 posts. However, the `next` attribute can be use to retrieve the following 10 entries. Simply call your worker with the query param `next` with the value of it.

For an example of how to implement this behavior, look [here](https://github.com/meese-os/meeseOS/blob/master/apps/old-site/src/components/home/Articles.jsx#L18). Simply put:

Initial request:

`https://medium-feed.ajmeese7.workers.dev`

Follow up request:

`https://medium-feed.ajmeese7.workers.dev?next=1483371523050`

Once all posts are fetched, the attribute `next` will not longer be present.
