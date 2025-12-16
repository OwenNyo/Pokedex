import { Outlet } from "react-router-dom";
import PokedexTabs from "../components/pokemon/PokedexTabs";

export default function PokedexPage() {
  return (
    <div className="w-full px-6 lg:px-16 py-8 space-y-6">
      {/* Title */}
      <div className="text-left space-y-2">
        <h1 className="font-burger text-4xl text-slate-100">Pokédex</h1>
        <p className="text-sm text-slate-300">
          Switch between Pokémon, moves, items and abilities.
        </p>
      </div>

      {/* Tabs */}
      <PokedexTabs />

      {/* Content */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
