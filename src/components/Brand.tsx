// The RepoRangler brand mark — an orange rounded square holding the 4-cell grid
// glyph, taken verbatim from the website's Nav so admin reads as the same product.

export function LogoMark({ size = 32 }: { size?: number }) {
  const glyph = Math.round(size / 2);
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded bg-[#FF6B35]"
      style={{ width: size, height: size }}
    >
      <svg width={glyph} height={glyph} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
        <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7" />
        <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.7" />
        <rect x="9" y="9" width="5" height="5" rx="1" fill="white" />
      </svg>
    </div>
  );
}

// Wordmark: "RepoRangler" in JetBrains Mono, with a small orange "ADMIN" tag so
// this surface is clearly the admin console.
export function Brand({ markSize = 32 }: { markSize?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={markSize} />
      <div className="leading-none">
        <span className="font-mono text-base font-bold tracking-tight text-white">RepoRangler</span>
        <span className="ml-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF6B35]">
          Admin
        </span>
      </div>
    </div>
  );
}
