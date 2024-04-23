import { React, useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom'
import "./Game.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client'
import cross from '../cross.png'
import circle from '../circle.png'
const socket = io.connect('http://localhost:5001');
function Cell({value, onCellClick, isWin}){
  return (
    <button className={`cell ${isWin ? 'highlight' : ''}`}    onClick={onCellClick}> 
      {value === 'X' ?
      (<img src={cross} height={80} width={80} alt=''/>):
      value === 'O'?
      (<img src={circle} height={80} width={80} alt=''/>):
        value
      }
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
  const [nextMoves, setNextmoves] = useState('O');
  const [cells, setCells] = useState(Array(9).fill(null));
  const [playerOnline,setPlayerOnline] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [playingAs, setPlayingAs] =useState();
  const [playerName, setPlayerName] =useState();
  const [opponentPLayer, setOpponentPlayer] =useState();
  const navigate =useNavigate();
  const [room, setRoom] =useState();
    
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
          else{
            setPlayerName(data.email);
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
    if (res[0] || cells[i] || (nextMoves !==playingAs)) {
      return;
    }
    const nextCells = cells.slice();
    nextCells[i] = nextMoves;
    if (nextMoves==='X') {
      setNextmoves('O');
      socket.emit("move",{nextCells, nextMoves:'O', room})
    } else {
      setNextmoves('X');
      socket.emit("move",{nextCells, nextMoves:'X', room})
    }
    setCells(nextCells);
    
  }


  function restart(){
    const temp =Array(9).fill(null)
    setCells(temp);
    setNextmoves('O');
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
    status = (
      <div>
        Next player: 
        {nextMoves === 'X' ? (
          <img src={cross} height={20} width={20}  alt=''/>
        ) : (
          <img src={circle} height={20} width={20}  alt=''/>
        )}
      </div>
    );
  }

  function playOnline() {
    setPlayerOnline(true);
    socket.emit("start", {cells, playerName});
  }
  
  socket.on("room_assigned", (data)=>{
    
    setOpponentPlayer(data.opponent);
    setPlayingAs(data.playingAs);
    setGameStart(true);
    setRoom(data.room);
    
  })
  socket.on("moveReply",(data)=>{
    const newcells = data.nextCells;
    const nxMv = data.nextMoves
    setCells(newcells);
    setNextmoves(nxMv);
    console.log(playerName, opponentPLayer, room, playingAs);
  })

  return (
    <div> 

      <div className="navbar">
        <span className="title">Tic-Tac-Toe</span>
        <span className="username">Logged in as <button className="logout" onClick={logout}>logout</button><br/> {playerName}<br/>
        </span>
      </div>
      

      <div className="game">
          {!playerOnline && 
            <div className="play">
              <button className="playonline" onClick={playOnline}> Play online</button>
              </div>}
        {playerOnline && !gameStart &&
            <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin />
                    {" Finding pair, Please wait ..."}
              </div>}
        {playerOnline && gameStart && <div>
          <div className="nextmove">
            {(gameWinner||gameEnd) && <button className="restart" onClick={restart}> Restart Game </button>}<br/> 
            {status} 
          </div>
          
          <div className="playername">
            <div className="signs">
              <span className={`crosssign ${nextMoves === 'X'? 'turn':''}`}></span>
              <span className={`circlesign ${nextMoves === 'O'? 'turn':''}`}></span>
            </div>
            <div className="playernames">
              <span className={`player1 ${nextMoves === 'X'? 'turn':''}`}>{playingAs=== 'X' ? playerName: opponentPLayer}</span>
              <span className={`player2 ${nextMoves === 'O'? 'turn':''}`}>{playingAs=== 'O' ? playerName: opponentPLayer}</span>
            </div>
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