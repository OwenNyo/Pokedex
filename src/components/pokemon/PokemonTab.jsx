// src/components/pokemon/PokemonTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";

// One shared API client instance
// This avoids recreating it on every render and allows caching
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// Extract Pokémon ID from its API URL
function getIdFromUrl(url) {
  // url looks like: https://pokeapi.co/api/v2/pokemon/25/
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

// Capitalize first letter of Pokémon name
function capitalizeWords(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function PokemonTab() {
  const LIMIT = 24; // number of Pokémon per page

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

  // 🔄 Fetch Pokémon list whenever "page" changes
  useEffect(() => {
    let alive = true; // track if component is still mounted
    const reqId = ++requestIdRef.current;

    async function load() {
      setLoading(true);       // start loading state
      setErrorMsg("");        // clear previous errors

      try {
        // Calculate which slice of data to fetch
        const interval = { offset: page * LIMIT, limit: LIMIT };

        // Fetch Pokémon list from API
        const res = await P.getPokemonsList(interval);

        // Ignore if this response is outdated
        if (!alive || reqId !== requestIdRef.current) return;

        setData(res); // store fetched data
      } catch (err) {
        if (!alive || reqId !== requestIdRef.current) return;
        setErrorMsg(err?.message || "Failed to load Pokémon list.");
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

  // 🔍 Filter Pokémon on CURRENT page only
  const filtered = useMemo(() => {
    const results = data?.results ?? [];
    const q = query.trim().toLowerCase();

    if (!q) return results;

    // simple client-side filter
    return results.filter((p) => p.name.includes(q));
  }, [data, query]);

  // Total number of Pokémon from API
  const totalCount = data?.count ?? 0;

  // Max page index (0-based)
  const maxPage = totalCount
    ? Math.max(0, Math.ceil(totalCount / LIMIT) - 1)
    : 0;

  return (
    <section className="p-6 text-left">
      <h2 className="font-burger text-2xl text-slate-100">Pokémon</h2>

      <p className="text-sm text-slate-300 mt-1">
        Browse Pokémon. Use search to filter the current page.
      </p>

      {/* 🔎 Search + Pagination Controls */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search input */}
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="pokemon-search">
            Search Pokémon
          </label>
          <input
            id="pokemon-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)} // update search
            placeholder="Search on this page (e.g. pika)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300/70"
          />
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-3">
          <button
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
        // ✅ Main Pokémon grid
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const id = getIdFromUrl(p.url);

            // Construct sprite image URL using Pokémon ID
            const sprite = id
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
              : null;

            return (
              <div
                key={p.name}
                className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/50 transition"
              >
                <div className="flex items-center gap-3">

                  {/* Pokémon image */}
                  {sprite ? (
                    <img
                      src={sprite}
                      alt={p.name}
                      className="h-12 w-12 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-slate-800/40" />
                  )}

                  {/* Pokémon info */}
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">
                      #{id ? String(id).padStart(3, "0") : "???"}
                    </div>

                    <div className="truncate text-slate-100 font-semibold">
                      {capitalizeWords(p.name)}
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
          No Pokémon match this search on the current page.
        </div>
      ) : null}
    </section>
  );
}