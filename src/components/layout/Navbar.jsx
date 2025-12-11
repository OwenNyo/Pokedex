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
    <header className="w-full bg-red-700 border-b border-red-900 shadow-md">
      <div className="w-full flex items-center justify-between px-8 py-3">
        {/* LEFT: Snorlax logo */}
        <div className="flex items-center h-16">
          <img
            src={snorlaxLogo}
            alt="Snorlax Logo"
            className="h-16 w-auto object-contain drop-shadow-[0_0_6px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* RIGHT: icons */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="
                flex flex-col items-center justify-center
                w-20 h-20
                bg-transparent
                hover:scale-105 transition
              "
              style={{ background: "transparent" }}
            >
              <img
                src={item.img}
                alt={item.label}
                className="h-10 w-10 object-contain"
              />
              <span className="text-[11px] mt-1 font-semibold text-black tracking-wide">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
