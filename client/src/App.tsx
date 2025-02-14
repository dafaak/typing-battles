
import './App.css'
import { Loby } from './pages/Loby';
import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/loby" element={<Loby />} />
    </Routes >
  )
}

export default App
