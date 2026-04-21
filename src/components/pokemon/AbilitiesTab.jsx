// src/components/pokemon/AbilitiesTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";

// One shared API client instance
// This avoids recreating it on every render and allows caching
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// Extract ability ID from its API URL
function getIdFromUrl(url) {
  // url looks like: https://pokeapi.co/api/v2/ability/65/
  const match = url.match(/\/ability\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

// Format ability names nicely (e.g. "solar-power" → "Solar Power")
function capitalizeWords(text) {
  if (!text) return text;
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AbilitiesTab() {
  const LIMIT = 24; // number of abilities per page

  // Current page (0-based index)
  const [page, setPage] = useState(0);

  // Search input value
  const [query, setQuery] = useState("");

  // UI states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // API data: { count, results: [{ name, url }] }
  const [data, setData] = useState(null);

  // Used to prevent outdated API responses from overriding newer ones
  const requestIdRef = useRef(0);

  // 🔄 Fetch ability list whenever "page" changes
  useEffect(() => {
    let alive = true; // track if component is still mounted
    const reqId = ++requestIdRef.current;

    async function load() {
      setLoading(true); // start loading state
      setErrorMsg(""); // clear previous errors

      try {
        // Calculate which slice of data to fetch
        const interval = { offset: page * LIMIT, limit: LIMIT };

        // Fetch ability list from API
        const res = await P.getAbilitiesList(interval);

        // Ignore if this response is outdated
        if (!alive || reqId !== requestIdRef.current) return;

        setData(res); // store fetched data
      } catch (err) {
        if (!alive || reqId !== requestIdRef.current) return;
        setErrorMsg(err?.message || "Failed to load ability list.");
      } finally {
        if (!alive || reqId !== requestIdRef.current) return;
        setLoading(false); // stop loading state
      }
    }

    load();

    // Cleanup when component unmounts
    return () => {
      alive = false;
    };
  }, [page]); // re-run when page changes

  // 🔍 Filter abilities on CURRENT page only
  const filtered = useMemo(() => {
    const results = data?.results ?? [];
    const q = query.trim().toLowerCase();

    if (!q) return results;

    // simple client-side filter
    return results.filter((ability) => ability.name.includes(q));
  }, [data, query]);

  // Total number of abilities from API
  const totalCount = data?.count ?? 0;

  // Max page index (0-based)
  const maxPage = totalCount
    ? Math.max(0, Math.ceil(totalCount / LIMIT) - 1)
    : 0;

  return (
    <section className="p-6 text-left">
      <h2 className="font-burger text-2xl text-slate-100">Abilities</h2>

      <p className="text-sm text-slate-300 mt-1">
        Browse abilities. Use search to filter the current page.
      </p>

      {/* 🔎 Search + Pagination Controls */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="ability-search">
            Search Abilities
          </label>
          <input
            id="ability-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)} // update search
            placeholder="Search on this page (e.g. blaze)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300/70"
          />
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-slate-100 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(0, p - 1))} // go to previous page
            disabled={loading || page === 0}
          >
            Prev
          </button>

          {/* Page indicator */}
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
            className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-slate-100 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))} // next page
            disabled={loading || page >= maxPage}
          >
            Next
          </button>
        </div>
      </div>

      {/* ❌ Error state */}
      {errorMsg ? (
        <div className="mt-6 rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-red-200">
          {errorMsg}
        </div>
      ) : null}

      {/* ⏳ Loading state (skeleton cards) */}
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-950/30"
            />
          ))}
        </div>
      ) : (
        // ✅ Main abilities grid
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((ability) => {
            const id = getIdFromUrl(ability.url);

            return (
              <div
                key={ability.name}
                className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/50 transition"
              >
                <div className="flex items-center gap-3">
                  {/* Placeholder icon box since abilities do not have sprite images */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800/40 text-sm text-slate-300">
                    AB
                  </div>

                  {/* Ability info */}
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">
                      #{id ? String(id).padStart(3, "0") : "???"}
                    </div>

                    <div className="truncate text-slate-100 font-semibold">
                      {capitalizeWords(ability.name)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🚫 Empty state when no results match search */}
      {!loading && !errorMsg && filtered.length === 0 ? (
        <div className="mt-6 text-slate-300">
          No abilities match this search on the current page.
        </div>
      ) : null}
    </section>
  );
}