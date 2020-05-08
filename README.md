[Leer versión en español](/README_ES.md)

# Medium Feed JSON

## Fetch your Medium feed in 17ms in JSON format using Cloudflare Workers

![17ms response request](/img/17-ms-response.png "17ms response request")

### What's inside this repository?

A [facade](https://en.wikipedia.org/wiki/Facade_pattern) that glues different Medium APIs to retrieve a clean and simple API interface to get a Medium user feed.

It contains all the code neccesary to be deployed using [Cloudflare Workers](https://workers.cloudflare.com/).

### [Live demo](https://medium-feed.alekrumkamp.workers.dev/)

### [Medium Post](https://medium.com/@alekrumkamp/how-to-fetch-your-medium-feed-in-17ms-using-cloudflare-workers-63a9c49c6c19)

---

###

## How to get started

### Using build script on cloudflareworkers.com

To get a glance of how easy it is to fetch your own Medium Feed, you can simply copy the [script.js](/worker/script.js) build file and head to [cloudflareworkers.com](<[cloudflareworkers.com](https://cloudflareworkers.com)>) and paste your code in the editor.

Then add a username param on your worker url as shown below;

```
example.subdomain.workers.dev?username={YOUR_MEDIUM_USERNAME}
```

edit the following {YOUR_MEDIUM_USERNAME} to your Medium username and click the `Send` button..

After a few seconds you should be able to see your Medium feed.

---

### Deploy it for free to a workers.dev subdomain

Now that we played around it's time to deploy our code to a Cloudflare Worker.

In order to do this you'll need a [Cloudflare free account](https://dash.cloudflare.com/sign-up) and get a worker namespace.

Once you have an account, you don't need to add a custom domain. Just head to [cloudflareworkers.com](https://cloudflareworkers.com) and click login.

You should now be able to see this:

![Workers](/img/workers.png "Workers")

Click it to go to the next step; selecting your unique workers.dev subdomain:

![Subdomain selection menu](/img/subdomain-selection-menu.png "Subdomain selection menu")

Now that we have our name space we can create a Worker for it!

![Create worker button](/img/create-worker-button.png "Create worker button")

Here we will encounter a similar editor to the one present in cloudflareworkers.com. The difference this time is that instead of just toying around with the code, it can run and be deployed in seconds to your Worker subdomain.

Paste the `worker/script.js` code from the repository with your username into the editor.

![Worker editor](/img/worker-editor.png "Worker editor")

To do so, just click the `Save and deploy` button:

![Save and deploy button](/img/save-and-deploy-button.png "Save and deploy button")

_Aaand we are done!_

Your code will be live after a few seconds on `https://{workerName}.{workersSubdomain}.workers.dev`

If you'd like to change the name of the worker, at the top left corner you can do so:

![Change Worker's name field](/img/change-name-field.png "Change Worker's name field")

---

### Retrieving all your posts

Each request brings up to 10 posts. However the `next` attribute can be use to retrieve the following 10 entries. Simply call your worker with the query param `next` with the value of it.

For example:

Initial Request:

`https://medium-feed.alekrumkamp.workers.dev/`

Follow up Request:

`https://medium-feed.alekrumkamp.workers.dev/?next=1483371523050`

Once all posts are fetched, the attribute `next` will not longer be present.

---

### Can I use Wrangler to build, preview and publish this project to Cloudflare Workers?

You sure can!

In fact, this entire project was done using [Wrangler](https://github.com/cloudflare/wrangler).

Once you get over the hype of using Cloudflare Workers in [the playground](https://cloudflareworkers.com) and need to use code versioning and other tools you'll find that Wrangler becomes really handy to test and deploy in this serverless environment.

You'll notice that I included a custom `webpack.config.js` file in the repository.

If you'd like to minify your bundle before deploying, you can do so by simply deleting this file.

However if you are debugging I recommend you don't do so, so you can receive meaningful `Error on line X` kind of debugging hints.

---

### Using a custom domain

After you have added your custom domain to Cloudflare, you can go to the Workers section:

![Workers menu](/img/workers-menu.png "Workers menu")

Having launched the editor, head towards `Routes` and add one.

![Routes menu](/img/routes-menu.png "Routes menu")

![Add route button](/img/route-button.png "Add route button")

Now it's simply a matter of matching a route with its corresponding worker:

![Create route modal](/img/route-modal.png "Create route modal")

---

## Troubleshooting

### I'm receiving a Error 1101 Worker threw exception

You may be trying to either fetch Medium account or an empty account. Neither of these cases are supported.

### I'm only receiving three posts per request

Using Cloudflare workers for free lets you use up to 10ms CPU time. Since this service uses some parsing it may exceed it if the user you are fetching has lots of text content.

You may solve this problem by increasing the limit to 10 posts to be fetched on each request inside the object that is being return in [graphqlRequestBody.js](/src/Model/graphqlRequestBody/graphqlRequestBody.js). However, be aware that if you don't have a Cloudflare Workers Unlimited account request may fail.

### My request is taking considerably longer than 17ms

All requests have to be fetched from Medium the first time for each Cloudflare cache region. However after initial fetching these will be blazing fast.
