const username = 'alekrumkamp';
const latestFeedUrl = `https://medium.com/@${username}/latest?format=json`;
const graphqlAPIUrl = 'https://medium.com/_/graphql';
const imagesCDNUrl = 'https://miro.medium.com/max/700/';
const postsUrl = `https://medium.com/@${username}/`;
const allPosts = [];

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

function removeXSSProtection(stringWithXSSProtection) {
  return stringWithXSSProtection.replace('])}while(1);</x>', '');
}

function adapter(b) {
  c = JSON.parse(b);
  const a = {};
  a.nextPageId = c.payload.paging.next.to;
  a.userId = c.payload.user.userId;

  a.posts = [];
  c = c.payload.references.Post;
  Object.keys(c).forEach((postId) => {
    post = c[postId];
    const someTags = [];
    post.virtuals.tags.forEach(tag => someTags.push(tag.name));

    adaptedPost = new Post(
      post.id,
      post.title,
      post.previewContent.subtitle,
      imagesCDNUrl + post.virtuals.previewImage.imageId,
      postsUrl + post.uniqueSlug,
      post.createdAt,
      post.detectedLanguage,
      someTags,
    );
    console.log(adaptedPost);
    allPosts.push(adaptedPost);
  });

  return JSON.stringify(a);
}

function mediumGraphqlModel(userId, to) {
  console.log(to);
  console.log(userId);
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
}

function getParagraphByName(paragraphs, name) {
  return paragraphs.findIndex(paragraph => paragraph.name === name);
}

function getPostImage(paragraphs) {
  if (getParagraphByName(paragraphs, 'previewImage').length > 2) {
    return imagesCDNUrl + paragraphs[0].metadata.id;
  }
}

function getPostTitle(paragraphs) {
  if (getPostImage(paragraphs)) {
    return getParagraphByName(paragraphs, 'previewTitle') >= 0 ? getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[1].text;
  }
  return getParagraphByName(paragraphs, 'previewTitle') >= 0 ? getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[0].text;
}

function getPostSubTitle(paragraphs) {
  if (getPostImage(paragraphs)) {
    return getParagraphByName(paragraphs, 'previewSubtitle') >= 1 ? getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[2].text;
  }
  return getParagraphByName(paragraphs, 'previewSubtitle') >= 1 ? getParagraphByName(paragraphs, 'previewTitle').text : paragraphs[1].text;
}

function getRestOfArticles(userId, nextPageId) {
  return fetch(graphqlAPIUrl,
    {
      body: mediumGraphqlModel(userId, nextPageId),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.text())
    .then(res => JSON.parse(res))
    .then((response) => {
      console.log(response);

      response.data.user.latestStreamConnection.stream.forEach((item) => {
        const { paragraphs } = item.itemType.post.previewContent.bodyModel;
        const p = new Post(item.itemType.post.id,
          getPostTitle(paragraphs),
          getPostSubTitle(paragraphs),
          getPostImage(paragraphs),
          item.itemType.post.mediumUrl,
          item.itemType.post.createdAt);
        console.log(p);
        allPosts.push(p);
        console.log(allPosts);
      });
      const { next } = response.data.user.latestStreamConnection.pagingInfo;
      if (!next) {
        return JSON.stringify(response);
      }
      nextPageId = next.to;
      return getRestOfArticles(userId, nextPageId);
    });
}

exports.handleRequest = async function handleRequest(event) {
  const cache = caches.default;
  const response = await cache.match(event.request);

  if (response) {
    return response;
  }

  if (allPosts.length > 0) {
    h = new Headers();
    h.append('Content-Type', 'application/json');
    h.append('Access-Control-Allow-Origin', '*');
    const r = new Response(JSON.stringify({ data: { posts: allPosts } }), { headers: h });
    cache.put(event.request, r.clone());
    return r;
  }


  // We need to pull out the text that comes through from Medium for JSON hacking
  return fetch(latestFeedUrl)
    .then(response => response.text())
    .then(res => removeXSSProtection(res))
    .then((response) => {
      const b = response;
      const r = new Response(adapter(b));
      r.headers.append('Content-Type', 'application/json');
      r.headers.append('Access-Control-Allow-Origin', '*');
      return r;
    })
    .then(response => response.json())
    .then(initialResponse => getRestOfArticles(initialResponse.userId, initialResponse.nextPageId))
    .then(() => handleRequest(event.request));
};
