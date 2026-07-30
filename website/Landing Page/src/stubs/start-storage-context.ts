// Browser-safe stub for @tanstack/start-storage-context
// The real module imports from "node:async_hooks" which is Node.js-only and
// crashes browsers with "TypeError: AsyncLocalStorage is not a constructor".
// This stub replaces it with safe no-ops for client-side SPA builds.

const GLOBAL_STORAGE_KEY = Symbol.for("tanstack-start:start-storage-context");
const globalObj = globalThis as any;

// Provide a browser-safe storage shim
if (!globalObj[GLOBAL_STORAGE_KEY]) {
  globalObj[GLOBAL_STORAGE_KEY] = {
    getStore: () => undefined,
    run: (_store: any, fn: () => any) => fn(),
  };
}

export async function runWithStartContext(context: any, fn: () => any) {
  return fn();
}

export function getStartContext(opts?: { throwIfNotFound?: boolean }): any {
  // In the browser, there is no server context — always return undefined safely.
  return undefined;
}
