function capitalizeWords(text) {
  if (!text) return text;

  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function TeamDisplay({ team, maxTeamSize, onRemove }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <h2 className="mb-5 text-2xl font-bold text-blue-300">Your Team</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: maxTeamSize }).map((_, index) => {
          const pokemon = team[index];

          return (
            <button
              key={index}
              onClick={() => pokemon && onRemove(pokemon.id)}
              disabled={!pokemon}
              className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/30 p-4 transition hover:bg-slate-950/50 disabled:cursor-default disabled:hover:bg-slate-950/30"
            >
              {pokemon ? (
                <>
                  <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="h-20 w-20 object-contain"
                    loading="lazy"
                  />

                  <div className="mt-3 font-semibold">
                    {capitalizeWords(pokemon.name)}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Click to remove
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-900/60 text-2xl">
                    ?
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-800/60 px-6 py-2 text-slate-400">
                    Empty
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}