// src/pages/PokemonDetailPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pokedex } from "pokeapi-js-wrapper";

const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

const TYPE_STYLES = {
  normal: "bg-stone-500/80 text-white",
  fire: "bg-orange-500/80 text-white",
  water: "bg-blue-500/80 text-white",
  electric: "bg-yellow-400/90 text-slate-950",
  grass: "bg-green-600/80 text-white",
  ice: "bg-cyan-400/80 text-slate-950",
  fighting: "bg-red-700/80 text-white",
  poison: "bg-purple-600/80 text-white",
  ground: "bg-amber-600/80 text-white",
  flying: "bg-sky-400/80 text-slate-950",
  psychic: "bg-pink-500/80 text-white",
  bug: "bg-lime-600/80 text-white",
  rock: "bg-yellow-700/80 text-white",
  ghost: "bg-violet-700/80 text-white",
  dragon: "bg-indigo-700/80 text-white",
  dark: "bg-slate-700/80 text-white",
  steel: "bg-zinc-500/80 text-white",
  fairy: "bg-pink-300/90 text-slate-950",
};

function capitalizeWords(text) {
  if (!text) return text;

  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatStatName(name) {
  const map = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };

  return map[name] ?? capitalizeWords(name);
}

function getStatBarClass(value) {
  if (value < 40) return "bg-gradient-to-r from-red-600 to-red-400";
  if (value < 70) return "bg-gradient-to-r from-orange-500 to-yellow-400";
  if (value < 100) return "bg-gradient-to-r from-yellow-400 to-amber-300";
  if (value < 130) return "bg-gradient-to-r from-lime-500 to-green-400";

  return "bg-gradient-to-r from-emerald-500 to-teal-400";
}

function getTypeClass(typeName) {
  return TYPE_STYLES[typeName] ?? "bg-slate-700 text-white";
}

function extractEvolutionNames(chainNode, acc = []) {
  if (!chainNode) return acc;

  acc.push(chainNode.species.name);

  if (chainNode.evolves_to?.length) {
    chainNode.evolves_to.forEach((next) => extractEvolutionNames(next, acc));
  }

  return acc;
}

export default function PokemonDetailPage() {
  const { id } = useParams();

  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutionPokemon, setEvolutionPokemon] = useState([]);

  const [loading, setLoading] = useState(true);
  const [evolutionLoading, setEvolutionLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadPokemonDetails() {
      setLoading(true);
      setEvolutionLoading(true);
      setErrorMsg("");

      try {
        const pokemonRes = await P.getPokemonByName(id);

        if (!alive) return;
        setPokemon(pokemonRes);

        const speciesRes = await fetch(pokemonRes.species.url).then((res) => {
          if (!res.ok) throw new Error("Failed to load Pokémon species.");
          return res.json();
        });

        if (!alive) return;
        setSpecies(speciesRes);

        if (speciesRes.evolution_chain?.url) {
          const evolutionRes = await fetch(speciesRes.evolution_chain.url).then(
            (res) => {
              if (!res.ok) throw new Error("Failed to load evolution chain.");
              return res.json();
            }
          );

          if (!alive) return;

          const names = extractEvolutionNames(evolutionRes.chain, []);

          const evoDetails = await Promise.all(
            names.map((name) => P.getPokemonByName(name))
          );

          if (!alive) return;
          setEvolutionPokemon(evoDetails);
        } else {
          setEvolutionPokemon([]);
        }
      } catch (err) {
        if (!alive) return;
        setErrorMsg(err?.message || "Failed to load Pokémon details.");
      } finally {
        if (!alive) return;
        setLoading(false);
        setEvolutionLoading(false);
      }
    }

    loadPokemonDetails();

    return () => {
      alive = false;
    };
  }, [id]);

  const artwork = useMemo(() => {
    return (
      pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon?.sprites?.front_default ||
      null
    );
  }, [pokemon]);

  if (loading) {
    return <div className="p-6 text-slate-300">Loading Pokémon details...</div>;
  }

  if (errorMsg || !pokemon) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-red-200">
          {errorMsg || "Pokémon not found."}
        </div>
      </div>
    );
  }

  return (
    <section className="p-6 text-left text-slate-100">
      <div className="mb-5">
        <Link
          to="/pokedex/pokemon"
          className="text-sm font-semibold text-slate-300 transition hover:text-blue-300"
        >
          ← Back to Pokémon
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex h-44 w-44 shrink-0 items-center justify-center">
            {artwork ? (
              <img
                src={artwork}
                alt={pokemon.name}
                className="h-44 w-44 object-contain"
              />
            ) : (
              <div className="text-sm text-slate-500">PK</div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold">
                {capitalizeWords(pokemon.name)}
              </h1>
              <p className="text-2xl text-slate-400">#{pokemon.id}</p>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-300">
                Types
              </h2>

              <div className="flex flex-wrap gap-2">
                {pokemon.types.map((entry) => (
                  <span
                    key={entry.type.name}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeClass(
                      entry.type.name
                    )}`}
                  >
                    {capitalizeWords(entry.type.name)}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-300">
                Abilities
              </h2>

              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((entry) => (
                  <span
                    key={entry.ability.name}
                    className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-200"
                  >
                    {capitalizeWords(entry.ability.name)}
                    {entry.is_hidden ? " (Hidden)" : " (Base)"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-100">Stats</h2>

          <div className="max-w-xl space-y-3">
            {pokemon.stats.map((entry) => {
              const value = entry.base_stat;
              const widthPercent = Math.min((value / 180) * 100, 100);

              return (
                <div key={entry.stat.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-300">
                      {formatStatName(entry.stat.name)}
                    </span>
                    <span className="text-slate-400">{value}</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${getStatBarClass(
                        value
                      )}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-100">
            Evolution Line
          </h2>

          {evolutionLoading ? (
            <div className="text-sm text-slate-400">Loading evolutions...</div>
          ) : evolutionPokemon.length > 0 ? (
            <div className="flex flex-wrap items-center gap-4">
              {evolutionPokemon.map((evo, index) => {
                const evoSprite =
                  evo.sprites?.other?.["official-artwork"]?.front_default ||
                  evo.sprites?.front_default;

                return (
                  <div key={evo.id} className="flex items-center gap-4">
                    <Link
                      to={`/pokedex/pokemon/${evo.id}`}
                      className="group flex flex-col items-center rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 transition hover:-translate-y-1 hover:border-blue-500/60 hover:bg-slate-900"
                    >
                      <div className="flex h-20 w-20 items-center justify-center">
                        {evoSprite ? (
                          <img
                            src={evoSprite}
                            alt={evo.name}
                            className="h-20 w-20 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">PK</span>
                        )}
                      </div>

                      <span className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-blue-300">
                        {capitalizeWords(evo.name)}
                      </span>

                      <span className="text-xs text-slate-500">#{evo.id}</span>
                    </Link>

                    {index < evolutionPokemon.length - 1 ? (
                      <span className="text-2xl text-slate-500">→</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              No evolution data available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}