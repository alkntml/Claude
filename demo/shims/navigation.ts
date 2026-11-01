import { navigate, useRoute } from "./router";

export function useRouter() {
  return { push: (h: string) => navigate(h), replace: (h: string) => navigate(h, true), refresh: () => {}, back: () => history.back(), prefetch: () => {} };
}
export function usePathname() { return useRoute().path; }
export function useSearchParams() { return useRoute().query; }
export function redirect(h: string): never { navigate(h); throw new Error("redirect"); }
export function notFound(): never { throw new Error("notFound"); }
