// src/pages/HomePage.jsx
import pokemonImg from "../assets/pokemon.png";
import movesImg from "../assets/moves.png";
import itemsImg from "../assets/items.png";
import abilitiesImg from "../assets/abilities.png";

const sections = [
  {
    key: "pokemon",
    title: "Pokémon",
    description: "Browse all Pokémon, see base stats, types and sprites.",
    image: pokemonImg,
    badge: "Main",
    accent: "border-red-500/60 bg-red-500/10",
  },
  {
    key: "moves",
    title: "Moves",
    description: "Check move power, type, accuracy and learnsets.",
    image: movesImg,
    badge: "Battle",
    accent: "border-sky-500/60 bg-sky-500/10",
  },
  {
    key: "items",
    title: "Items",
    description: "Look up held items, potions and battle tools.",
    image: itemsImg,
    badge: "Support",
    accent: "border-amber-400/60 bg-amber-400/10",
  },
  {
    key: "abilities",
    title: "Abilities",
    description: "Understand passive abilities that change how battles play.",
    image: abilitiesImg,
    badge: "Passive",
    accent: "border-emerald-500/60 bg-emerald-500/10",
  },
];

export default function HomePage() {
  return (
    <div className="w-full space-y-10 px-6 lg:px-16 py-8">
      {/* Hero */}
      <section className="grid gap-10 lg:grid-cols-[3fr,2fr] items-start">
        {/* Left: title + quick search */}
        <div className="space-y-6 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-50">
            A clean, modern
            <span className="font-burger block text-red-400">Pokédex dashboard.</span>
          </h2>

          {/* Small memo */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Your not-so-official Smogon Universiuty for Pokémon, moves, items and abilities. But it's not Smogon University.
          </p>

          {/* Quick search */}
          <div className="mt-2 max-w-xl">
            <label className="font-burger block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Quick search
            </label>
            <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-3 py-2 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/70 transition">
              <input
                type="text"
                placeholder="Search a Pokémon by name or ID…"
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <span className="font-burger text-[11px] px-2 py-1 rounded-full bg-red-500 text-white font-medium">
                Soon
              </span>
            </div>
          </div>
        </div>

        {/* Right: Trainer Profile card, left-aligned in its column */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm rounded-[1.9rem] overflow-hidden bg-slate-950 border border-slate-800 shadow-xl shadow-red-900/50">
            {/* Top (red) */}
            <div className="h-24 bg-gradient-to-b from-red-600 to-red-700 flex items-center justify-center relative">
              <div className="absolute inset-x-0 bottom-[-18px] flex justify-center">
                <div className="h-9 w-9 rounded-full border-[6px] border-slate-900 bg-white shadow-md" />
              </div>
            </div>
            {/* Bottom */}
            <div className="bg-slate-900 pt-8 pb-4 px-5 text-left">
              <p className="font-burger text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">
                Trainer profile
              </p>
              <p className="text-sm text-slate-200">
                This panel can later show your favourites, last viewed Pokémon,
                and team ideas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sections grid */}
      <section className="space-y-3">
        <h3 className="font-burger text-lg font-semibold text-slate-100 text-center">
          What do you want to explore today?
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <div
              key={section.key}
              className={`group relative overflow-hidden rounded-2xl border bg-slate-900/90 backdrop-blur-sm px-4 py-4 text-left shadow-md hover:-translate-y-1 hover:shadow-xl transition ${section.accent}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-xl bg-slate-950/80 flex items-center justify-center border border-slate-700">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-burger text-sm font-semibold text-slate-50">
                      {section.title}
                    </h4>
                    <span className="font-burger text-[10px] px-2 py-[2px] rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 uppercase tracking-wide">
                      {section.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tap to focus this category later
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {section.description}
              </p>
              <div className="mt-3 text-[11px] text-red-300 group-hover:text-red-200 flex items-center gap-1">
                <span>Planned: open {section.title.toLowerCase()} view</span>
                <span className="translate-y-[1px]">›</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
