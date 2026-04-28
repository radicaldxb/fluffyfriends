/** GTM: always include `theme` (lowercase key or null) and `portrait_id` (UUID or null) on /create funnel events. */
export function funnelDatalayerPayload(
  theme: string | null,
  portraitId: string | null | undefined,
): { theme: string | null; portrait_id: string | null } {
  return {
    theme: theme == null || String(theme).trim() === "" ? null : String(theme).trim().toLowerCase(),
    portrait_id:
      portraitId != null && String(portraitId).trim() ? String(portraitId).trim() : null,
  }
}
