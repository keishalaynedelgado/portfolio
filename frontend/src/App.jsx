import Intro from "./components/Intro/Intro";
import Cursor from "./components/Cursor/Cursor";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Marquee from "./components/Marquee/Marquee";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import Skills from "./components/Skills/Skills";
import Leadership from "./components/Leadership/Leadership";
import Certificates from "./components/Certificates/Certificates";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";

const marqueeFront = [
  "Web Development",
  "Test Automation",
  "AI-Powered Applications",
  "React.js",
  "Python",
  "Node.js",
];

const marqueeBack = [
  "Computer Science",
  "XU – Ateneo de Cagayan",
  "GDSC",
  "DEVCON Cagayan de Oro",
  "Playwright",
  "PostgreSQL",
];

export default function App() {
  return (
    <>
      <Cursor />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Intro />
        <Hero />
        <Marquee items={marqueeFront} altItems={marqueeBack} />
        <About />
        <Projects />
        <Skills />
        <Leadership />
        <Certificates />
        <div className="page-gap" aria-hidden="true" />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
