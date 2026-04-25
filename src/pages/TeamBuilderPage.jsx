// src/pages/TeamBuilderPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";
import typeChart from "../data/types";

// import split components
import TeamDisplay from "../components/teambuilder/TeamDisplay";
import PokemonPool from "../components/teambuilder/PokemonPool";
import TeamAnalysis from "../components/teambuilder/TeamAnalysis";

// initialise PokeAPI wrapper with caching
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// max number of Pokémon in team
const MAX_TEAM_SIZE = 6;

// generation ID ranges
const GENERATIONS = [
  { value: 1, label: "Generation 1 - Kanto", start: 1, end: 151 },
  { value: 2, label: "Generation 2 - Johto", start: 152, end: 251 },
  { value: 3, label: "Generation 3 - Hoenn", start: 252, end: 386 },
  { value: 4, label: "Generation 4 - Sinnoh", start: 387, end: 493 },
  { value: 5, label: "Generation 5 - Unova", start: 494, end: 649 },
  { value: 6, label: "Generation 6 - Kalos", start: 650, end: 721 },
  { value: 7, label: "Generation 7 - Alola", start: 722, end: 809 },
  { value: 8, label: "Generation 8 - Galar", start: 810, end: 905 },
  { value: 9, label: "Generation 9 - Paldea", start: 906, end: 1025 },
];

// consistent order for type calculations
const TYPE_ORDER = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

