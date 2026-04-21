// src/components/pokemon/ItemsTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";

// Create ONE shared API client
// This prevents re-creating it every render and enables caching
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// Extract item ID from API URL
function getIdFromUrl(url) {
  // url looks like: https://pokeapi.co/api/v2/item/1/
  const match = url.match(/\/item\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

// Format item names nicely (e.g. "poke-ball" → "Poke Ball")
function capitalizeWords(text) {
  if (!text) return text;
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ItemsTab() {
  const LIMIT = 24; // number of items per page

  // Pagination state (which page we are on)
  const [page, setPage] = useState(0);

  // Search input state
  const [query, setQuery] = useState("");

  // UI states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // API data (stores count + results)
  const [data, setData] = useState(null);

  // Used to prevent race conditions (outdated API responses)
  const requestIdRef = useRef(0);

  // 🔄 Fetch data whenever "page" changes
  useEffect(() => {
    let alive = true; // track if component is still mounted
    const reqId = ++requestIdRef.current;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        // Calculate offset for pagination
        const interval = { offset: page * LIMIT, limit: LIMIT };

        // Fetch item list from API
        const res = await P.getItemsList(interval);

        // Ignore outdated responses
        if (!alive || reqId !== requestIdRef.current) return;

        setData(res);
      } catch (err) {
        if (!alive || reqId !== requestIdRef.current) return;
        setErrorMsg(err?.message || "Failed to load item list.");
      } finally {
        if (!alive || reqId !== requestIdRef.current) return;
        setLoading(false);
      }
    }

    load();

    // Cleanup when component unmounts
    return () => {
      alive = false;
    };
  }, [page]);

  // 🔍 Filter items on the CURRENT page only
  const filtered = useMemo(() => {
    const results = data?.results ?? [];
    const q = query.trim().toLowerCase();

    if (!q) return results;

    return results.filter((item) => item.name.includes(q));
  }, [data, query]);

  // Pagination calculations
  const totalCount = data?.count ?? 0;
  const maxPage = totalCount
    ? Math.max(0, Math.ceil(totalCount / LIMIT) - 1)
    : 0;

  return (
    <section className="p-6 text-left">
      <h2 className="font-burger text-2xl text-slate-100">Items</h2>

      <p className="text-sm text-slate-300 mt-1">
        Browse items. Use search to filter the current page.
      </p>

      {/* 🔎 Search + Pagination Controls */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search input */}
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="item-search">
            Search Items
          </label>
          <input
            id="item-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search on this page (e.g. potion)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300/70"
          />
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={loading || page === 0}
          >
            Prev
          </button>

          {/* Current page display */}
          <div className="text-sm text-slate-300">
            Page <span className="text-slate-100">{page + 1}</span>
            {totalCount ? (
              <>
                {" "}
                / <span className="text-slate-100">{maxPage + 1}</span>
              </>
            ) : null}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={loading || page >= maxPage}
          >
            Next
          </button>
        </div>
      </div>

      {/* ❌ Error state */}
      {errorMsg ? (
        <div className="mt-6 text-red-200">{errorMsg}</div>
      ) : null}

      {/* ⏳ Loading state (skeleton cards) */}
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/30 animate-pulse" />
          ))}
        </div>
      ) : (
        // ✅ Main grid
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const id = getIdFromUrl(item.url);

            // Item image uses NAME instead of ID
            const sprite = id
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`
              : null;

            return (
              <div
                key={item.name}
                className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/50 transition"
              >
                <div className="flex items-center gap-3">
                
                  {/* Item image */}
                  {sprite ? (
                    <img
                      src={sprite}
                      alt={item.name}
                      className="h-12 w-12 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-slate-800/40" />
                  )}

                  {/* Item info */}
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">
                      #{id ? String(id).padStart(3, "0") : "???"}
                    </div>

                    <div className="truncate text-slate-100 font-semibold">
                      {capitalizeWords(item.name)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🚫 Empty state (no results after search) */}
      {!loading && !errorMsg && filtered.length === 0 ? (
        <div className="mt-6 text-slate-300">
          No items match this search on the current page.
        </div>
      ) : null}
    </section>
  );
}