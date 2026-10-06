import { Book } from "../../../entities/books/schemas/book.schema";
import { api } from "./api";

export const createFakeApi = (seed: Record<string, Book[]>) => {
  const database = structuredClone(seed);
  const parseUrl = (url: string) => {
    const match = url.match(/^\/books\/([^/]+)(\/private|\/reset)?$/);
    if (!match) throw new Error(`Unexpected books API URL: ${url}`);

    return {
      user: decodeURIComponent(match[1]),
      suffix: match[2] ?? "",
    };
  };

  api.get.mockImplementation(async (url: string) => {
    const { user, suffix } = parseUrl(url);
    const books = database[user] ?? [];
    return {
      data:
        suffix === "/private"
          ? books.filter((book) => book.ownerId === user)
          : books,
    };
  });

  api.post.mockImplementation(async (url: string, data?: unknown) => {
    const { user, suffix } = parseUrl(url);
    if (suffix) throw new Error(`Unexpected POST suffix: ${suffix}`);
    (database[user] ??= []).push(data as Book);
    return { data: { status: "ok" } };
  });

  api.put.mockImplementation(async (url: string) => {
    const { user, suffix } = parseUrl(url);
    if (suffix !== "/reset") throw new Error(`Unexpected PUT URL: ${url}`);
    database[user] = [];
    return { data: { status: "ok" } };
  });

  return database;
};
