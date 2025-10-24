import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Statistics from "./pages/Statistics";

function App() {
  return (
    <Router>
      <Header />
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
    </Router>
  );
}

export default App;
