import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Statistics from "./pages/Statistics";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Header />
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/stats" element={<Statistics />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
