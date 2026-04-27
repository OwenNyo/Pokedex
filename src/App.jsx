import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingLayout from "./components/layout/LandingLayout";
import PokedexPage from "./pages/PokedexPage";
import HomePage from "./pages/HomePage";
import TeamBuilderPage from "./pages/TeamBuilderPage";
import EggBreedingPage from "./pages/EggBreedingPage";

import PokemonTab from "./components/pokemon/PokemonTab";
import PokemonDetailPage from "./components/pokemon/PokemonDetailPage";
import MovesTab from "./components/pokemon/MovesTab";
import ItemsTab from "./components/pokemon/ItemsTab";
import AbilitiesTab from "./components/pokemon/AbilitiesTab";


export default function App() {
  return (
    <BrowserRouter>
      <LandingLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Pokedex with nested tabs */}
          <Route path="/pokedex" element={<PokedexPage />}>
            <Route index element={<Navigate to="pokemon" replace />} />
            <Route path="pokemon" element={<PokemonTab />} />
            <Route path="pokemon/:id" element={<PokemonDetailPage />} />
            <Route path="moves" element={<MovesTab />} />
            <Route path="items" element={<ItemsTab />} />
            <Route path="abilities" element={<AbilitiesTab />} />
          </Route>

          {/* Egg Breeding */}
          <Route path="/egg-breeding" element={<EggBreedingPage />} />

          {/* Teambuilder */}
          <Route path="/team-builder" element={<TeamBuilderPage />} />

          
        </Routes>
      </LandingLayout>
    </BrowserRouter>
  );
}
