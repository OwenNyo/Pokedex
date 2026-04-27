// src/pages/EggBreedingPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Pokedex } from "pokeapi-js-wrapper";

// initialise PokeAPI wrapper with caching
const P = new Pokedex({
  cache: true,
  timeout: 10_000,
});

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

// extract Pokémon ID from API URL
function getIdFromUrl(url) {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

// get sprite URL from ID
function getSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

// capitalise API names
function capitalizeWords(text) {
  if (!text) return text;

  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// check if Pokémon has a specific egg group
function hasEggGroup(pokemon, groupName) {
  return pokemon.eggGroups.includes(groupName);
}

// check if two Pokémon share at least one egg group
function shareEggGroup(firstPokemon, secondPokemon) {
  return firstPokemon.eggGroups.some((group) =>
    secondPokemon.eggGroups.includes(group)
  );
}

// check if Pokémon can be male
function canBeMale(pokemon) {
  return pokemon.genderRate !== -1 && pokemon.genderRate !== 8;
}

// check if Pokémon can be female
function canBeFemale(pokemon) {
  return pokemon.genderRate !== -1 && pokemon.genderRate !== 0;
}

// check if opposite gender pairing is possible
function canBeOppositeGender(firstPokemon, secondPokemon) {
  return (
    (canBeMale(firstPokemon) && canBeFemale(secondPokemon)) ||
    (canBeFemale(firstPokemon) && canBeMale(secondPokemon))
  );
}

// calculate breeding compatibility
function getBreedingResult(firstPokemon, secondPokemon, originalTrainer) {
  if (!firstPokemon || !secondPokemon) return null;

  const firstIsDitto = hasEggGroup(firstPokemon, "ditto");
  const secondIsDitto = hasEggGroup(secondPokemon, "ditto");

  const firstNoEggs = hasEggGroup(firstPokemon, "no-eggs");
  const secondNoEggs = hasEggGroup(secondPokemon, "no-eggs");

  const sameSpecies = firstPokemon.name === secondPokemon.name;
  const differentTrainer = originalTrainer === "different";

  let compatible = false;
  let reason = "";

  if (firstNoEggs || secondNoEggs) {
    compatible = false;
    reason = "One or both Pokémon are in the No Eggs group.";
  } else if (firstIsDitto && secondIsDitto) {
    compatible = false;
    reason = "Two Ditto cannot breed together.";
  } else if (firstIsDitto || secondIsDitto) {
    compatible = true;
    reason = "One Pokémon is Ditto, so breeding is possible.";
  } else if (!shareEggGroup(firstPokemon, secondPokemon)) {
    compatible = false;
    reason = "They do not share an Egg Group.";
  } else if (!canBeOppositeGender(firstPokemon, secondPokemon)) {
    compatible = false;
    reason = "They do not have a possible opposite-gender pairing.";
  } else {
    compatible = true;
    reason = "They share an Egg Group and can breed.";
  }

  if (!compatible) {
    return {
      compatible: false,
      summary: "Not compatible",
      chance: 0,
      ovalCharmChance: 0,
      quote:
        "The two prefer to play with other Pokémon more than with each other.",
      reason,
    };
  }

  if (sameSpecies && differentTrainer) {
    return {
      compatible: true,
      summary: "Highly compatible",
      chance: 70,
      ovalCharmChance: 88,
      quote: "The two seem to get along very well!",
      reason,
    };
  }

  if (sameSpecies && !differentTrainer) {
    return {
      compatible: true,
      summary: "Compatible",
      chance: 50,
      ovalCharmChance: 80,
      quote: "The two seem to get along.",
      reason,
    };
  }

  if (!sameSpecies && differentTrainer) {
    return {
      compatible: true,
      summary: "Compatible",
      chance: 50,
      ovalCharmChance: 80,
      quote: "The two seem to get along.",
      reason,
    };
  }

  return {
    compatible: true,
    summary: "Low compatibility",
    chance: 20,
    ovalCharmChance: 40,
    quote: "The two don't really seem to like each other very much.",
    reason,
  };
}

export default function EggBreedingPage() {
  // selected generation
  const [selectedGeneration, setSelectedGeneration] = useState(1);

  // Pokémon pool and cache
  const [pokemonPool, setPokemonPool] = useState([]);
  const [generationCache, setGenerationCache] = useState({});

  // selected Pokémon slots
  const [firstPokemon, setFirstPokemon] = useState(null);
  const [secondPokemon, setSecondPokemon] = useState(null);

  // slot currently being filled
  const [activeSlot, setActiveSlot] = useState("first");

  // same or different original trainer
  const [originalTrainer, setOriginalTrainer] = useState("different");

  // loading and error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // get selected generation data
  const currentGeneration = GENERATIONS.find(
    (generation) => generation.value === selectedGeneration
  );

  // fetch Pokémon when generation changes
  useEffect(() => {
    let alive = true;

    async function loadGenerationPokemon() {
      setLoading(true);
      setErrorMsg("");
      setPokemonPool([]);

      // use cached generation if already loaded
      if (generationCache[selectedGeneration]) {
        setPokemonPool(generationCache[selectedGeneration]);
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

        // fetch Pokémon details and species data for egg groups
        const details = await Promise.all(
          list.results.map(async (pokemon) => {
            const id = getIdFromUrl(pokemon.url);
            const detail = await P.getPokemonByName(pokemon.name);

            const species = await fetch(detail.species.url).then((res) => {
              if (!res.ok) throw new Error("Failed to load Pokémon species.");
              return res.json();
            });

            return {
              id,
              name: pokemon.name,
              sprite: getSprite(id),
              eggGroups: species.egg_groups.map((group) => group.name),
              genderRate: species.gender_rate,
            };
          })
        );

        if (!alive) return;

        setPokemonPool(details);

        // cache loaded generation
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

    loadGenerationPokemon();

    return () => {
      alive = false;
    };
  }, [selectedGeneration, currentGeneration]);

  // hide selected Pokémon from pool
  const availablePokemon = useMemo(() => {
    return pokemonPool;
  }, [pokemonPool]);

  // calculate result when both Pokémon are selected
  const result = useMemo(() => {
    return getBreedingResult(firstPokemon, secondPokemon, originalTrainer);
  }, [firstPokemon, secondPokemon, originalTrainer]);

  // add Pokémon to selected slot
  function selectPokemon(pokemon) {
    if (activeSlot === "first") {
      setFirstPokemon(pokemon);
      setActiveSlot("second");
      return;
    }

    setSecondPokemon(pokemon);
    setActiveSlot("first");
  }

  // remove Pokémon from selected slot
  function removeSelectedPokemon(slot) {
    if (slot === "first") {
      setFirstPokemon(null);
      setActiveSlot("first");
      return;
    }

    setSecondPokemon(null);
    setActiveSlot("second");
  }

  // clear both selected Pokémon
  function clearSelection() {
    setFirstPokemon(null);
    setSecondPokemon(null);
    setActiveSlot("first");
  }

  return (
    <section className="w-full space-y-6 px-6 py-8 text-slate-100 lg:px-16">
      {/* page header */}
      <div className="space-y-2 text-left">
        <h1 className="font-burger text-4xl text-slate-100">Egg Breeding</h1>

        <p className="text-sm text-slate-300">
          Select two Pokémon to check if they can breed and view their Day-Care
          compatibility quote.
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
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition hover:border-pink-500 focus:border-pink-500"
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

      {/* selected Pokémon slots */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
        <h2 className="mb-5 text-2xl font-bold text-pink-300">
          Selected Pokémon
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectedPokemonSlot
            title="Pokémon 1"
            pokemon={firstPokemon}
            active={activeSlot === "first"}
            onSelectSlot={() => setActiveSlot("first")}
            onRemove={() => removeSelectedPokemon("first")}
          />

          <SelectedPokemonSlot
            title="Pokémon 2"
            pokemon={secondPokemon}
            active={activeSlot === "second"}
            onSelectSlot={() => setActiveSlot("second")}
            onRemove={() => removeSelectedPokemon("second")}
          />
        </div>
      </div>

      {/* original trainer selector */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <label
          htmlFor="original-trainer"
          className="text-sm font-semibold text-slate-300"
        >
          Original Trainer:
        </label>

        <select
          id="original-trainer"
          value={originalTrainer}
          onChange={(event) => setOriginalTrainer(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition hover:border-pink-500 focus:border-pink-500"
        >
          <option value="different">Different Original Trainers</option>
          <option value="same">Same Original Trainer</option>
        </select>
      </div>

      {/* breeding result shows directly once two Pokémon are selected */}
      {result ? <BreedingResultCard result={result} /> : null}

      {/* clear button */}
      <div className="flex justify-center">
        <button
          onClick={clearSelection}
          disabled={!firstPokemon && !secondPokemon}
          className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900/60 disabled:opacity-40"
        >
          Clear Selection
        </button>
      </div>

      {/* Pokémon pool */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-pink-300">Your Options</h2>

          <p className="text-xs text-slate-400">
            Selecting for:{" "}
            <span className="font-semibold text-pink-300">
              {activeSlot === "first" ? "Pokémon 1" : "Pokémon 2"}
            </span>
          </p>
        </div>

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
            {availablePokemon.map((pokemon) => (
              <button
                key={pokemon.id}
                onClick={() => selectPokemon(pokemon)}
                className="flex h-20 items-center justify-center rounded-xl bg-slate-900/50 p-2 transition hover:-translate-y-1 hover:bg-slate-800/70"
                title={capitalizeWords(pokemon.name)}
              >
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="h-14 w-14 object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SelectedPokemonSlot({
  title,
  pokemon,
  active,
  onSelectSlot,
  onRemove,
}) {
  return (
    <button
      onClick={pokemon ? onRemove : onSelectSlot}
      className={`flex min-h-40 flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
        active
          ? "border-pink-500/60 bg-pink-500/10"
          : "border-slate-800 bg-slate-950/30 hover:bg-slate-950/50"
      }`}
    >
      {pokemon ? (
        <>
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="h-20 w-20 object-contain"
            loading="lazy"
          />

          <div className="mt-3 font-semibold text-slate-100">
            {capitalizeWords(pokemon.name)}
          </div>

          <div className="mt-1 text-xs text-slate-400">Click to remove</div>

          <div className="mt-2 text-xs text-slate-500">
            {pokemon.eggGroups.map((group) => capitalizeWords(group)).join(", ")}
          </div>
        </>
      ) : (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-900/60 text-2xl">
            ?
          </div>

          <div className="mt-3 rounded-xl bg-slate-800/60 px-6 py-2 text-slate-400">
            {title}
          </div>

          <div className="mt-2 text-xs text-slate-500">Click to select slot</div>
        </>
      )}
    </button>
  );
}

function BreedingResultCard({ result }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <h2 className="mb-5 text-2xl font-bold text-pink-300">
        Breeding Result
      </h2>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr,2fr]">
        <div
          className={`rounded-xl border p-4 ${
            result.compatible
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-red-500/40 bg-red-500/10"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Compatibility
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-100">
            {result.summary}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Egg Chance
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-100">
            {result.chance}%
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {result.ovalCharmChance}% with Oval Charm
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Day-Care Quote
          </p>

          <p className="mt-1 text-sm text-slate-100">“{result.quote}”</p>

          <p className="mt-3 text-xs text-slate-400">{result.reason}</p>
        </div>
      </div>
    </div>
  );
}