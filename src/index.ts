import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { toLongArticleId } from "./utils.js";
import { generateId, data, CATEGORY } from "./data.js";

const app = new Hono();

const DUMMY_AUTH_TOKEN = "my-token";

app.post("/accounts/ClientLogin", async (c) => {
  return c.json({
    Auth: DUMMY_AUTH_TOKEN,
  });
});

app.get("/reader/api/0/user-info", async (c) => {
  const header = await c.req.header();

  if (header.authorization !== `GoogleLogin auth=${DUMMY_AUTH_TOKEN}`) {
    return c.text("Forbidden", 403);
  }

  return c.json({
    userId: "1",
    userName: "My user",
    userProfileId: "1",
    userEmail: "my-user@example.com",
    isBloggerUser: false,
    signupTimeSec: 0,
    isMultiLoginEnabled: true,
  });
});

app.post("/reader/api/0/subscription/quickadd", async (c) => {
  const formData = await c.req.formData();
  console.log(c.req.method, c.req.url, formData);

  const quickadd = formData.get("quickadd") as string;

  const id = `feed/${quickadd}`;

  data.feeds.push({
    id,
    title: quickadd,
    categories: [],
    sortid: "00182922",
    firstitemmsec: 1234567890000,
    url: quickadd,
    htmlUrl: quickadd,
    iconUrl: "https://example.com/favicon.ico",
  });

  data.articles.push({
    id: generateId(),
    categories: [CATEGORY.READING_LIST],
    title: "Breaking News: Example Headline",
    content: {
      content: `This is the content of the article from ${quickadd}.`,
    },
    published: 1702201200,
    author: quickadd,
    canonical: [
      {
        href: `${quickadd}/articles/breaking-news-example-headline`,
      },
    ],
    origin: {
      streamId: id,
      title: quickadd,
      htmlUrl: quickadd,
    },
  });

  return c.json({
    query: quickadd,
    numResults: 1,
    streamId: id,
  });
});

app.post("/reader/api/0/subscription/edit", async (c) => {
  const formData = await c.req.formData();
  console.log(c.req.method, c.req.url, formData);

  const action = formData.get("ac") as "edit" | "unsubscribe";
  const streamId = formData.get("s") as string | undefined;
  const feedTitle = formData.get("t") as string | undefined;
  const addToFolder = formData.get("a") as string | undefined;
  const removeFromFolder = formData.get("r") as string | undefined;

  const stream = data.feeds.find((feed) => feed.id === streamId);

  if (!stream) {
    return c.text("OK");
  }

  switch (action) {
    case "edit": {
      if (feedTitle) {
        stream.title = feedTitle;
      }

      if (addToFolder) {
        const label = addToFolder.slice("user/-/label/".length);

        stream.categories.push({
          id: addToFolder,
          label,
        });
      }

      if (removeFromFolder) {
        stream.categories = stream.categories.filter(
          (category) => category.id !== removeFromFolder
        );
      }

      break;
    }
    case "unsubscribe": {
      data.feeds = data.feeds.filter((feed) => feed.id !== streamId);
      data.articles = data.articles.filter(
        (article) => article.origin.streamId !== streamId
      );
      break;
    }
  }

  return c.text("OK");
});

app.get("/reader/api/0/subscription/list", async (c) => {
  return c.json({
    subscriptions: data.feeds,
  });
});

app.get("/reader/api/0/stream/items/ids", async (c) => {
  console.log(c.req.method, c.req.url, c.req.query());

  const noOfItemsToReturn = c.req.query("n");
  const order = c.req.query("r");
  const startTime = c.req.query("ot");
  const excludeCategory = c.req.query("xt");
  const includeCategory = c.req.query("it");
  const continuation = c.req.query("c");
  const output = c.req.query("output");
  const streamId = c.req.query("s");
  const includeAllDirectStreamIds = c.req.query("includeAllDirectStreamIds");

  let articles = data.articles;

  if (excludeCategory) {
    articles = articles.filter(
      (item) => !item.categories.includes(excludeCategory)
    );
  }

  if (includeCategory) {
    articles = articles.filter((item) =>
      item.categories.includes(includeCategory)
    );
  }

  // NOTE: Unsure about this, but that's what Reeder is querying
  if (streamId) {
    articles = articles.filter((item) => item.categories.includes(streamId));
  }

  return c.json({
    items: [],
    itemRefs: articles.map((item) => ({
      id: item.id.toString(),
      timestampUsec: "1702201200000000",
    })),
  });
});

app.post("/reader/api/0/stream/items/contents", async (c) => {
  const formData = await c.req.formData();
  console.log(c.req.method, c.req.url, formData);

  const ids = formData.getAll("i").map((id) => parseInt(id as string));

  const articles = data.articles
    .filter((item) => ids.includes(item.id))
    .map((item) => ({
      ...item,
      id: toLongArticleId(item.id),
    }));

  return c.json({
    items: articles,
  });
});

app.post("/reader/api/0/edit-tag", async (c) => {
  const formData = await c.req.formData();
  console.log(c.req.method, c.req.url, formData);

  const addTag = formData.get("a") as string | undefined;
  const removeTag = formData.get("r") as string | undefined;
  const itemId = parseInt(formData.get("i") as string);

  const found = data.articles.find((item) => item.id === itemId);

  if (!found) {
    return c.text("OK");
  }

  if (addTag) {
    found.categories.push(addTag);
  } else if (removeTag) {
    found.categories = found.categories.filter(
      (category) => category !== removeTag
    );
  }

  return c.text("OK");
});

app.all("*", (c) => {
  console.log(`*`, c.req.method, c.req.url);

  return c.text("Hello, World whatever!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
