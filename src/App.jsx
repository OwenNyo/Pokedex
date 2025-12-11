import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}

export default App;