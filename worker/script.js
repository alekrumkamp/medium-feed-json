
        const window = this;
    /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const { handleRequest } = __webpack_require__(1);

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const { GraphqlFeedController } = __webpack_require__(2);
const { UserController } = __webpack_require__(5);
const { OpenGraphController } = __webpack_require__(6);

const cloudflareCache = caches.default;
const username = 'alekrumkamp';

function createResponse(content) {
  const responseHeader = new Headers();
  responseHeader.append('Content-Type', 'application/json');
  responseHeader.append('Access-Control-Allow-Origin', '*');
  const response = new Response(JSON.stringify(content), { headers: responseHeader });
  return response;
}

function cacheResponse(event, response) {
  return cloudflareCache.put(event.request, response.clone())
    .then(() => response);
}

function getSearchFromUrl(url, queryParam) {
  const possibleMatches = url.split('?')[1];
  const queryParams = new URLSearchParams(possibleMatches);
  return queryParams.get(queryParam);
}

exports.handleRequest = async function handleRequest(event) {
  const cachedResponse = await cloudflareCache.match(event.request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const finalPosts = [];
  const nextPageId = getSearchFromUrl(event.request.url, 'next');

  const graphqlFeedController = new GraphqlFeedController();
  const userController = new UserController(username);
  const openGraphController = new OpenGraphController();

  return userController.getUserId()
    .then(userId => graphqlFeedController.getFeed(userId, nextPageId))
    .then(latestIncompletePosts => openGraphController.completePosts(latestIncompletePosts, finalPosts))
    .then(latestPosts => createResponse(latestPosts))
    .then(response => cacheResponse(event, response));
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const { graphqlRequestBody } = __webpack_require__(3);
const { Post } = __webpack_require__(4);

class GraphqlFeedController {
  constructor() {
    this.allPosts = [];
  }

  getGraphqlFeedPath() {
    return 'https://medium.com/_/graphql';
  }

  adaptPosts(response) {
    response.data.user.latestStreamConnection.stream.forEach((item) => {
      if (item.itemType.post) {
        const { paragraphs } = item.itemType.post.previewContent.bodyModel;
        const p = new Post(item.itemType.post.id,
          item.itemType.post.mediumUrl,
          item.itemType.post.createdAt);
        this.allPosts.push(p);
      }
    });
    const { next } = response.data.user.latestStreamConnection.pagingInfo;

    return { data: { posts: this.allPosts }, next: next ? next.to : undefined };
  }

  getFeed(userId, to) {
    return fetch(this.getGraphqlFeedPath(), {
      method: 'POST',
      body: graphqlRequestBody(userId, to),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(jsonResponse => this.adaptPosts(jsonResponse, userId));
  }
}


exports.GraphqlFeedController = GraphqlFeedController;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

exports.graphqlRequestBody = function graphqlRequestBody(userId, to) {
  if (!userId) {
    throw { error: 'userId is a required field of followUpRequest' };
  }
  return JSON.stringify({
    operationName: 'UserStreamLatest',
    variables: {
      userId,
      pagingOptions: {
        limit: 10,
        page: 1,
        source: 'latest',
        to,
        ignoredIds: [],
      },
    },
    query: 'query UserStreamLatest($userId: ID!, $pagingOptions: PagingOptions) {\n  user(id: $userId) {\n    id\n    latestStreamConnection(paging: $pagingOptions) {\n      ...commonStreamConnection\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment commonStreamConnection on StreamConnection {\n  stream {\n    ...StreamItemList_streamItem\n    __typename\n  }\n  pagingInfo {\n    next {\n      limit\n      page\n      source\n      to\n      ignoredIds\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemList_streamItem on StreamItem {\n  ...StreamItem_streamItem\n  __typename\n}\n\nfragment StreamItem_streamItem on StreamItem {\n  itemType {\n    __typename\n    ... on StreamItemHeading {\n      ...StreamItemHeading_streamItemHeading\n      __typename\n    }\n    ... on StreamItemPostPreview {\n      ...StreamItemPostPreview_streamItemPostPreview\n      __typename\n    }\n    ... on StreamItemSeriesHeroCarousel {\n      ...StreamItemSeriesHeroCarousel_streamItemSeriesHeroCarousel\n      __typename\n    }\n    ... on StreamItemSeriesGridCard {\n      ...StreamItemSeriesGridCard_streamItemSeriesGridCard\n      __typename\n    }\n    ... on StreamItemQuotePreview {\n      ...StreamItemQuotePreview_streamItemQuotePreview\n      __typename\n    }\n    ... on StreamItemQuoteList {\n      ...StreamItemQuoteList_streamItemQuoteList\n      __typename\n    }\n    ... on StreamItemCompressedPostList {\n      ...StreamItemCompressedPostList_streamItemCompressedPostList\n      __typename\n    }\n    ... on StreamItemSequence {\n      ...StreamItemSequence_streamItemSequence\n      __typename\n    }\n  }\n  __typename\n}\n\nfragment StreamItemHeading_streamItemHeading on StreamItemHeading {\n  text\n  heading {\n    ...Heading_heading\n    __typename\n  }\n  __typename\n}\n\nfragment Heading_heading on Heading {\n  headingType {\n    __typename\n    ... on HeadingBasic {\n      title\n      __typename\n    }\n    ... on HeadingWithLink {\n      title\n      linkText\n      linkUrl\n      __typename\n    }\n  }\n  __typename\n}\n\nfragment StreamItemPostPreview_streamItemPostPreview on StreamItemPostPreview {\n  post {\n    id\n    createdAt\n    mediumUrl\n    previewContent {\n      bodyModel {\n        ...PostBody_bodyModel\n        __typename\n      }\n      __typename\n    }\n    inResponseToPostResult {\n      ...InResponseToPostPreview_postResult\n      __typename\n    }\n    isLocked\n    clapCount\n    responsesCount\n    ...PostActions_post\n    ...PostByline_post\n    ...PostPresentationTracker_post\n    ...BookmarkButton_post\n    ...MultiVote_post\n    __typename\n  }\n  postSuggestionReasons {\n    ...getFirstPostFeedReason_postSuggestionReason\n    __typename\n  }\n  __typename\n}\n\nfragment InResponseToPostPreview_postResult on PostResult {\n  __typename\n  ... on Post {\n    id\n    title\n    mediumUrl\n    creator {\n      id\n      name\n      __typename\n    }\n    clapCount\n    responsesCount\n    __typename\n  }\n}\n\nfragment PostActions_post on Post {\n  id\n  creator {\n    id\n    __typename\n  }\n  __typename\n}\n\nfragment PostBody_bodyModel on RichText {\n  sections {\n    name\n    startIndex\n    textLayout\n    imageLayout\n    backgroundImage {\n      id\n      originalHeight\n      originalWidth\n      __typename\n    }\n    videoLayout\n    backgroundVideo {\n      videoId\n      originalHeight\n      originalWidth\n      previewImageId\n      __typename\n    }\n    __typename\n  }\n  paragraphs {\n    ...normalizedBodyModel_paragraph\n    ...PostBodySection_paragraphs\n    __typename\n  }\n  __typename\n}\n\nfragment normalizedBodyModel_paragraph on Paragraph {\n  ...getParagraphHighlights_paragraph\n  ...getParagraphPrivateNotes_paragraph\n  __typename\n}\n\nfragment getParagraphHighlights_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment getParagraphPrivateNotes_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment PostBodySection_paragraphs on Paragraph {\n  name\n  ...PostBodyParagraph_paragraph\n  __typename\n}\n\nfragment PostBodyParagraph_paragraph on Paragraph {\n  name\n  type\n  ...ImageParagraph_paragraph\n  ...TextParagraph_paragraph\n  ...IframeParagraph_paragraph\n  ...MixtapeParagraph_paragraph\n  __typename\n}\n\nfragment IframeParagraph_paragraph on Paragraph {\n  iframe {\n    mediaResource {\n      id\n      iframeSrc\n      iframeHeight\n      iframeWidth\n      title\n      __typename\n    }\n    __typename\n  }\n  layout\n  ...Markups_paragraph\n  __typename\n}\n\nfragment Markups_paragraph on Paragraph {\n  name\n  text\n  hasDropCap\n  dropCapImage {\n    ...MarkupNode_data_dropCapImage\n    __typename\n  }\n  markups {\n    type\n    start\n    end\n    href\n    anchorType\n    userId\n    linkMetadata {\n      httpStatus\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment MarkupNode_data_dropCapImage on ImageMetadata {\n  ...DropCap_image\n  __typename\n}\n\nfragment DropCap_image on ImageMetadata {\n  id\n  originalHeight\n  originalWidth\n  __typename\n}\n\nfragment ImageParagraph_paragraph on Paragraph {\n  href\n  layout\n  metadata {\n    id\n    originalHeight\n    originalWidth\n    focusPercentX\n    focusPercentY\n    alt\n    __typename\n  }\n  ...InteractiveMarkups_paragraph\n  ...Markups_paragraph\n  ...PostAnnotationsMarker_paragraph\n  __typename\n}\n\nfragment InteractiveMarkups_paragraph on Paragraph {\n  ...Markups_paragraph\n  __typename\n}\n\nfragment PostAnnotationsMarker_paragraph on Paragraph {\n  ...PostViewNoteCard_paragraph\n  __typename\n}\n\nfragment PostViewNoteCard_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment TextParagraph_paragraph on Paragraph {\n  type\n  hasDropCap\n  ...InteractiveMarkups_paragraph\n  ...Markups_paragraph\n  ...ParagraphRefsMapContext_paragraph\n  __typename\n}\n\nfragment ParagraphRefsMapContext_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment MixtapeParagraph_paragraph on Paragraph {\n  text\n  type\n  mixtapeMetadata {\n    href\n    thumbnailImageId\n    mediaResourceId\n    __typename\n  }\n  markups {\n    start\n    end\n    type\n    href\n    __typename\n  }\n  __typename\n}\n\nfragment PostByline_post on Post {\n  id\n  isPublished\n  mediumUrl\n  firstPublishedAt\n  readingTime\n  statusForCollection\n  isLocked\n  visibility\n  collection {\n    name\n    id\n    slug\n    ...collectionUrl_collection\n    __typename\n  }\n  creator {\n    name\n    username\n    id\n    bio\n    isFollowing\n    ...UserAvatar_user\n    __typename\n  }\n  __typename\n}\n\nfragment UserAvatar_user on User {\n  username\n  id\n  name\n  imageId\n  mediumMemberAt\n  __typename\n}\n\nfragment collectionUrl_collection on Collection {\n  id\n  domain\n  slug\n  __typename\n}\n\nfragment PostPresentationTracker_post on Post {\n  id\n  visibility\n  previewContent {\n    isFullContent\n    __typename\n  }\n  collection {\n    id\n    __typename\n  }\n  __typename\n}\n\nfragment BookmarkButton_post on Post {\n  ...SusiClickable_post\n  ...WithSetReadingList_post\n  __typename\n}\n\nfragment SusiClickable_post on Post {\n  ...SusiContainer_post\n  __typename\n}\n\nfragment SusiContainer_post on Post {\n  id\n  __typename\n}\n\nfragment WithSetReadingList_post on Post {\n  ...ReadingList_post\n  __typename\n}\n\nfragment ReadingList_post on Post {\n  id\n  readingList\n  __typename\n}\n\nfragment MultiVote_post on Post {\n  id\n  clapCount\n  creator {\n    id\n    ...SusiClickable_user\n    __typename\n  }\n  viewerClapCount\n  isPublished\n  ...SusiClickable_post\n  collection {\n    id\n    slug\n    __typename\n  }\n  ...MultiVoteCount_post\n  __typename\n}\n\nfragment SusiClickable_user on User {\n  ...SusiContainer_user\n  __typename\n}\n\nfragment SusiContainer_user on User {\n  ...SignInContainer_user\n  ...SignUpOptions_user\n  __typename\n}\n\nfragment SignInContainer_user on User {\n  ...SignInOptions_user\n  __typename\n}\n\nfragment SignInOptions_user on User {\n  id\n  name\n  __typename\n}\n\nfragment SignUpOptions_user on User {\n  id\n  name\n  __typename\n}\n\nfragment MultiVoteCount_post on Post {\n  id\n  ...PostVotersNetwork_post\n  __typename\n}\n\nfragment PostVotersNetwork_post on Post {\n  voterCount\n  viewerClapCount\n  recommenders {\n    name\n    __typename\n  }\n  __typename\n}\n\nfragment getFirstPostFeedReason_postSuggestionReason on PostSuggestionReason {\n  reason\n  __typename\n}\n\nfragment StreamItemSeriesHeroCarousel_streamItemSeriesHeroCarousel on StreamItemSeriesHeroCarousel {\n  cards {\n    ...SeriesCarouselHeroCard_seriesCarouselHeroCard\n    __typename\n  }\n  __typename\n}\n\nfragment SeriesCarouselHeroCard_seriesCarouselHeroCard on SeriesCarouselHeroCard {\n  post {\n    ...SeriesTitleCard_post\n    __typename\n  }\n  __typename\n}\n\nfragment SeriesTitleCard_post on Post {\n  id\n  title\n  previewContent {\n    bodyModel {\n      paragraphs {\n        metadata {\n          id\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemSeriesGridCard_streamItemSeriesGridCard on StreamItemSeriesGridCard {\n  post {\n    ...SeriesTitleCard_post\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemQuotePreview_streamItemQuotePreview on StreamItemQuotePreview {\n  quote {\n    ...Quote_quote\n    __typename\n  }\n  __typename\n}\n\nfragment Quote_quote on Quote {\n  quoteId\n  userId\n  post {\n    id\n    title\n    mediumUrl\n    creator {\n      id\n      username\n      name\n      __typename\n    }\n    __typename\n  }\n  startOffset\n  endOffset\n  paragraphs {\n    text\n    type\n    markups {\n      anchorType\n      end\n      href\n      rel\n      start\n      title\n      type\n      userId\n      __typename\n    }\n    ...TextParagraph_paragraph\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemQuoteList_streamItemQuoteList on StreamItemQuoteList {\n  heading {\n    ...Heading_heading\n    __typename\n  }\n  items {\n    quote {\n      ...Quote_quote\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemCompressedPostList_streamItemCompressedPostList on StreamItemCompressedPostList {\n  heading {\n    ...Heading_heading\n    __typename\n  }\n  items {\n    post {\n      id\n      title\n      mediumUrl\n      creator {\n        id\n        username\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemSequence_streamItemSequence on StreamItemSequence {\n  sequence {\n    slug\n    eyebrow\n    title\n    subtitle\n    description\n    updatedAt\n    featuredUserTitle\n    featuredUserCustomBio\n    color\n    bgColor\n    hideIndex\n    postIds\n    ...SequenceCoverImage_sequence\n    __typename\n  }\n  __typename\n}\n\nfragment SequenceCoverImage_sequence on Sequence {\n  title\n  coverImage {\n    id\n    __typename\n  }\n  __typename\n}\n',
  });
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {


class Post {
  constructor(anId,
    aUrl,
    aCreationDate) {
    this.id = this.requiredProperty(anId);
    this.url = this.requiredProperty(aUrl);
    this.createdAt = this.requiredProperty(aCreationDate);
    this.title = '';
    this.description = '';
    this.imageUrl = '';
  }

  requiredProperty(property) {
    if (!property) {
      throw 'A property is missing to create a new post';
    }
    return property;
  }
}

exports.Post = Post;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

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


/***/ })
/******/ ]);