export default function UAEFlagBanner({ label = "Proud of UAE" }: { label?: string }) {
  return (
    <div className="uae-flag-wrap w-full">
      <div
        className="uae-flag-banner w-full h-12 sm:h-16 overflow-hidden"
        role="img"
        aria-label="UAE flag"
      >
        <span className="uae-flag-shine" aria-hidden="true" />
      </div>
      <p className="uae-flag-caption text-center font-extrabold uppercase text-base sm:text-xl tracking-[0.3em] py-2.5">
        {label}
        {/* The shine's coloured copies draw the label from data-text through
            ::before, so the label is in the markup once, not four times. */}
        <span className="uae-flag-caption-sweep" aria-hidden="true">
          <span className="uae-caption-green" data-text={label} />
          <span className="uae-caption-glint" data-text={label} />
          <span className="uae-caption-red" data-text={label} />
        </span>
      </p>
    </div>
  );
}
