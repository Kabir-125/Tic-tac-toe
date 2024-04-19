import { React, useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom'
import "./Game.css";

function Cell({value, onCellClick, isWin}){
  return (
    <button className={`cell ${isWin ? 'highlight' : ''}`}    onClick={onCellClick}> 
      {value}
    </button>
  );
}
function winner(cells){
  const set=[
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ]
  for (let i=0;i<set.length;i++){
    const [a,b,c] =set[i];
    if(cells[a] && cells[a] === cells[b] && cells[b] === cells[c]){
      return [cells[a],a,b,c];
    }
  }
  return [null];
}


export default function Game() {
  const [xMoves, setXmoves] = useState(true);
  const [cells, setCells] = useState(Array(9).fill(null));
  const [playerOnline,setPlayerOnline] = useState(false);
  const navigate =useNavigate();
    
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const jwttoken = localStorage.getItem('jwt')||'';
        const response = await fetch('http://localhost:5000/api/game', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwttoken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if(data.verified !=='yes'){
            navigate('/');
          }
        } else {
          console.error('Error:', response.statusText);
          navigate('/');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      }
    };
    fetchGame();
  }, []);

  function logout(){
    localStorage.setItem('jwt','');
    navigate('/');
  }

  function cellClick(i) {
    const res = winner(cells)
    if (res[0] || cells[i]) {
      return;
    }
    const nextCells = cells.slice();
    if (xMoves) {
      nextCells[i] = 'X';
    } else {
      nextCells[i] = 'O';
    }
    setCells(nextCells);
    setXmoves(!xMoves);
  }


  function restart(){
    const temp =Array(9).fill(null)
    setCells(temp);
    setXmoves(true);
  }

  var result = winner(cells);
  const [gameWinner,cell1,cell2,cell3] = [...result];
  var gameEnd=true;
  for(let i=0;i<cells.length;i++){
    if(cells[i] === null)
      gameEnd=false;
  }
  let status;

  if (gameWinner) {
    status = 'Winner: ' + gameWinner;
  } else if (gameEnd){
    status = "Game over! Draw !!!"
  }
  else {
    status = 'Next player: ' + (xMoves ? 'X' : 'O');
  }

  function playOnline() {
    setPlayerOnline(true);
    
  }


  return (
    <div> 

      <div className="navbar">
        <span className="title">Tic-Tac-Toe</span>
        <span className="username">Logged in as<br/> user<br/>
        <button className="logout" onClick={logout}>logout</button></span>
      </div>
      

      <div className="game">
          {!playerOnline && 
            <div className="play">
              <button className="playonline" onClick={playOnline}> Play online</button>
              </div>}

        {playerOnline && <div>
          <div className="nextmove">
            {(gameWinner||gameEnd) && <button className="restart" onClick={restart}> Restart Game </button>}<br/> 
            {status} 
          </div>

          <div className="playername">
            <span className="player1">Player_1</span>
            <span className="player2">Player_2</span>
          </div>

          <div className="board">
              
              {[0, 1, 2].map(row => (
                <div className="board-row" key={row}>
                  {[0, 1, 2].map(col => (
                    <Cell
                      key={col}
                      value={cells[row * 3 + col]}
                      onCellClick={() => cellClick(row * 3 + col)}
                      isWin = {[cell1,cell2,cell3].includes(row*3 + col)}
                    />
                  ))}
                </div>
              ))}
          </div>
        </div>}

      </div>
      
      
        
    </div>
      
  );
}