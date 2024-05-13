import { React, StrictMode } from "react";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import "./App.css";
import "./logo.svg"
import Game from "./components/Game";
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <StrictMode>
      <Router>
        <Routes>
          <Route path ='/' element={<Login/>}></Route>
          <Route path ='/register' element={<Register/>}></Route>
          <Route path ='/game' element={<Game/>}></Route>
          <Route path ='/dashboard' element={<Dashboard/>}></Route>
        </Routes>
      </Router>
    </StrictMode>
  );
}