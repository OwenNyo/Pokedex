// src/components/pokemon/PokemonTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";

// One shared client instance (so cache is reused across renders)
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

function getIdFromUrl(url) {
  // url looks like: https://pokeapi.co/api/v2/pokemon/25/
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PokemonTab() {
  const LIMIT = 24;

  const [page, setPage] = useState(0); // 0-based
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null); // { count, results: [{name,url}] }

  // prevent stale setState if user flips pages quickly
  const requestIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const reqId = ++requestIdRef.current;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const interval = { offset: page * LIMIT, limit: LIMIT };
        const res = await P.getPokemonsList(interval); // wrapper method
        if (!alive || reqId !== requestIdRef.current) return;

        setData(res);
      } catch (err) {
        if (!alive || reqId !== requestIdRef.current) return;
        setErrorMsg(err?.message || "Failed to load Pokémon list.");
      } finally {
        if (!alive || reqId !== requestIdRef.current) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [page]);

  const filtered = useMemo(() => {
    const results = data?.results ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return results;

    // filter current page only (simple + fast). Later you can add global search.
    return results.filter((p) => p.name.includes(q));
  }, [data, query]);

  const totalCount = data?.count ?? 0;
  const maxPage = totalCount ? Math.max(0, Math.ceil(totalCount / LIMIT) - 1) : 0;

  return (
    <section className="p-6 text-left">
      <h2 className="font-burger text-2xl text-slate-100">Pokémon</h2>
      <p className="text-sm text-slate-300 mt-1">
        Browse Pokémon. Use search to filter the current page.
      </p>

      {/* Search + paging */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="pokemon-search">
            Search Pokémon
          </label>
          <input
            id="pokemon-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search on this page (e.g. pika)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300/70"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-slate-100 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={loading || page === 0}
          >
            Prev
          </button>

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
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={loading || page >= maxPage}
          >
            Next
          </button>
        </div>
      </div>

      {/* States */}
      {errorMsg ? (
        <div className="mt-6 rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-red-200">
          {errorMsg}
        </div>
      ) : null}

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
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const id = getIdFromUrl(p.url);
            // Simple sprite URL. Later we can switch to official artwork.
            const sprite = id
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
              : null;

            return (
              <div
                key={p.name}
                className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/50 transition"
              >
                <div className="flex items-center gap-3">
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

                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">
                      #{id ? String(id).padStart(3, "0") : "???"}
                    </div>
                    <div className="truncate text-slate-100 font-semibold">
                      {capitalize(p.name)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !errorMsg && filtered.length === 0 ? (
        <div className="mt-6 text-slate-300">No Pokémon match this search on the current page.</div>
      ) : null}
    </section>
  );
}
