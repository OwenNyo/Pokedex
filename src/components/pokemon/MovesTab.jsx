// src/components/pokemon/MovesTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";
import PokedexPagination from "./PokedexPagination";

// Shared API client instance
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// Extract move ID from API URL
function getIdFromUrl(url) {
  // Example: https://pokeapi.co/api/v2/move/13/
  const match = url.match(/\/move\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

// Format move name for display
function capitalizeWords(text) {
  if (!text) return text;
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function MovesTab() {
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
  const [allMoves, setAllMoves] = useState([]);

  // Request tracking
  const requestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);

  // Search mode is active whenever the user has typed something
  const isSearching = query.trim().length > 0;

  // Fetch paginated move list when page changes
  useEffect(() => {
    let alive = true;
    const reqId = ++requestIdRef.current;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const interval = { offset: page * LIMIT, limit: LIMIT };
        const res = await P.getMovesList(interval);

        if (!alive || reqId !== requestIdRef.current) return;
        setData(res);
      } catch (err) {
        if (!alive || reqId !== requestIdRef.current) return;
        setErrorMsg(err?.message || "Failed to load move list.");
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

  // Fetch full move list for global search
  useEffect(() => {
    let alive = true;
    const reqId = ++searchRequestIdRef.current;

    async function loadAllMoves() {
      if (!isSearching) return;
      if (allMoves.length > 0) return;

      setSearchLoading(true);
      setErrorMsg("");

      try {
        const res = await P.getMovesList({ offset: 0, limit: 100000 });

        if (!alive || reqId !== searchRequestIdRef.current) return;
        setAllMoves(res?.results ?? []);
      } catch (err) {
        if (!alive || reqId !== searchRequestIdRef.current) return;
        setErrorMsg(err?.message || "Failed to load searchable move list.");
      } finally {
        if (!alive || reqId !== searchRequestIdRef.current) return;
        setSearchLoading(false);
      }
    }

    loadAllMoves();

    return () => {
      alive = false;
    };
  }, [isSearching, allMoves.length]);

  // Select data source based on search state
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return data?.results ?? [];

    return allMoves.filter((move) => move.name.includes(q));
  }, [data, allMoves, query]);

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
      <h2 className="font-burger text-2xl text-slate-100">Moves</h2>

      <p className="text-sm text-slate-300 mt-1">
        Browse moves. Search looks across all pages.
      </p>

      {/* Search + pagination controls */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="move-search">
            Search Moves
          </label>
          <input
            id="move-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all pages (e.g. punch)"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300/70"
          />
        </div>

        {/* Pagination controls */}
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
          searchLoading={searchLoading}
          isSearching={isSearching}
          inputId="move-page-input"
        />
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
        // Main move grid
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((move) => {
            const id = getIdFromUrl(move.url);

            return (
              <div
                key={move.name}
                className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/50 transition"
              >
                <div className="flex items-center gap-3">
                  {/* Placeholder icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800/40 text-sm text-slate-300">
                    MV
                  </div>

                  {/* Move info */}
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">
                      #{id ? String(id).padStart(3, "0") : "???"}
                    </div>

                    <div className="truncate text-slate-100 font-semibold">
                      {capitalizeWords(move.name)}
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
          No moves match this search.
        </div>
      ) : null}
    </section>
  );
}