// src/components/layout/Navbar.jsx
import snorlaxLogo from "../../assets/snorlax_logo.png";
import pokemonImg from "../../assets/pokemon.png";
import movesImg from "../../assets/moves.png";
import itemsImg from "../../assets/items.png";
import abilitiesImg from "../../assets/abilities.png";

export default function Navbar() {
  const navItems = [
    { label: "Pokémon", img: pokemonImg },
    { label: "Moves", img: movesImg },
    { label: "Items", img: itemsImg },
    { label: "Abilities", img: abilitiesImg },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 border-b border-red-950 shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
      <div className="w-full flex items-center justify-between px-8 py-3">
        {/* LEFT: Snorlax logo + title */}
        <div className="flex items-center gap-3 h-16">
          <img
            src={snorlaxLogo}
            alt="Snorlax Logo"
            className="h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.7)] hover:scale-105 hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.4)] transition-transform duration-200"
          />
          <span className="font-burger text-3xl text-yellow-200 drop-shadow-[0_0_6px_rgba(0,0,0,0.5)] tracking-wide ">
            Poke Addicts
          </span>
        </div>

        {/* RIGHT: interactive nav icons */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="
                font-burger
                group relative
                flex flex-col items-center justify-center
                w-20 h-20
                rounded-2xl
                bg-transparent
                hover:bg-red-900/35
                hover:ring-2 hover:ring-yellow-300/70 hover:ring-offset-2 hover:ring-offset-red-800
                transition-all duration-200 ease-out
              "
              style={{ background: "transparent" }}
            >
              {/* Icon */}
              <img
                src={item.img}
                alt={item.label}
                className="
                  h-10 w-10 object-contain
                  drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]
                  transition-transform duration-200
                  group-hover:scale-110
                  group-hover:-translate-y-1
                  group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.85)]
                "
              />

              {/* Label */}
              <span
                className="
                  text-[11px] mt-1 font-semibold tracking-wide text-black
                  transition-all duration-200 uppercase
                  group-hover:text-yellow-200
                  group-hover:tracking-[0.2em]
                "
              >
                {item.label}
              </span>

              {/* Energy bar / indicator */}
              <span
                className="
                  pointer-events-none
                  absolute bottom-1
                  h-[3px] w-0
                  rounded-full bg-yellow-300
                  shadow-[0_0_10px_rgba(250,204,21,0.8)]
                  transition-all duration-200
                  group-hover:w-10
                "
              />
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
