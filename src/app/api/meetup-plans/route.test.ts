import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocked = vi.hoisted(() => ({ findFirst: vi.fn(), upsert: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { candidate: { findFirst: mocked.findFirst }, meetupPlan: { upsert: mocked.upsert } } }));
vi.mock("next/cache", () => ({ revalidatePath: mocked.revalidate }));
import { PATCH } from "./route";

const url = "https://example.com/tech-event";
function request(body: unknown, origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/meetup-plans", { method: "PATCH", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocked.findFirst.mockResolvedValue({ id: "candidate" });
  mocked.upsert.mockResolvedValue({ saved: true, people: "エンジニア", talks: "LLM実装" });
});
describe("event plans API", () => {
  it("bookmark updates never overwrite existing event notes", async () => {
    const response = await PATCH(request({ url, saved: false }));
    expect(response.status).toBe(200);
    expect(mocked.upsert.mock.calls[0][0].update).toEqual({ saved: false });
    expect(mocked.revalidate).toHaveBeenCalledWith("/meetups");
  });
  it("saving and clearing notes does not reset the bookmark", async () => {
    await PATCH(request({ url, people: " エンジニア ", talks: "" }));
    expect(mocked.upsert.mock.calls[0][0].update).toEqual({ people: "エンジニア", talks: "" });
    expect(mocked.upsert.mock.calls[0][0].where).toEqual({ url });
  });
  it.each([null, [], {}, { url, people: 10 }, { url, saved: "true" }, { url, talks: "x".repeat(1001) }])("rejects invalid payloads without changing the DB: %j", async (body) => {
    expect((await PATCH(request(body))).status).toBe(400);
    expect(mocked.upsert).not.toHaveBeenCalled();
  });
  it("rejects cross-origin writes and nonexistent events", async () => {
    expect((await PATCH(request({ url, saved: true }, "https://other.example"))).status).toBe(403);
    expect(mocked.findFirst).not.toHaveBeenCalled();
    mocked.findFirst.mockResolvedValue(null);
    expect((await PATCH(request({ url, saved: true }))).status).toBe(404);
    expect(mocked.upsert).not.toHaveBeenCalled();
  });
  it("returns a recoverable error if persistence fails", async () => {
    mocked.upsert.mockRejectedValue(new Error("database unavailable"));
    expect((await PATCH(request({ url, saved: true }))).status).toBe(500);
    expect(mocked.revalidate).not.toHaveBeenCalled();
  });
});
