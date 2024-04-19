import { React } from "react";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import "./App.css";
import Game from './components/Game';
import Login from './components/Login';
import Register from './components/Register';

export default function App() {
  
  return (
    <Router>
      <Routes>
      <Route path ='/' element={<Login/>}></Route>
      <Route path ='/register' element={<Register/>}></Route>
      <Route path ='/game' element={<Game/>}></Route>
          
      </Routes>
    </Router>
  );
}