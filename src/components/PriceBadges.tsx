import { formatPln, formatUsd } from "@/lib/format";

type Props = {
  currentBidUsd: number;
  buyNowUsd?: number;
  landedPln?: number;
  compact?: boolean;
};

export function PriceBadges({
  currentBidUsd,
  buyNowUsd,
  landedPln,
  compact = false,
}: Props) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={`grid gap-2 ${buyNowUsd ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="rounded-md bg-navy px-3 py-2 text-white">
          <div className="text-[10px] font-bold uppercase tracking-wide text-white/70">
            Aktualna cena
          </div>
          <div className={compact ? "text-lg font-extrabold" : "text-xl font-extrabold"}>
            {currentBidUsd > 0 ? formatUsd(currentBidUsd) : "Brak ofert"}
          </div>
        </div>
        {buyNowUsd ? (
          <div className="rounded-md bg-orange px-3 py-2 text-white">
            <div className="text-[10px] font-bold uppercase tracking-wide text-white/80">
              Kup teraz
            </div>
            <div className={compact ? "text-lg font-extrabold" : "text-xl font-extrabold"}>
              {formatUsd(buyNowUsd)}
            </div>
          </div>
        ) : null}
      </div>
      {landedPln !== undefined && (
        <div className="text-sm font-semibold text-navy">
          W Polsce od{" "}
          <span className="font-extrabold text-orange">{formatPln(landedPln)}</span>
        </div>
      )}
    </div>
  );
}
