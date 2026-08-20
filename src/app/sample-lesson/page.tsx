import type { Metadata } from "next";
import { regionForRequest } from "@/lib/regionServer";
import { registrationOpen } from "@/lib/flags";
import { SampleLesson } from "./SampleLesson";

/**
 * One complete lesson, public, no account needed.
 *
 * A parent deciding whether PEDMAS can teach should not have to sign up to
 * find out — the teaching is the product, so one full example of it is the
 * honest sales pitch. Deliberately ONE lesson, hard-coded: the point is proof
 * of quality, not a free copy of the library.
 *
 * The choice is the column-addition lesson ("Adding when the ones spill
 * over"): every parent remembers carrying the one, a Grade 2–3 topic needs no
 * setup to judge, and its confront-the-misconception step (27 + 15 = 312) is
 * the clearest showcase of how every lesson here is built.
 */

export const metadata: Metadata = {
  title: "A real PEDMAS lesson — adding when the ones spill over",
  description:
    "Read the exact lesson a child sees before practising column addition with regrouping. One of 132 lessons covering Grades 1–12.",
};

export default async function SampleLessonPage() {
  const region = await regionForRequest();
  return <SampleLesson region={region} signupsOpen={registrationOpen()} />;
}
