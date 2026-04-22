// src/components/pokemon/PokedexPagination.jsx

export default function PokedexPagination({
  page,
  maxPage,
  totalCount,
  pageInput,
  onPageInputChange,
  onPageInputKeyDown,
  onGoToPage,
  onPrevPage,
  onNextPage,
  loading = false,
  searchLoading = false,
  isSearching = false,
  inputId = "pokedex-page-input",
}) {
  const controlsDisabled = loading || searchLoading || isSearching;
  const prevDisabled = controlsDisabled || page === 0;
  const nextDisabled = controlsDisabled || page >= maxPage;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/30 px-3 py-2">
        <button
          className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-100 transition hover:bg-slate-900/60 disabled:opacity-40"
          onClick={onPrevPage}
          disabled={prevDisabled}
        >
          Prev
        </button>

        <div className="rounded-xl bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
          Page <span className="font-semibold text-slate-100">{page + 1}</span>
          {totalCount ? (
            <>
              <span className="mx-1 text-slate-500">/</span>
              <span className="font-semibold text-slate-100">{maxPage + 1}</span>
            </>
          ) : null}
        </div>

        <div className="hidden h-6 w-px bg-slate-800 sm:block" />

        <div className="flex items-center gap-2">
          <label htmlFor={inputId} className="text-sm text-slate-400">
            Jump to
          </label>
          <input
            id={inputId}
            type="number"
            min={1}
            max={maxPage + 1}
            value={pageInput}
            onChange={onPageInputChange}
            onKeyDown={onPageInputKeyDown}
            disabled={controlsDisabled}
            className="w-20 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-center text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-300/70 disabled:opacity-40"
          />
          <button
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-100 transition hover:bg-slate-900/60 disabled:opacity-40"
            onClick={onGoToPage}
            disabled={controlsDisabled}
          >
            Go
          </button>
        </div>

        <button
          className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-100 transition hover:bg-slate-900/60 disabled:opacity-40"
          onClick={onNextPage}
          disabled={nextDisabled}
        >
          Next
        </button>
      </div>

      {isSearching ? (
        <div className="mt-3 text-sm text-slate-400">
          Showing search results across all pages. Page browsing is disabled while searching.
        </div>
      ) : null}
    </>
  );
}