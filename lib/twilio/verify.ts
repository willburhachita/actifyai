import "server-only";

import crypto from "crypto";

function sortEntries(entries: Array<[string, string]>) {
  return [...entries].sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
}

export function verifyTwilioSignature(args: {
  url: string;
  params: URLSearchParams;
  signature: string | null;
  authToken?: string;
}) {
  const { url, params, signature, authToken } = args;

  if (!authToken) {
    return {
      valid: false,
      reason: "missing_auth_token",
    } as const;
  }

  if (!signature) {
    return {
      valid: false,
      reason: "missing_signature",
    } as const;
  }

  const data = sortEntries(Array.from(params.entries())).reduce(
    (acc, [key, value]) => `${acc}${key}${value}`,
    url,
  );

  const expected = crypto
    .createHmac("sha1", authToken)
    .update(data)
    .digest("base64");

  return {
    valid: crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature)),
    reason: "checked",
  } as const;
}
