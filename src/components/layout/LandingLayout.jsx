import LandingNavbar from "./LandingNavbar";

export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <LandingNavbar />
      <main className="w-full">{children}</main>
    </div>
  );
}
