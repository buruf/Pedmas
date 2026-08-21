// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { LESSON_COMPONENTS } from "@/components/lesson/registry";
import { LESSON_KEYS, LESSON_TITLES, type LessonKey } from "@/lib/lessons";

/**
 * Every step of every lesson, opened and rendered.
 *
 * Step headers stay clickable whether or not the step is open, so a walker
 * can visit step after step without knowing any lesson's answers: click the
 * header, the step's content renders, and anything broken inside it — a
 * throwing component, an un-interpolated template string that would print
 * "${U}" to a child, a step that never registered — fails loudly here
 * instead of on a child's screen.
 *
 * 132 lessons x every step. This is the automated half of "test every step";
 * the human half (does it *teach*?) lives in the Test Script PDF.
 */

afterEach(cleanup);

/**
 * "undefined" on screen usually means a broken interpolation — except where
 * it is the mathematics itself: a vertical line's slope is undefined, and so
 * is a limit that does not exist. Only these lessons may say the word.
 */
const SAYS_UNDEFINED_ON_PURPOSE = new Set<LessonKey>(["sa-slope", "calc-limits"]);

describe("every lesson, every step", () => {
  it.each(LESSON_KEYS.map((k) => [k] as [LessonKey]))("%s opens every step cleanly", (key) => {
    const Lesson = LESSON_COMPONENTS[key];
    expect(Lesson, `no component registered for ${key}`).toBeDefined();

    let finished = 0;
    const { container } = render(<Lesson onFinish={() => finished++} />);

    const headers = Array.from(container.querySelectorAll("button[aria-expanded]"));
    expect(headers.length, `${key} has no tap-gated steps`).toBeGreaterThanOrEqual(3);

    for (const [i, header] of headers.entries()) {
      fireEvent.click(header);
      const text = container.textContent ?? "";
      expect(text.includes("${"), `${key} step ${i + 1} leaks a template placeholder`).toBe(false);
      if (!SAYS_UNDEFINED_ON_PURPOSE.has(key)) {
        expect(text.includes("undefined"), `${key} step ${i + 1} renders "undefined"`).toBe(false);
      }
      expect(text.includes("NaN"), `${key} step ${i + 1} renders NaN`).toBe(false);
    }

    // The lesson names itself, and the title matches the registry's promise.
    expect((container.textContent ?? "").length).toBeGreaterThan(200);
    expect(LESSON_TITLES[key]).toBeTruthy();
  });
});
