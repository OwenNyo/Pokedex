import { NavLink } from "react-router-dom";
import pokemonImg from "../../assets/pokemon.png";
import movesImg from "../../assets/moves.png";
import itemsImg from "../../assets/items.png";
import abilitiesImg from "../../assets/abilities.png";

function Tab({ to, label, img }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div
          className={`
            font-burger group relative flex flex-col items-center justify-center
            w-20 h-20 rounded-2xl transition-all duration-200
            ${isActive
              ? "bg-red-900/35 ring-2 ring-yellow-300/70 ring-offset-2 ring-offset-slate-950"
              : "hover:bg-red-900/35"}
          `}
        >
          <img src={img} alt={label} className="h-8 w-8" />
          <span className={`${isActive ? "text-yellow-200" : "text-white"} text-xs mt-1`}>
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

export default function PokedexTabs() {
  return (
    <div className="flex items-center gap-4">
      <Tab to="/pokedex/pokemon" label="Pokémon" img={pokemonImg} />
      <Tab to="/pokedex/moves" label="Moves" img={movesImg} />
      <Tab to="/pokedex/items" label="Items" img={itemsImg} />
      <Tab to="/pokedex/abilities" label="Abilities" img={abilitiesImg} />
    </div>
  );
}
