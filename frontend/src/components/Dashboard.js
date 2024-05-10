import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom'
import UserGraph from "./UserGraph";
import Wingraph from "./Wingraph";
import GamesGraph from "./GamesGraph";
import './Dashboard.css'

export default function Dashboard(){

    const [userCntBy, setUsercntBy] = useState('country');
    const [gamesBy, setGamesBy] = useState('age');
    const [winBy, setWinBy] = useState('gender');
    const navigate =useNavigate();
    


    return (
        <div>
            <div className="navbar">
                <span className="title">Tic-Tac-Toe</span>
                
            </div>
            <div>
                <button className="back" onClick={()=>{navigate('/game');}}> Go back to Home page</button>
            </div>
            <div className="container">

                <div className="sec">
                    <span>
                        User count of this game by: 
                    </span>
                    <select onChange={(e) => setUsercntBy(e.target.value)} defaultValue={'country'}>
                        <option value='age'>age</option>
                        <option value='country'>country</option>
                        <option value='gender'>gender</option>
                    </select>
                </div>

                <UserGraph by={userCntBy} />


                <div className="sec">
                    <span>
                        Number of games played by: 
                    </span>
                    <select onChange={(e) => setGamesBy(e.target.value)} defaultValue={'age'}>
                        <option value='age'>age</option>
                        <option value='country'>country</option>
                        <option value='gender'>gender</option>
                    </select>
                </div>

                <GamesGraph by={gamesBy}/>


                <div className="sec">
                    <span>
                        Wining percentage by: 
                    </span>
                    <select onChange={(e) => setWinBy(e.target.value)} defaultValue={'gender'}>
                        <option value='age'>age</option>
                        <option value='country'>country</option>
                        <option value='gender'>gender</option>
                    </select>
                </div>

                <Wingraph by={winBy}/>


            </div>
        </div>
    );
}