// extract Pokémon ID from API URL
function getIdFromUrl(url) {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

// get sprite URL from ID
function getSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

// calculate how much damage a Pokémon takes from an attacking type
function getDefenseMultiplier(pokemonTypes, attackingType, typeData) {
  return pokemonTypes.reduce((multiplier, pokemonType) => {
    const chart = typeData[pokemonType];

    if (!chart) return multiplier;

    // immunity overrides everything
    if (chart.immune2.includes(attackingType)) return multiplier * 0;

    // resistance halves damage
    if (chart.resists.includes(attackingType)) return multiplier * 0.5;

    // weakness doubles damage
    if (chart.weak2.includes(attackingType)) return multiplier * 2;

    return multiplier;
  }, 1);
}

// calculate how effective a move type is against a defending type
function getCoverageMultiplier(moveType, defendingType, typeData) {
  const chart = typeData[defendingType];

  if (!chart) return 1;

  if (chart.immune2.includes(moveType)) return 0;
  if (chart.resists.includes(moveType)) return 0.5;
  if (chart.weak2.includes(moveType)) return 2;

  return 1;
}

// compute team defensive profile
function calculateTeamDefense(team, typeData) {
  return TYPE_ORDER.map((attackingType) => {
    let weaknesses = 0;
    let resists = 0;
    let immunities = 0;

    team.forEach((pokemon) => {
      const multiplier = getDefenseMultiplier(
        pokemon.types,
        attackingType,
        typeData
      );

      if (multiplier === 0) immunities += 1;
      else if (multiplier < 1) resists += 1;
      else if (multiplier > 1) weaknesses += 1;
    });

    return {
      type: attackingType,
      weaknesses,
      resists,
      immunities,
    };
  });
}

// compute team offensive coverage
function calculateTeamCoverage(team, typeData) {
  return TYPE_ORDER.map((defendingType) => {
    let strongHits = 0;

    team.forEach((pokemon) => {
      const hasSuperEffectiveType = pokemon.types.some(
        (moveType) =>
          getCoverageMultiplier(moveType, defendingType, typeData) > 1
      );

      if (hasSuperEffectiveType) strongHits += 1;
    });

    return {
      type: defendingType,
      strongHits,
    };
  });
}

export default function TeamBuilderPage() {
  // selected generation
  const [selectedGeneration, setSelectedGeneration] = useState(1);

  // state for all Pokémon fetched from API
  const [allPokemon, setAllPokemon] = useState([]);

  // current selected team
  const [team, setTeam] = useState([]);

  // toggle analysis panel
  const [showAnalysis, setShowAnalysis] = useState(false);

  // loading and error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // cache loaded generation data
  const [generationCache, setGenerationCache] = useState({});

  // type chart data
  const typeData = typeChart[0].type_data;

  // get selected generation data
  const currentGeneration = GENERATIONS.find(
    (generation) => generation.value === selectedGeneration
  );

  // fetch Pokémon data whenever generation changes
  useEffect(() => {
  let alive = true;

  async function loadPokemonPool() {
    setLoading(true);
    setErrorMsg("");
    setAllPokemon([]);
    setTeam([]);
    setShowAnalysis(false);

    // use cached generation if it was already loaded before
    if (generationCache[selectedGeneration]) {
      setAllPokemon(generationCache[selectedGeneration]);
      setLoading(false);
      return;
    }

    try {
      const offset = currentGeneration.start - 1;
      const limit = currentGeneration.end - currentGeneration.start + 1;

      const list = await P.getPokemonsList({
        offset,
        limit,
      });

      const details = await Promise.all(
        list.results.map(async (pokemon) => {
          const id = getIdFromUrl(pokemon.url);
          const detail = await P.getPokemonByName(pokemon.name);

          return {
            id,
            name: pokemon.name,
            sprite: getSprite(id),
            types: detail.types.map((entry) => entry.type.name),
          };
        })
      );

      if (!alive) return;

      setAllPokemon(details);

      // save generation into local page cache
      setGenerationCache((previousCache) => ({
        ...previousCache,
        [selectedGeneration]: details,
      }));
    } catch (err) {
      if (!alive) return;
      setErrorMsg(err?.message || "Failed to load Pokémon.");
    } finally {
      if (!alive) return;
      setLoading(false);
    }
  }

  loadPokemonPool();

  return () => {
    alive = false;
  };
  }, [selectedGeneration, currentGeneration]);

  // filter out Pokémon already in team
  const availablePokemon = useMemo(() => {
    const teamIds = new Set(team.map((pokemon) => pokemon.id));
    return allPokemon.filter((pokemon) => !teamIds.has(pokemon.id));
  }, [allPokemon, team]);

  // memoised defensive analysis
  const defenseResults = useMemo(() => {
    return calculateTeamDefense(team, typeData);
  }, [team, typeData]);

  // memoised coverage analysis
  const coverageResults = useMemo(() => {
    return calculateTeamCoverage(team, typeData);
  }, [team, typeData]);

  // add Pokémon to team
  function addToTeam(pokemon) {
    setTeam((currentTeam) => {
      if (currentTeam.length >= MAX_TEAM_SIZE) return currentTeam;

      const alreadySelected = currentTeam.some(
        (entry) => entry.id === pokemon.id
      );

      if (alreadySelected) return currentTeam;

      return [...currentTeam, pokemon];
    });
  }

  // remove Pokémon from team
  function removeFromTeam(pokemonId) {
    setTeam((currentTeam) =>
      currentTeam.filter((pokemon) => pokemon.id !== pokemonId)
    );
  }

  // clear entire team
  function clearTeam() {
    setTeam([]);
  }

  return (
    <section className="w-full px-6 lg:px-16 py-8 space-y-6 text-slate-100">
      {/* page header */}
      <div className="text-left space-y-2">
        <h1 className="font-burger text-4xl text-slate-100">Team Builder</h1>

        <p className="text-sm text-slate-300">
          Build a team of 6 Pokémon and analyse their type defense and coverage.
        </p>
      </div>

      {/* generation selector */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <label
          htmlFor="generation"
          className="text-sm font-semibold text-slate-300"
        >
          Choose generation:
        </label>

        <select
          id="generation"
          value={selectedGeneration}
          onChange={(event) => setSelectedGeneration(Number(event.target.value))}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition hover:border-blue-500 focus:border-blue-500"
        >
          {GENERATIONS.map((generation) => (
            <option key={generation.value} value={generation.value}>
              {generation.label}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-500">
          Showing #{currentGeneration.start} to #{currentGeneration.end}
        </span>
      </div>

      {/* error message */}
      {errorMsg ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-red-200">
          {errorMsg}
        </div>
      ) : null}

      {/* team display */}
      <TeamDisplay
        team={team}
        maxTeamSize={MAX_TEAM_SIZE}
        onRemove={removeFromTeam}
      />

      {/* controls */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={clearTeam}
          disabled={team.length === 0}
          className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900/60 disabled:opacity-40"
        >
          Clear Team
        </button>

        <button
          onClick={() => setShowAnalysis((value) => !value)}
          disabled={team.length === 0}
          className="rounded-xl border border-blue-700/50 bg-blue-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40"
        >
          {showAnalysis ? "Hide Team Analysis" : "Show Team Analysis"}
        </button>
      </div>

      {/* analysis panel */}
      {showAnalysis ? (
        <TeamAnalysis
          defenseResults={defenseResults}
          coverageResults={coverageResults}
          maxTeamSize={MAX_TEAM_SIZE}
        />
      ) : null}

      {/* pokemon selection pool */}
      <PokemonPool
        pokemon={availablePokemon}
        loading={loading}
        onAdd={addToTeam}
      />
    </section>
  );
}