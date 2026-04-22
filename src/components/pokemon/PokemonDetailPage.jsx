// src/pages/PokemonDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pokedex } from "pokeapi-js-wrapper";

// Shared API client
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// Mapping Pokémon types to UI styles
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

// Capitalize API names like "special-attack" → "Special Attack"
function capitalizeWords(text) {
  if (!text) return text;
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Convert API stat names into cleaner display labels
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

// Return color gradient based on stat strength
function getStatBarClass(value) {
  if (value < 40) return "bg-gradient-to-r from-red-600 to-red-400";
  if (value < 70) return "bg-gradient-to-r from-orange-500 to-yellow-400";
  if (value < 100) return "bg-gradient-to-r from-yellow-400 to-amber-300";
  if (value < 130) return "bg-gradient-to-r from-lime-500 to-green-400";
  return "bg-gradient-to-r from-emerald-500 to-teal-400";
}

// Get styling for a Pokémon type
function getTypeClass(typeName) {
  return TYPE_STYLES[typeName] ?? "bg-slate-700 text-white";
}

// Recursively extract all evolution names from evolution tree
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

  // ---------- Data State ----------
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutionPokemon, setEvolutionPokemon] = useState([]);

  // ---------- UI State ----------
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
        // 1. Fetch main Pokémon data
        const pokemonRes = await P.getPokemonByName(id);
        if (!alive) return;
        setPokemon(pokemonRes);

        // 2. Fetch species (needed for evolution chain)
        const speciesRes = await fetch(pokemonRes.species.url).then((r) => {
          if (!r.ok) throw new Error("Failed to load Pokémon species.");
          return r.json();
        });

        if (!alive) return;
        setSpecies(speciesRes);

        // 3. Fetch evolution chain
        if (speciesRes.evolution_chain?.url) {
          const evolutionRes = await fetch(speciesRes.evolution_chain.url).then((r) => {
            if (!r.ok) throw new Error("Failed to load evolution chain.");
            return r.json();
          });

          if (!alive) return;

          // Flatten evolution tree into list
          const names = extractEvolutionNames(evolutionRes.chain, []);

          // Fetch each evolution's details (for sprite + id)
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
      alive = false; // prevent state update after unmount
    };
  }, [id]);

  // Choose best available sprite
  const artwork = useMemo(() => {
    return (
      pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon?.sprites?.front_default ||
      null
    );
  }, [pokemon]);

  // ---------- Loading / Error ----------
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
      {/* Navigation */}
      <div className="mb-5">
        <Link to="/pokedex/pokemon" className="...">
          ← Back to Pokémon
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-6">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Artwork */}
          <div className="flex h-44 w-44 items-center justify-center">
            {artwork ? (
              <img src={artwork} alt={pokemon.name} />
            ) : (
              <div>PK</div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold">
                {capitalizeWords(pokemon.name)}
              </h1>
              <p className="text-2xl text-slate-400">#{pokemon.id}</p>
            </div>

            {/* Types */}
            <div>
              <h2>Types</h2>
              <div className="flex gap-2">
                {pokemon.types.map((entry) => (
                  <span
                    key={entry.type.name}
                    className={getTypeClass(entry.type.name)}
                  >
                    {capitalizeWords(entry.type.name)}
                  </span>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div>
              <h2>Abilities</h2>
              <div className="flex gap-2">
                {pokemon.abilities.map((entry) => (
                  <span key={entry.ability.name}>
                    {capitalizeWords(entry.ability.name)}
                    {entry.is_hidden ? " (Hidden)" : " (Base)"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <h2>Stats</h2>

          {pokemon.stats.map((entry) => {
            const value = entry.base_stat;
            const widthPercent = Math.min((value / 180) * 100, 100);

            return (
              <div key={entry.stat.name}>
                {/* Stat label + value */}
                <div>
                  {formatStatName(entry.stat.name)} — {value}
                </div>

                {/* Stat bar */}
                <div className="bg-slate-800">
                  <div
                    className={getStatBarClass(value)}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Evolution */}
        <div className="mt-8">
          <h2>Evolution Line</h2>

          {evolutionLoading ? (
            <div>Loading evolutions...</div>
          ) : evolutionPokemon.length > 0 ? (
            <div className="flex gap-4">
              {evolutionPokemon.map((evo, index) => (
                <div key={evo.id}>
                  <Link to={`/pokedex/pokemon/${evo.id}`}>
                    {capitalizeWords(evo.name)}
                  </Link>

                  {/* Arrow between evolutions */}
                  {index < evolutionPokemon.length - 1 && " → "}
                </div>
              ))}
            </div>
          ) : (
            <div>No evolution data available.</div>
          )}
        </div>
      </div>
    </section>
  );
}