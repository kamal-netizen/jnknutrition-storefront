export default function UAEFlagBanner() {
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
        Proud of UAE
      </p>
    </div>
  );
}
