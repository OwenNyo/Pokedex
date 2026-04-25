function capitalizeWords(text) {
  if (!text) return text;

  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PokemonPool({ pokemon, loading, onAdd }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <h2 className="mb-5 text-2xl font-bold text-blue-300">Your Options</h2>

      {loading ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {Array.from({ length: 48 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-slate-800/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {pokemon.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onAdd(entry)}
              className="flex h-20 items-center justify-center rounded-xl bg-slate-900/50 p-2 transition hover:bg-slate-800/70"
              title={capitalizeWords(entry.name)}
            >
              <img
                src={entry.sprite}
                alt={entry.name}
                className="h-14 w-14 object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}