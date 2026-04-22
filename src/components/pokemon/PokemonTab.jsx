// src/components/pokemon/PokemonTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";
import { useNavigate } from "react-router-dom";
import PokedexPagination from "./PokedexPagination";

// Shared API client instance
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// Extract Pokémon ID from API URL
function getIdFromUrl(url) {
  // Example: https://pokeapi.co/api/v2/pokemon/25/
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

// Format Pokémon name for display
function capitalizeWords(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function PokemonTab() {
  const LIMIT = 24;

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageInput, setPageInput] = useState("1");

  // Search state
  const [query, setQuery] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Data state
  const [data, setData] = useState(null);
  const [allPokemon, setAllPokemon] = useState([]);

  // Request tracking
  const requestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);

  // Search mode is active whenever the user has typed something
  const isSearching = query.trim().length > 0;

  // Navigation
  const navigate = useNavigate();

  // Fetch paginated Pokémon list when page changes
  useEffect(() => {
    let alive = true;
    const reqId = ++requestIdRef.current;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const interval = { offset: page * LIMIT, limit: LIMIT };
        const res = await P.getPokemonsList(interval);

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

  // Keep page input in sync with current page
  useEffect(() => {
    setPageInput(String(page + 1));
  }, [page]);

  // Fetch full Pokémon list for global search
  useEffect(() => {
    let alive = true;
    const reqId = ++searchRequestIdRef.current;

    async function loadAllPokemon() {
      if (!isSearching) return;
      if (allPokemon.length > 0) return;

      setSearchLoading(true);
      setErrorMsg("");

      try {
        const res = await P.getPokemonsList({ offset: 0, limit: 100000 });

        if (!alive || reqId !== searchRequestIdRef.current) return;
        setAllPokemon(res?.results ?? []);
      } catch (err) {
        if (!alive || reqId !== searchRequestIdRef.current) return;
        setErrorMsg(err?.message || "Failed to load searchable Pokémon list.");
      } finally {
        if (!alive || reqId !== searchRequestIdRef.current) return;
        setSearchLoading(false);
      }
    }

    loadAllPokemon();

    return () => {
      alive = false;
    };
  }, [isSearching, allPokemon.length]);

  // Select data source based on search state
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return data?.results ?? [];
    }

    return allPokemon.filter((p) => p.name.includes(q));
  }, [data, allPokemon, query]);

  const totalCount = data?.count ?? 0;
  const maxPage = totalCount
    ? Math.max(0, Math.ceil(totalCount / LIMIT) - 1)
    : 0;

  // Jump to a specific page
  function goToPage() {
    const parsed = Number(pageInput);

    if (!Number.isInteger(parsed)) {
      setPageInput(String(page + 1));
      return;
    }

    const nextPage = Math.min(Math.max(parsed, 1), maxPage + 1);
    setPage(nextPage - 1);
  }

  // Allow Enter key to trigger page jump
  function handlePageInputKeyDown(e) {
    if (e.key === "Enter") {
      goToPage();
    }
  }

  return (
    <section className="p-6 text-left">
      <h2 className="font-burger text-2xl text-slate-100">Pokémon</h2>

      <p className="text-sm text-slate-300 mt-1">
        Browse Pokémon. Search looks across all pages.
      </p>

      {/* Search + pagination controls */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="pokemon-search">
            Search Pokémon
          </label>
          <input
            id="pokemon-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all pages (e.g. pika)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300/70"
          />
        </div>

        {/* Pagination controls */}
        {!isSearching ? (
          <PokedexPagination
            page={page}
            maxPage={maxPage}
            totalCount={totalCount}
            pageInput={pageInput}
            onPageInputChange={(e) => setPageInput(e.target.value)}
            onPageInputKeyDown={handlePageInputKeyDown}
            onGoToPage={goToPage}
            onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
            onNextPage={() => setPage((p) => Math.min(maxPage, p + 1))}
            loading={loading}
            inputId="pokemon-page-input"
          />
        ) : null}
      </div>

      {/* Show search mode notice */}
      {isSearching ? (
        <div className="mt-3 text-sm text-slate-400">
          Showing search results across all pages. Page browsing is disabled while searching.
        </div>
      ) : null}

      {/* Error state */}
      {errorMsg ? (
        <div className="mt-6 rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-red-200">
          {errorMsg}
        </div>
      ) : null}

      {/* Loading state */}
      {loading || searchLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-950/30"
            />
          ))}
        </div>
      ) : (
        // Main Pokémon grid
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const id = getIdFromUrl(p.url);
            const sprite = id
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
              : null;

            return (
              <div
                key={p.name}
                onClick={() => id && navigate(`/pokedex/pokemon/${id}`)}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/50 hover:scale-[1.02] transition"
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

      {/* Empty state */}
      {!loading && !searchLoading && !errorMsg && filtered.length === 0 ? (
        <div className="mt-6 text-slate-300">
          No Pokémon match this search.
        </div>
      ) : null}
    </section>
  );
}