// src/pages/TeamBuilderPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";
import typeChart from "../data/types";

// import split components
import TeamDisplay from "../components/teamBuilder/TeamDisplay";
import PokemonPool from "../components/teamBuilder/PokemonPool";
import TeamAnalysis from "../components/teamBuilder/TeamAnalysis";

// initialise PokeAPI wrapper with caching
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

// limit to Kanto for now
const LIMIT = 151;

// max number of Pokémon in team
const MAX_TEAM_SIZE = 6;

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

  // state for all Pokémon fetched from API
  const [allPokemon, setAllPokemon] = useState([]);

  // current selected team
  const [team, setTeam] = useState([]);

  // toggle analysis panel
  const [showAnalysis, setShowAnalysis] = useState(false);

  // loading and error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // type chart data (gen 6)
  const typeData = typeChart[0].type_data;

  // fetch Pokémon data on mount
  useEffect(() => {
    let alive = true; // prevent state updates if component unmounts

    async function loadPokemonPool() {
      setLoading(true);
      setErrorMsg("");

      try {
        // fetch list of Pokémon
        const list = await P.getPokemonsList({
          offset: 0,
          limit: LIMIT,
        });

        // fetch detailed data for each Pokémon
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

      } catch (err) {
        if (!alive) return;

        // store error message
        setErrorMsg(err?.message || "Failed to load Pokémon.");

      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadPokemonPool();

    // cleanup function
    return () => {
      alive = false;
    };
  }, []);

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

  // add Pokémon to team (max 6, no duplicates)
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