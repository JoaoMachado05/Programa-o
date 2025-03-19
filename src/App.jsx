import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Home from "./pages/Home/Home.jsx";
import Stop from "./pages/Stop/Stop.jsx";
import StopDetails from "./pages/StopDetails/StopDetails.jsx";
import ListaBRTs from "./pages/ListaBRTs/ListaBRTs.jsx";  
import BRT from "./pages/BRT/BRT.jsx";
import ListaSemaforos from "./pages/TrafficLight/ListaSemaforos.jsx";
import TrafficLightDetails from "./pages/TrafficLightDetails/TrafficLightDetails.jsx";
import { useState, useEffect } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/home" element={isAuthenticated ? <Home setIsAuthenticated={setIsAuthenticated} /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/stop" element={isAuthenticated? <Stop /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/stops/:id" element={<StopDetails />} />
        <Route path="/brts" element={<ListaBRTs />} />
        <Route path="/brts/:id" element={<BRT />} /> 
        <Route path="/traffic-lights" element={<ListaSemaforos />} />
        <Route path="/traffic-light/:id" element={<TrafficLightDetails />} /> 
      </Routes>
    </Router>
  );
}

export default App;
