import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <Navbar />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
