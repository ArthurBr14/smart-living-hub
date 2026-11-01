// A recovery link can arrive in two shapes:
// - implicit flow: #access_token=...&type=recovery
// - PKCE flow: ?code=... (the code is exchanged for a session by the client)
// Both must be treated as a valid recovery visit, or the page refuses a good link.
export function isRecoveryUrl(search: string, hash: string): boolean {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  return (
    hashParams.get("type") === "recovery" ||
    hashParams.has("access_token") ||
    params.has("code") ||
    params.has("access_token")
  );
}
