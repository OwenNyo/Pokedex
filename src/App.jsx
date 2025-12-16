import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingLayout from "./components/layout/LandingLayout";
import PokedexPage from "./pages/PokedexPage";
import HomePage from "./pages/HomePage";
import TeamBuilderPage from "./pages/TeamBuilderPage";

import PokemonTab from "./components/pokemon/PokemonTab";
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
            <Route path="moves" element={<MovesTab />} />
            <Route path="items" element={<ItemsTab />} />
            <Route path="abilities" element={<AbilitiesTab />} />
          </Route>

          {/* Teambuilder */}
          <Route path="/team-builder" element={<TeamBuilderPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LandingLayout>
    </BrowserRouter>
  );
}
