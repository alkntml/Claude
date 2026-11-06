import { afterEach, describe, expect, it, vi } from "vitest";
import { isPrivateIp, isSafePublicUrl, resolvesToPublic, safeFetch } from "@/lib/sources/http";

const pub = async () => [{ address: "93.184.216.34" }];
const priv = async () => [{ address: "10.0.0.5" }];

describe("SSRF koruması (D106)", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("özel ve ayrılmış IP adreslerini tanır", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.20.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "224.0.0.1"]) expect(isPrivateIp(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "93.184.216.34", "2606:4700::1111", "192.0.43.10"]) expect(isPrivateIp(ip), ip).toBe(false);
  });
  it("tehlikeli adres yazımlarını reddeder", () => {
    for (const u of ["http://localhost/x", "http://2130706433/", "http://0x7f000001/", "http://intranet/", "https://a.b:8443/", "https://user:p@arxiv.org/", "file:///etc/passwd", "http://[::1]/"]) expect(isSafePublicUrl(u), u).toBe(false);
    expect(isSafePublicUrl("https://arxiv.org/pdf/1")).toBe(true);
  });
  it("iç ağa çözümlenen alan adını reddeder", async () => {
    expect(await resolvesToPublic("https://ornek.org/a", pub)).toBe(true);
    expect(await resolvesToPublic("https://ornek.org/a", priv)).toBe(false);
    expect(await resolvesToPublic("https://ornek.org/a", async () => [{ address: "8.8.8.8" }, { address: "127.0.0.1" }])).toBe(false);
  });
  it("yönlendirmenin her adımını denetler", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      calls.push(u);
      if (u.endsWith("/a")) return new Response(null, { status: 302, headers: { location: "http://169.254.169.254/latest" } });
      return new Response("%PDF-");
    }));
    await expect(safeFetch("https://ornek.org/a", { signal: new AbortController().signal }, { lookup: pub })).rejects.toThrow(/Güvenli olmayan/);
    expect(calls).toEqual(["https://ornek.org/a"]);
    const ok = await safeFetch("https://ornek.org/b", { signal: new AbortController().signal }, { lookup: pub });
    expect(await ok.text()).toBe("%PDF-");
  });
});
