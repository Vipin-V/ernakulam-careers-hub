import { expect, it } from "vitest";
import { toCsv } from "./contact";

it("escapes quotes and commas in CSV", () => {
  expect(toCsv([["Name", "Note"], ['Arjun, M', 'said "ok"']])).toBe('"Name","Note"\n"Arjun, M","said ""ok"""');
});
