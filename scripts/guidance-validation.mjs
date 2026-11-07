export const BUNDLE_INSTALL =
  "npx skills add https://github.com/farther-shore/skills/tree/<tag> --skill '*' -g -y";

// The caller-supplied retry-key mechanism was removed from every external
// surface. The patterns spell the retired word with a character class so this
// repository never contains it verbatim.
const FORBIDDEN_GUIDANCE = [
  [
    /idem[p]oten|--idem[p]otency-key|\bsame_key_replay\b|\bintrinsic_replay\b|\bretry\.keyRequired\b|\breplay key\b/i,
    "retired caller-supplied retry key",
  ],
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
    /farthershore\s+business\s+create\s+--/i,
    "obsolete flag-based business creation",
  ],
  [
    /farthershore\s+plan\s+(?:create|update|delete|promote|rollback)/i,
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
    /\bstandalone approval page\b[^.\n]{0,160}\b(?:may|can|lets?|allows?)\b[^.\n]{0,80}(?:narrow|limit|restrict|select)[^.\n]{0,100}(?:organization|business|permission|tier|name)/i,
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

const RETRY_GUIDANCE_REQUIREMENTS = [
  [/\bretry\.kind\b/, "operation retry classification"],
  [/\bread_current\b/, "read-current retry rule"],
  [/\bconvergent_write\b/, "convergent-write retry rule"],
  [/\bno_automatic_retry\b/, "no-automatic-retry rule"],
  [/\bretry\.reconcile\b/, "operation reconciliation guidance"],
  [/\bretry\.rationale\b/, "operation retry rationale guidance"],
  [/\bretry\.enforcement\b/, "server enforcement guidance"],
  [/\bretry\.responseSemantics\b/, "response freshness guidance"],
  [/\bOUTCOME_UNKNOWN\b/, "unknown-outcome write handling"],
  [/\bsafe_to_repeat\b/, "server safe-to-repeat verdict"],
  [/\b429\b/, "rate-limit write retry"],
  [/\bCONFLICT\b/, "repeated-create conflict handling"],
  [/\bRELEASE_PENDING_ACCEPTANCE\b/, "pending-release publish handling"],
  [/\bROLLBACK_IN_FLIGHT\b/, "in-flight rollback handling"],
  [/\bDRY_RUN_NOT_SUPPORTED\b/, "unsupported preview handling"],
  [
    /point-in-time[\s\S]{0,120}(?:never|not)[\s\S]{0,60}(?:fresh read|current state)/i,
    "write-result freshness warning",
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

export function findMissingRetryGuidance(text) {
  return RETRY_GUIDANCE_REQUIREMENTS.filter(
    ([pattern]) => !pattern.test(text),
  ).map(([, label]) => label);
}

// These guards cover decision points rather than exact tutorial sentences.
// They supplement independent task evaluation; they do not certify agent behavior.
export const WORKFLOW_REQUIREMENTS = {
  common: [
    [/\bsearch\b/i, "task-language search"],
    [/\b(?:full|complete)\b[\s\S]{0,70}\bguide\b/i, "full-guide retrieval"],
    [/\b(?:prerequisites|recovery)\b/i, "prerequisite/recovery retrieval"],
    [
      /\bdescrib(?:e|ed)\b[\s\S]{0,140}\b(?:types|inputs|methods)\b/i,
      "operation description",
    ],
    [/\b(?:installed|pins)\b/i, "installed capability/version check"],
    [
      /\b(?:unavailable|fails)\b[\s\S]{0,260}\bcanonical\b|\bcanonical\b[\s\S]{0,200}\bfallback\b/i,
      "canonical retrieval fallback",
    ],
    [
      /\b(?:stop|report)\b[\s\S]{0,240}\b(?:unavailable|gap|guidance|prerequisites)\b/i,
      "missing-evidence stop",
    ],
    [/\bverif(?:y|ied|ication)\b/i, "outcome verification"],
    [/\b(?:environment|target)\b/i, "explicit target"],
  ],
  "farthershore-overview": [
    [/backend-free[\s\S]{0,100}(?:no|needs no)/i, "conditional hosting"],
    [/returned managed repository URL/i, "managed repository handoff"],
    [/first wrong boundary/i, "diagnosis before repair"],
    [
      /redact[\s\S]{0,200}(?:not a usable|secure CLI)/i,
      "redacted-secret boundary",
    ],
  ],
  "farthershore-business-sdk": [
    [
      /deterministic[\s\S]{0,90}branded refs/i,
      "deterministic branded authoring",
    ],
    [
      /measurement[\s\S]{0,100}bind fixed route costs/i,
      "measurement attachment",
    ],
    [/both business and subscriber[\s\S]{0,45}enablement/i, "two RBAC gates"],
    [/business-wide[\s\S]{0,110}preview/i, "preview vocabulary impact"],
    [/Nanos[\s\S]{0,80}decimal strings/i, "exact money"],
    [
      /publication[\s\S]{0,130}(?:subscriber pins|migrat)/i,
      "release versus subscriber pins",
    ],
  ],
  "farthershore-backends-and-runtime": [
    [/backend-free[\s\S]{0,80}no backend/i, "backend-free exception"],
    [
      /create an[\s\S]{0,120}row[\s\S]{0,100}then mint/i,
      "row before credential",
    ],
    [/configure[\s\S]{0,90}then deploy\/start/i, "secret before process start"],
    [/redacts[\s\S]{0,160}cannot configure/i, "MCP secret handoff"],
    [/before JSON parsing/i, "raw verification order"],
    [/scope every storage query/i, "tenant predicates"],
    [
      /one[\s\S]{0,35}channel and one post-stream callback/i,
      "single report lifecycle",
    ],
    [/ok: false[\s\S]{0,100}not observed/i, "failed-report evidence"],
    [/hard cutover[\s\S]{0,180}propagation/i, "rotation propagation boundary"],
    [/reconcile metadata and lineage first/i, "lost-credential reconciliation"],
  ],
  "farthershore-building-uis": [
    [/primary objects[\s\S]{0,100}pricing model/i, "product-first composition"],
    [
      /Self-fetching[\s\S]{0,100}presenters/i,
      "component/provider responsibilities",
    ],
    [
      /scope data, mutation,[\s\S]{0,100}organization/i,
      "data and authorization scope",
    ],
    [/never an[\s\S]{0,30}authorization boundary/i, "server authorization"],
    [/opaque[\s\S]{0,100}Nanos/i, "money disclosure"],
    [
      /stored subscriber spend preferences[\s\S]{0,80}enforced/i,
      "preference versus enforcement",
    ],
    [/nonowner[\s\S]{0,90}denied/i, "nonowner denial proof"],
  ],
  "farthershore-environments-and-releasing": [
    [
      /farthershore validate[\s\S]{0,130}checked\/skipped/i,
      "real CLI validation evidence",
    ],
    [/check runs[\s\S]{0,40}commit statuses/i, "exact-head platform checks"],
    [/compatible pushes preserve personas/i, "compatible preview preservation"],
    [/origins may inherit production/i, "backend data isolation"],
    [
      /terminal-owned[\s\S]{0,140}MCP does[\s\S]{0,100}local servers/i,
      "local process boundary",
    ],
    [
      /charges enabled[\s\S]{0,100}Tax[\s\S]{0,100}free-only/i,
      "first launch payment gates",
    ],
    [/PENDING[\s\S]{0,50}DRAFT/i, "first publish asynchronous state"],
    [
      /economic or unknown[\s\S]{0,130}Bare tags/i,
      "qualifying economic release",
    ],
    [
      /real purchase[\s\S]{0,140}explicit authorization/i,
      "real-money authorization",
    ],
    [/pin[\s\S]{0,90}prevent later autoactivation/i, "frontend pin recovery"],
  ],
  "farthershore-customer-operations": [
    [/complete replacement sets/i, "replacement-set review"],
    [/no CLI unblock[\s\S]{0,80}no restore/i, "containment/removal boundary"],
    [/proposer-only[\s\S]{0,100}human approval/i, "governed actor authority"],
    [
      /explicitly disabled[\s\S]{0,80}default enabled/i,
      "disabled-first automation review",
    ],
    [/consent\/opt-outs/i, "audience consent"],
    [/in-flight[\s\S]{0,70}stopped\/undone/i, "disable is not undo"],
    [
      /read[\s\S]{0,100}actual downstream proof/i,
      "fresh read and observable effect",
    ],
  ],
};

export function findMissingWorkflowGuidance(name, text) {
  return [
    ...WORKFLOW_REQUIREMENTS.common,
    ...(WORKFLOW_REQUIREMENTS[name] ?? []),
  ]
    .filter(([pattern]) => !pattern.test(text))
    .map(([, label]) => label);
}
