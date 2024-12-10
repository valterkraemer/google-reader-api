export const toLongArticleId = (articleId: number) => {
  const hexArticleId = articleId.toString(16).padStart(16, "0");

  return `tag:google.com,2005:reader/item/${hexArticleId}`;
};
