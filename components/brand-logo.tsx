type BrandLogoProps = {
  compact?: boolean;
  href?: string;
};

export function BrandLogo({ compact = false, href = "/" }: BrandLogoProps) {
  return (
    <a href={href} className="flex min-w-0 items-center gap-2.5 font-black text-brand">
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-9 w-9 shrink-0"
        role="img"
      >
        <defs>
          <linearGradient id="jidahLogoCyan" x1="16" x2="38" y1="14" y2="50">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="jidahLogoBlue" x1="36" x2="58" y1="12" y2="50">
            <stop stopColor="#1E3A8A" />
            <stop offset="1" stopColor="#172554" />
          </linearGradient>
        </defs>
        <path
          d="M10 12.5h44c5.2 0 9.5 4.3 9.5 9.5v22.5c0 5.2-4.3 9.5-9.5 9.5H26.5L9.5 62l4.2-8H10c-5.2 0-9.5-4.3-9.5-9.5V22c0-5.2 4.3-9.5 9.5-9.5Z"
          fill="#fff"
        />
        <path
          d="M10 12.5h44c5.2 0 9.5 4.3 9.5 9.5v22.5c0 5.2-4.3 9.5-9.5 9.5H26.5L9.5 62l4.2-8H10c-5.2 0-9.5-4.3-9.5-9.5V22c0-5.2 4.3-9.5 9.5-9.5Z"
          fill="none"
          stroke="#E2E8F0"
        />
        <path
          d="M17 24h8v19.2c0 6.8-4.5 10.5-10.4 10.5-2.9 0-5.5-.8-7.5-2.3l4.4-6.6c1.1.8 2.2 1.2 3.5 1.2 2 0 3-1.2 3-3.7V24Z"
          fill="url(#jidahLogoCyan)"
        />
        <path d="M17 24h8v6.8h-8V24Z" fill="#172554" />
        <path
          d="M33 24h11.4c9.1 0 15 5.4 15 13.4s-5.9 13.4-15 13.4H33V24Zm10.8 19.4c4.1 0 6.8-2.4 6.8-6s-2.7-6-6.8-6H41v12h2.8Z"
          fill="url(#jidahLogoBlue)"
        />
        <path d="M29 31.6h7.2v19.2H29V31.6Z" fill="url(#jidahLogoCyan)" />
      </svg>
      <span className={`truncate ${compact ? "text-base" : "text-xl sm:text-2xl"}`}>
        即答AI客服
      </span>
    </a>
  );
}
