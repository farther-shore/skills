export const BUNDLE_INSTALL =
  "npx skills add https://github.com/farther-shore/skills/tree/<tag> --skill '*' -g -y";

const FORBIDDEN_GUIDANCE = [
  [
    /\bfs\.rbac\s*\(|\bprice_per_unit_micros\b|\bincluded_units\b/,
    "retired Business SDK authoring",
  ],
  [/\bwithUsage\b/, "retired backend reporting API"],
  [/\bfarthershore\s+plan\s+migrate\b/, "retired cohort migration command"],
  [
    /@(?:Business|Plan|Feature|Meter)\b|\bdecorators?\b|experimentalDecorators/i,
    "obsolete decorator guidance",
  ],
  [
    /\bfarthershore\s+(?:business\s+)?(?:template|preset)\b|\bfarthershore[^\n`]*--(?:template|preset)\b/i,
    "obsolete FartherShore template or preset guidance",
  ],
  [
    /\bfarthershore\s+(?:provision|init)\b|\/businesses\/init\b|\blocal provisioning\b/i,
    "obsolete local provisioning or init guidance",
  ],
  [
    /farthershore\s+skills\s+recommend/i,
    "FartherShore skills recommendation guidance",
  ],
  [
    /\bfarthershore\s+config\s+(?:propose|draft|apply)\b|\/config\/(?:propose|draft|apply)\b|\bconfig (?:proposal|draft)\b/i,
    "obsolete bidirectional config workflow",
  ],
  [
    /(?:\b(?:create|generate|provision|issue|mint|rotate|revoke|delete|update|edit|configure|modify|administer|manage)\b[^\n]{0,100}\bmaker[- ]?tokens?\b|\bmaker[- ]?tokens?\b[^\n]{0,100}\b(?:create|generation|provision|issuance|mint|rotate|revoke|delete|update|edit|configure|modify|administration)\b)/i,
    "maker-token credential administration",
  ],
  [/\bmk_[A-Za-z0-9_]+\b/i, "raw maker-token credential"],
  [
    /\bfarthershore\s+(?:auth\s+login|login)\b[^\n`]*\s--token(?:=|\s|$)/i,
    "secret-bearing CLI authentication",
  ],
  [
    /\bfarthershore\s+auth\s+(?:login|logout)\b/i,
    "obsolete nested authentication command",
  ],
  [
    /(?:GitHub|Stripe)\s+connect|connect(?:ing)?\s+(?:GitHub|Stripe)/i,
    "GitHub or Stripe connection setup",
  ],
  [
    /farthershore\s+business\s+create\s+--/i,
    "obsolete flag-based business creation",
  ],
  [
    /farthershore\s+business\s+update|farthershore\s+plan\s+(?:create|update|delete|promote|rollback)/i,
    "CLI contract mutation",
  ],
  [
    /\bfarthershore\s+login\b[\s\S]{0,240}--(?:access|business|name|permission)\b/i,
    "obsolete device-login option flags",
  ],
  [
    /\b(?:human|approver|approval)[^\n]*(?:approves?|reviews?|selects?)[^\n]*exact permissions?/i,
    "obsolete device-login permission selection",
  ],
  [/\brequest hints?\b/i, "obsolete device-login request hints"],
  [
    /\bstandalone approval page\b[\s\S]{0,160}(?:narrow|limit|restrict|select)[\s\S]{0,160}(?:organization|business|permission|tier|name)/i,
    "obsolete device-login approval options",
  ],
  [
    /\bfarthershore\s+(?:auth\s+organization\s+(?:list|use)|--organization)\b[^\n]{0,180}\b(?:narrow|limit|restrict|reduce)\b[^\n]{0,100}\b(?:credential|authority|permissions?|access)\b/i,
    "organization context described as authority narrowing",
  ],
];

const DEVICE_AUTH_REQUIREMENTS = [
  [/\bfarthershore\s+login\b/i, "browser device login"],
  [/\bfarthershore\s+login\s+--headless\b/i, "headless device login"],
  [/\bfarthershore\s+logout\b/i, "logout command"],
  [
    /\bcredential\b[\s\S]{0,100}(?:follows?|uses?)[\s\S]{0,100}live[\s\S]{0,100}(?:role|permissions?)/i,
    "live user authority",
  ],
  [
    /\ball\s+current\s+and\s+future\s+organizations\s+and\s+businesses\b/i,
    "all-organization and all-business membership",
  ],
  [
    /\bstandalone approval page\b[\s\S]{0,140}(?:only|just)[\s\S]{0,60}(?:allow|approve)[\s\S]{0,60}(?:deny|decline)/i,
    "zero-option approval",
  ],
  [
    /\bfarthershore\s+auth\s+organization\s+list\b/i,
    "organization list command",
  ],
  [
    /\bfarthershore\s+auth\s+organization\s+use\s+<id-or-slug>/i,
    "organization use command",
  ],
  [
    /\bfarthershore\s+--organization\s+<id-or-slug>/i,
    "one-command organization override",
  ],
  [
    /\borganization-scoped\b[\s\S]{0,100}\bmaker[- ]?token\b[\s\S]{0,180}\bfarthershore\s+login\s+--token-stdin\b/i,
    "organization-scoped MakerToken stdin override",
  ],
  [
    /\bFARTHERSHORE_TOKEN\b[\s\S]{0,120}\b(?:ephemeral|temporary|one-command)\b|\b(?:ephemeral|temporary|one-command)\b[\s\S]{0,120}\bFARTHERSHORE_TOKEN\b/i,
    "ephemeral MakerToken environment override",
  ],
  [
    /\b(?:never|do not)\b[\s\S]{0,160}(?:credential|secret|token)[\s\S]{0,160}(?:argv|command line)[\s\S]{0,160}(?:stdout|stderr|output)/i,
    "secret-safe credential handling",
  ],
];

export function findObsoleteGuidance(text) {
  return FORBIDDEN_GUIDANCE.filter(([pattern]) => pattern.test(text)).map(
    ([, label]) => label,
  );
}

export function findSkillsAddCommands(text) {
  return [...text.matchAll(/npx(?:\s+-y)?\s+skills\s+add\s+[^`\n]+/g)].map(
    (match) => match[0].trim(),
  );
}

export function findMissingDeviceAuthGuidance(text) {
  return DEVICE_AUTH_REQUIREMENTS.filter(
    ([pattern]) => !pattern.test(text),
  ).map(([, label]) => label);
}
