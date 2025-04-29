import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Home from "./pages/Home/Home.jsx";
import Stop from "./pages/Stop/Stop.jsx";
import StopDetails from "./pages/StopDetails/StopDetails.jsx";
import ListaBRTs from "./pages/ListaBRTs/ListaBRTs.jsx";  
import BRT from "./pages/BRT/BRT.jsx";
import ListaSemaforos from "./pages/TrafficLight/ListaSemaforos.jsx";
import TrafficLightDetails from "./pages/TrafficLightDetails/TrafficLightDetails.jsx";
import RegisterBus from './pages/RegisterBus/RegisterBus';
import EditBus from './pages/EditBus/EditBus';
import RegrasPage from "./pages/RegrasPage/RegrasPage.jsx";
import AddStop from "./pages/Stop/AddStop";
import RemoveStop from "./pages/Stop/RemoveStop";
import MonitorizarRisco from './pages/Stop/MonitorizarRisco.jsx';

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
        <Route path="/register-bus" element={<RegisterBus />} />
        <Route path="/edit-bus/:id" element={<EditBus />} />
        <Route path="/regras" element={<RegrasPage />} />
        <Route path="/stop/add" element={<AddStop />} />
        <Route path="/stop/remove" element={<RemoveStop />} />
        <Route path="/monitorizar-risco" element={<MonitorizarRisco />} />
      </Routes>
    </Router>
  );
}

export default App;
