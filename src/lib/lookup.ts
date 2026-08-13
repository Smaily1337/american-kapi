export function parseCopartLookup(raw: string): { lot?: string; q?: string } {
  const value = raw.trim();
  if (!value) return {};

  const urlLot = value.match(
    /copart\.com\/(?:lot|public\/data\/lotdetails\/solr)\/(\d{5,10})/i,
  );
  if (urlLot) return { lot: urlLot[1] };

  const lotParam = value.match(/[?&](?:lot|lotNumber|query)=(\d{5,10})\b/i);
  if (lotParam) return { lot: lotParam[1] };

  const labeled = value.match(/(?:^|\b)(?:lot|#)\s*[:#]?\s*(\d{5,10})\b/i);
  if (labeled) return { lot: labeled[1] };

  if (/^\d{5,10}$/.test(value)) return { lot: value };

  return { q: value };
}

export function lookupHref(raw: string): string | null {
  const parsed = parseCopartLookup(raw);
  if (parsed.lot) return `/ogloszenia/${parsed.lot}`;
  if (parsed.q) return `/ogloszenia?q=${encodeURIComponent(parsed.q)}`;
  return null;
}
