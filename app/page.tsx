import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Achievements from "./components/Achievements";
import FeaturedProject from "./components/FeaturedProject";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Achievements />
      <FeaturedProject />
      <Contact />
    </main>
  );
}

