export const BUNDLE_INSTALL =
  "npx skills add https://github.com/farther-shore/skills/tree/<tag> --skill '*' -g -y";

const FORBIDDEN_GUIDANCE = [
  [/@(?:Business|Plan|Feature|Meter)\b|\bdecorators?\b|experimentalDecorators/i, "obsolete decorator guidance"],
  [/\bfarthershore\s+(?:business\s+)?(?:template|preset)\b|\bfarthershore[^\n`]*--(?:template|preset)\b/i, "obsolete FartherShore template or preset guidance"],
  [/\bfarthershore\s+(?:provision|init)\b|\/businesses\/init\b|\blocal provisioning\b/i, "obsolete local provisioning or init guidance"],
  [/farthershore\s+skills\s+recommend/i, "FartherShore skills recommendation guidance"],
  [/\bfarthershore\s+config\s+(?:propose|draft|apply)\b|\/config\/(?:propose|draft|apply)\b|\bconfig (?:proposal|draft)\b/i, "obsolete bidirectional config workflow"],
  [/\bmaker[- ]tokens?\b|\bmk_[A-Za-z0-9_]*|FARTHERSHORE_TOKEN/i, "maker-token setup"],
  [/(?:GitHub|Stripe)\s+connect|connect(?:ing)?\s+(?:GitHub|Stripe)/i, "GitHub or Stripe connection setup"],
  [/farthershore\s+business\s+create\s+--/i, "obsolete flag-based business creation"],
  [/farthershore\s+business\s+update|farthershore\s+plan\s+(?:create|update|delete|promote|rollback)/i, "CLI contract mutation"],
];

export function findObsoleteGuidance(text) {
  return FORBIDDEN_GUIDANCE.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}

export function findSkillsAddCommands(text) {
  return [...text.matchAll(/npx(?:\s+-y)?\s+skills\s+add\s+[^`\n]+/g)].map((match) =>
    match[0].trim(),
  );
}
