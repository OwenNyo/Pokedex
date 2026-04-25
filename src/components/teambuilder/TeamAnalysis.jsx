import normalIcon from "../../assets/normal_sym.png";
import fireIcon from "../../assets/fire_sym.png";
import waterIcon from "../../assets/water_sym.png";
import electricIcon from "../../assets/electric_sym.png";
import grassIcon from "../../assets/grass_sym.png";
import iceIcon from "../../assets/ice_sym.png";
import fightingIcon from "../../assets/fighting_sym.png";
import poisonIcon from "../../assets/poison_sym.png";
import groundIcon from "../../assets/ground_sym.png";
import flyingIcon from "../../assets/flying_sym.png";
import psychicIcon from "../../assets/psychic_sym.png";
import bugIcon from "../../assets/bug_sym.png";
import rockIcon from "../../assets/rock_sym.png";
import ghostIcon from "../../assets/ghost_sym.png";
import dragonIcon from "../../assets/dragon_sym.png";
import darkIcon from "../../assets/dark_sym.png";
import steelIcon from "../../assets/steel_sym.png";
import fairyIcon from "../../assets/fairy_sym.png";

const TYPE_ICONS = {
  normal: normalIcon,
  fire: fireIcon,
  water: waterIcon,
  electric: electricIcon,
  grass: grassIcon,
  ice: iceIcon,
  fighting: fightingIcon,
  poison: poisonIcon,
  ground: groundIcon,
  flying: flyingIcon,
  psychic: psychicIcon,
  bug: bugIcon,
  rock: rockIcon,
  ghost: ghostIcon,
  dragon: dragonIcon,
  dark: darkIcon,
  steel: steelIcon,
  fairy: fairyIcon,
};

const TYPE_STYLES = {
  normal: "bg-stone-500",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-600",
  ice: "bg-cyan-400",
  fighting: "bg-red-700",
  poison: "bg-purple-600",
  ground: "bg-amber-600",
  flying: "bg-sky-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-600",
  rock: "bg-yellow-700",
  ghost: "bg-violet-700",
  dragon: "bg-indigo-700",
  dark: "bg-slate-700",
  steel: "bg-zinc-500",
  fairy: "bg-pink-300",
};

export default function TeamAnalysis({
  defenseResults,
  coverageResults,
  maxTeamSize,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-4">
      <h2 className="mb-4 text-center text-xl font-bold text-slate-100">
        Team Analysis
      </h2>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnalysisSection
          title="Team Defense"
          results={defenseResults}
          mode="defense"
          maxTeamSize={maxTeamSize}
        />

        <AnalysisSection
          title="Coverage"
          results={coverageResults}
          mode="coverage"
          maxTeamSize={maxTeamSize}
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-400" />
          <span>Resistance / immunity / coverage</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-red-400" />
          <span>Weakness</span>
        </div>
      </div>
    </div>
  );
}

function AnalysisSection({ title, results, mode, maxTeamSize }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
      <h3 className="mb-3 text-center text-base font-bold text-slate-100">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {results.map((entry) => (
          <AnalysisItem
            key={entry.type}
            entry={entry}
            mode={mode}
            maxTeamSize={maxTeamSize}
          />
        ))}
      </div>
    </div>
  );
}

function AnalysisItem({ entry, mode, maxTeamSize }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/40 px-2 py-1.5"
      title={entry.type}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          TYPE_STYLES[entry.type] ?? "bg-slate-600"
        }`}
      >
        <img
          src={TYPE_ICONS[entry.type]}
          alt={entry.type}
          className="h-4 w-4 object-contain"
          loading="lazy"
        />
      </div>

      {mode === "defense" ? (
        <DefenseBars entry={entry} maxTeamSize={maxTeamSize} />
      ) : (
        <CoverageBars value={entry.strongHits} maxTeamSize={maxTeamSize} />
      )}
    </div>
  );
}

function DefenseBars({ entry, maxTeamSize }) {
  const weaknessCount = entry.weaknesses;
  const resistanceCount = entry.resists + entry.immunities;

  return (
    <div className="flex flex-1 gap-1">
      {Array.from({ length: maxTeamSize }).map((_, index) => {
        if (index < weaknessCount) {
          return (
            <div key={index} className="h-4 w-1.5 rounded-full bg-red-400" />
          );
        }

        if (index < weaknessCount + resistanceCount) {
          return (
            <div key={index} className="h-4 w-1.5 rounded-full bg-blue-400" />
          );
        }

        return (
          <div
            key={index}
            className="h-4 w-1.5 rounded-full bg-slate-700/60"
          />
        );
      })}
    </div>
  );
}

function CoverageBars({ value, maxTeamSize }) {
  return (
    <div className="flex flex-1 gap-1">
      {Array.from({ length: maxTeamSize }).map((_, index) => (
        <div
          key={index}
          className={`h-4 w-1.5 rounded-full ${
            index < value ? "bg-blue-400" : "bg-slate-700/60"
          }`}
        />
      ))}
    </div>
  );
}