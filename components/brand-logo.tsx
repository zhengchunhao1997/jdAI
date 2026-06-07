type BrandLogoProps = {
  compact?: boolean;
  href?: string;
};

export function BrandLogo({ compact = false, href = "/" }: BrandLogoProps) {
  return (
    <a href={href} className="flex min-w-0 items-center gap-2.5 font-black text-brand">
      <img src="/brand-logo.svg" alt="" className="h-9 w-9 shrink-0" />
      <span className={`truncate ${compact ? "text-base" : "text-xl sm:text-2xl"}`}>
        即答AI客服
      </span>
    </a>
  );
}
