type ArtKind = "overview" | "research" | "data" | "models";

/** Decorative editorial illustrations, not charts or measured project results. */
export function ObjectiveArt({ kind }: { kind: ArtKind }) {
  return <svg className="dt-objective-art" data-kind={kind} viewBox="0 0 240 100" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {kind === "overview" && <>
        <path className="dt-art-guide" d="M30 22h44l20 28-20 28H30M210 22h-44l-20 28 20 28h44" />
        <circle cx="120" cy="50" r="32" className="dt-art-wash" />
        <circle cx="120" cy="50" r="20" /><circle cx="120" cy="50" r="8" />
        <path d="m120 50 35-32m-12 0h12v12" />
        <circle cx="30" cy="22" r="5" /><circle cx="30" cy="78" r="5" />
        <circle cx="210" cy="22" r="5" /><circle cx="210" cy="78" r="5" />
      </>}
      {kind === "research" && <>
        <path className="dt-art-wash" d="M24 22h54c10 0 18 4 24 10 6-6 14-10 24-10h40v57h-40c-10 0-18 3-24 9-6-6-14-9-24-9H24Z" />
        <path d="M102 32v56M38 36h36m-36 12h43M38 60h30m48-24h32m-32 12h25" />
        <circle cx="172" cy="58" r="21" fill="var(--background)" />
        <path d="m188 74 18 18m-43-34 6 6 13-13" />
      </>}
      {kind === "data" && <>
        <rect className="dt-art-wash" x="28" y="16" width="112" height="68" rx="5" />
        <path d="M28 35h112M58 35v49m32-49v49m-62-32h112M28 68h112" />
        <path d="M42 25h20m98 2h52l-19 25v20l-14 8V52Z" />
        <circle cx="151" cy="80" r="5" /><path className="dt-art-guide" d="M145 56h18m-12 0v19" />
      </>}
      {kind === "models" && <>
        <path className="dt-art-guide" d="M28 50h35m20 0h30m20 0h30m20 0h31M73 40V20h24m26 20V80h24m26-40V20h24" />
        <circle cx="28" cy="50" r="10" className="dt-art-wash" />
        <rect x="63" y="40" width="20" height="20" rx="4" />
        <rect x="113" y="40" width="20" height="20" rx="4" />
        <rect x="163" y="40" width="20" height="20" rx="4" />
        <circle cx="97" cy="20" r="5" /><circle cx="147" cy="80" r="5" /><circle cx="197" cy="20" r="5" />
        <path d="m209 43 7 7-7 7" />
      </>}
    </g>
  </svg>;
}
