import Detail from "./components/Detail";
import PlantList from "./components/PlantList";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlantList />} />
        <Route path="/plants" element={<PlantList />} />
        <Route path="/plants/:id" element={<Detail />} />
      </Routes>
    </Router>
    
  );
};

export default App;