import { describe, test, expect } from "vitest";
import { trimIndentFromMarkdown, trimIndent, takeWhile } from "./index";

const spaces = "    ";
describe("trim indent from markdown", () => {
  const tests = [
    ["```\n\thello\n\t\tworld\n```", "```\nhello\n\tworld\n```"],
    [
      "```spaces\n" +
        spaces +
        "function foo() {\n" +
        spaces +
        spaces +
        "return 'bar'\n" +
        spaces +
        "}\n" +
        spaces +
        "```",

      "```spaces\nfunction foo() {\n" + spaces + "return 'bar'\n}\n```",
    ],
  ];
  test.each(tests)("when given %s it should return %s", (input, expected) => {
    const result = trimIndentFromMarkdown(input);
    expect(result).toBe(expected);
  });
});

describe("trim indent", () => {
  const tests = [
    ["", ""],
    [`${spaces}hello\n${spaces}${spaces}world`, `hello\n${spaces}world`],
  ];

  test.each(tests)("when given %s it should return %s", (input, expected) => {
    const result = trimIndent(input);
    expect(result).toBe(expected);
  });
});

describe("take while", () => {
  test("when given an array and predicate it should take elements from the array until the predicate fails", () => {
    const input = [1, 1, 2, 1];
    const expected = [1, 1];
    const predicate = (n: number) => n === 1;
    expect(takeWhile<number>(input, predicate)).toEqual(expected);
  });
});
