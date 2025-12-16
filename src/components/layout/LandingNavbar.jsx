import { NavLink } from "react-router-dom";
import snorlaxLogo from "../../assets/snorlax_logo.png";

export default function LandingNavbar() {
  const tabs = [
    { label: "Pokedex", to: "/pokedex" },
    { label: "Showdown", to: "/showdown" },
    { label: "Team Builder", to: "/team-builder" },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 border-b border-red-950 shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
      <div className="w-full flex items-center justify-between px-8 py-3">
        <NavLink to="/" className="flex items-center gap-3 h-16">
          <img
            src={snorlaxLogo}
            alt="Snorlax Logo"
            className="h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.7)]"
          />
          <span className="font-burger text-3xl text-yellow-200 tracking-wide drop-shadow-[0_0_6px_rgba(0,0,0,0.5)]">
            Poke Addicts
          </span>
        </NavLink>

        <nav className="flex items-center gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `
                px-5 py-2 rounded-full text-sm font-semibold transition
                ${isActive ? "bg-white/15 text-yellow-200" : "text-slate-100 hover:text-yellow-200 hover:bg-white/10"}
                `
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
