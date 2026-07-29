import { createServerFn } from "@tanstack/react-start";
import { contributorApplicationSchema } from "./contributor-schema";

export const submitContributorApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contributorApplicationSchema.parse(input))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) {
      throw new Error("Backend is not configured. Please try again later.");
    }

    // Opaque sb_* keys are not JWTs: send only `apikey`, never an Authorization bearer.
    const fetchShim: typeof fetch = (input, init) => {
      const headers = new Headers(
        typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
      );
      if (init?.headers) {
        new Headers(init.headers).forEach((value, key) => headers.set(key, value));
      }
      if (publishableKey.startsWith("sb_") && headers.get("Authorization") === `Bearer ${publishableKey}`) {
        headers.delete("Authorization");
      }
      headers.set("apikey", publishableKey);
      return fetch(input, { ...init, headers });
    };

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchShim },
    });

    const { error } = await supabase.from("contributor_applications").insert({
      full_name: data.fullName,
      email: data.email,
      github_username: data.githubUsername,
      resume_url: data.resumeUrl,
      motivation: data.motivation,
    });

    if (error) {
      console.error("Contributor application insert failed:", error);
      throw new Error("Could not submit your application right now. Please try again.");
    }

    return { ok: true };
  });
