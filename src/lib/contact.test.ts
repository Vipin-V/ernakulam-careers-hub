import { describe, expect, it } from "vitest";
import { toIntlPhone, whatsappLink } from "./contact";

describe("contact links", () => {
  it("adds India code to 10-digit numbers", () => {
    expect(toIntlPhone("098765 43210")).toBe("919876543210");
    expect(toIntlPhone("+91 98765-43210")).toBe("919876543210");
  });
  it("builds a wa.me link with prefilled message", () => {
    const url = whatsappLink("9876543210", "Rahul K", "Grand Hyatt", "Server");
    expect(url.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Hi Rahul, this is Grand Hyatt");
  });
});
