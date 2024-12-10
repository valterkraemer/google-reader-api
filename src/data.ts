// FEEDS

const STREAM_ID_EXAMPLE = "feed/https://example.com/rss/feed";

const FOLDERS = {
  NEWS: {
    id: "user/-/label/News",
    label: "News",
  },
};

const FEED_EXAMPLE = {
  id: STREAM_ID_EXAMPLE,
  title: "Example",
  categories: [FOLDERS.NEWS],
  sortid: "00182922",
  firstitemmsec: 1234567890000,
  url: "https://example.com/rss/feed",
  htmlUrl: "https://example.com",
  iconUrl: "https://example.com/favicon.ico",
};

const FEEDS = [FEED_EXAMPLE];

export const CATEGORY = {
  READING_LIST: "user/-/state/com.google/reading-list",
  READ: "user/-/state/com.google/read",
  STARRED: "user/-/state/com.google/starred",
};

let id = 0;

export const generateId = () => {
  return ++id;
};

const ARTICLES = [
  {
    id: generateId(),
    categories: [CATEGORY.READING_LIST],
    title: "Breaking News: Example Headline",
    content: {
      content: "This is the content of the article from Feed 1.",
    },
    published: 1702201200,
    author: "Example author",
    canonical: [
      {
        href: "https://example.com/articles/breaking-news-example-headline",
      },
    ],
    origin: {
      streamId: FEED_EXAMPLE.id,
      title: FEED_EXAMPLE.title,
      htmlUrl: FEED_EXAMPLE.htmlUrl,
    },
  },
  {
    id: generateId(),
    categories: [CATEGORY.READING_LIST],
    title: "Breaking News 2: Example Headline",
    content: {
      content: "This is the content of the article from Example.",
    },
    published: 1702201200,
    author: "Example author",
    canonical: [
      {
        href: "https://example.com/articles/breaking-news-example-headline",
      },
    ],
    origin: {
      streamId: FEED_EXAMPLE.id,
      title: FEED_EXAMPLE.title,
      htmlUrl: FEED_EXAMPLE.htmlUrl,
    },
  },
];

export const data = {
  feeds: FEEDS,
  articles: ARTICLES,
};
