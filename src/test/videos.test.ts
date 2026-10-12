import { describe, expect, it } from "vitest";
import { EDUCATIONAL_VIDEOS, getVideoSelection } from "@/lib/videos";

describe("Educational video selection", () => {
  it("defaults to the first lesson without a previous lesson", () => {
    const selection = getVideoSelection();
    expect(selection.video?.id).toBe("mit-python-1");
    expect(selection.previous).toBeUndefined();
    expect(selection.next?.id).toBe("mit-python-2");
  });
  it("navigates the consecutive lessons and omits next at the end", () => {
    const middle = getVideoSelection("mit-python-2");
    expect(middle.previous?.id).toBe("mit-python-1");
    expect(middle.next?.id).toBe("mit-python-3");
    expect(getVideoSelection("mit-python-3").next).toBeUndefined();
    expect(middle.related.map((video) => video.id)).toEqual(["mit-python-1", "mit-python-3"]);
  });
  it("does not silently substitute a lesson for an unknown id", () => {
    expect(getVideoSelection("missing")).toEqual({ video: undefined, previous: undefined, next: undefined, related: [] });
  });
  it("uses official provider pages and privacy-enhanced YouTube embeds", () => {
    for (const video of EDUCATIONAL_VIDEOS) {
      expect(new URL(video.providerUrl).hostname).toBe("ocw.mit.edu");
      expect(new URL(video.embedUrl).hostname).toBe("www.youtube-nocookie.com");
    }
  });
});