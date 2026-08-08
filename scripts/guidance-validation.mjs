export const BUNDLE_INSTALL =
  "npx skills add https://github.com/farther-shore/skills/tree/<tag> --skill '*' -g -y";

const FORBIDDEN_GUIDANCE = [
  [/@(?:Business|Plan|Feature|Meter)\b|\bdecorators?\b|experimentalDecorators/i, "obsolete decorator guidance"],
  [/\bfarthershore\s+(?:business\s+)?(?:template|preset)\b|\bfarthershore[^\n`]*--(?:template|preset)\b/i, "obsolete FartherShore template or preset guidance"],
  [/\bfarthershore\s+(?:provision|init)\b|\/businesses\/init\b|\blocal provisioning\b/i, "obsolete local provisioning or init guidance"],
  [/farthershore\s+skills\s+recommend/i, "FartherShore skills recommendation guidance"],
  [/\bfarthershore\s+config\s+(?:propose|draft|apply)\b|\/config\/(?:propose|draft|apply)\b|\bconfig (?:proposal|draft)\b/i, "obsolete bidirectional config workflow"],
  [/\bmaker[- ]tokens?\b|\bmk_[A-Za-z0-9_]*|FARTHERSHORE_TOKEN/i, "maker-token setup"],
  [
    /\bfarthershore(?:\s+auth\s+login\b[^\n`]*)?\s+--token(?:=|\s|$)/i,
    "secret-bearing CLI authentication",
  ],
  [/(?:GitHub|Stripe)\s+connect|connect(?:ing)?\s+(?:GitHub|Stripe)/i, "GitHub or Stripe connection setup"],
  [/farthershore\s+business\s+create\s+--/i, "obsolete flag-based business creation"],
  [/farthershore\s+business\s+update|farthershore\s+plan\s+(?:create|update|delete|promote|rollback)/i, "CLI contract mutation"],
];

const DEVICE_AUTH_REQUIREMENTS = [
  [/\bfarthershore\s+auth\s+login\b/i, "browser device login"],
  [/\bfarthershore\s+auth\s+login\s+--headless\b/i, "headless device login"],
  [
    /\bfarthershore\s+auth\s+login\s+--headless\b[\s\S]{0,200}--access\s+read-only\b[\s\S]{0,200}--business\b[\s\S]{0,200}--permission\b/i,
    "headless narrow-authority request hints",
  ],
  [
    /\bfarthershore\s+auth\s+login\s+--token-stdin\b/i,
    "stdin-only pre-issued credential login",
  ],
  [
    /\bhints?\b[^\n]*(?:do not|does not|are not|is not)[^\n]*(?:grant|authority|authorization)/i,
    "non-authoritative request hints",
  ],
  [
    /\bhuman\b[^\n]*(?:approves?|reviews?)[^\n]*permissions?[^\n]*(?:business\s+)?scope/i,
    "human approval of exact permissions and business scope",
  ],
  [
    /\b(?:never|do not)\b[\s\S]{0,160}(?:credential|secret|token)[\s\S]{0,160}(?:argv|command line)[\s\S]{0,160}(?:stdout|stderr|output)/i,
    "secret-safe credential handling",
  ],
];

export function findObsoleteGuidance(text) {
  return FORBIDDEN_GUIDANCE.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}

export function findSkillsAddCommands(text) {
  return [...text.matchAll(/npx(?:\s+-y)?\s+skills\s+add\s+[^`\n]+/g)].map((match) =>
    match[0].trim(),
  );
}

export function findMissingDeviceAuthGuidance(text) {
  return DEVICE_AUTH_REQUIREMENTS.filter(
    ([pattern]) => !pattern.test(text),
  ).map(([, label]) => label);
}
