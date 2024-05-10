import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faL, faMaskFace, faSpinner } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";
import cross from "../cross.png";
import circle from "../circle.png";
import Matrix from "./Matrix";
var socket = io.connect("http://localhost:5001");

function Cell({ value, onCellClick, isWin }) {
  return (
    <button
      className={`cell ${isWin ? "highlight" : ""}`}
      onClick={onCellClick}
    >
      {value === "X" ? (
        <img src={cross} height={80} width={80} alt="" />
      ) : value === "O" ? (
        <img src={circle} height={80} width={80} alt="" />
      ) : (
        value
      )}
    </button>
  );
}

function winner(cells) {
  const set = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < set.length; i++) {
    const [a, b, c] = set[i];
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      //winner, 3 winning cells
      return [cells[a], a, b, c];
    }
  }
  return [null];
}

export default function Game() {
  const [nextMoves, setNextmoves] = useState("O");
  const [cells, setCells] = useState(Array(9).fill(null));
  const [playerOnline, setPlayerOnline] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [playingAs, setPlayingAs] = useState();
  const [playerName, setPlayerName] = useState();
  const [opponentPLayer, setOpponentPlayer] = useState();
  const navigate = useNavigate();
  const [room, setRoom] = useState();
  const [gameId, setGameId] = useState();
  const jwtToken = localStorage.getItem("jwt") || "";
  const [gameOver, setGameover] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  var nextStatus;

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.verified !== "yes") {
            navigate("/");
          } else {
            setPlayerName(data.email);
          }
        } else {
          console.error("Error:", response.statusText);
          navigate("/");
        }
      } catch (error) {
        console.error("Error:", error);
        navigate("/");
      }
    };
    fetchGame();
  }, []);

  useEffect(() => {
    if (alertShown) {
      setAlertShown(false);
      setTimeout(() => {
        alert(alertMessage);
      }, 300);
    }
  }, [alertShown]);

  function logout() {
    localStorage.setItem("jwt", "");
    navigate("/");
  }

  function cellClick(i) {
    const res = winner(cells);

    if (res[0] || cells[i] || nextMoves !== playingAs) {
      //not a valid click
      return;
    }
    const nextCells = cells.slice();
    nextCells[i] = playingAs;
    setCells(nextCells);

    if (nextMoves === "X") {
      setNextmoves("O");
      socket.emit("move", { nextCells, nextMoves: "O", room });
    } else {
      setNextmoves("X");
      socket.emit("move", { nextCells, nextMoves: "X", room });
    }
  }

  function setEnd() {
    console.log("alertShown");
    setPlayerOnline(false);
    setOpponentPlayer(null);
    setPlayingAs(null);
    setGameStart(false);
    setRoom(null);
    setGameId(null);
    setNextmoves("O");
    setCells(Array(9).fill(null));
    setGameId("");
    socket.disconnect();
  }

  function playOnline() {
    setPlayerOnline(true);
    setGameover(false);
    socket = io.connect("http://localhost:5001");
    socket.emit("start", { playerName });
  }

  var result = winner(cells);
  var [gameWinner, cell1, cell2, cell3] = [...result];
  var gameEnd = true;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === null) gameEnd = false;
  }

  if (gameWinner) {
    nextStatus =
      "Winner: " + (gameWinner === playingAs ? playerName : opponentPLayer);
  } else if (gameEnd) {
    nextStatus = "Game over! Draw !!!";
  } else {
    nextStatus = (
      <div>
        Next player :&nbsp;
        {nextMoves === "X" ? (
          <img src={cross} height={20} width={20} alt="" />
        ) : (
          <img src={circle} height={20} width={20} alt="" />
        )}
      </div>
    );
  }

  if ((gameWinner || gameEnd) && !gameOver) {
    setGameover(true);
    console.log(gameEnd, gameWinner);
    setAlertMessage(nextStatus);
    setAlertShown(true);

    socket.emit("game_over", {
      id: gameId,
      room,
      player1: playerName,
      player2: opponentPLayer,
      winner: gameWinner
        ? gameWinner === playingAs
          ? playerName
          : opponentPLayer
        : "DRAW",
    });

    gameEnd = null;
    gameWinner = null;
    socket.disconnect();
    setTimeout(() => {
      setEnd();
    }, 1000);
  }

  socket.on("room_assigned", (data) => {
    console.log(data);
    setOpponentPlayer(data.opponent);
    setPlayingAs(data.playingAs);
    setGameStart(true);
    setRoom(data.room);
    setGameId(data.id);
  });

  socket.on("moveReply", (data) => {
    const newCells = data.nextCells;
    const newMove = data.nextMoves;
    setCells(newCells);
    setNextmoves(newMove);
  });

  socket.on("gone", () => {
    setAlertMessage("Opponent Gone !!!");
    setAlertShown(true);
    socket.disconnect();
    setEnd();
  });

  return (
    <div>
      <div className="navbar">
        <span className="title">Tic-Tac-Toe</span>
        <span className="username">
          {playerName}
          <br />
          <button className="logout" onClick={logout}>
            logout
          </button>
        </span>
      </div>

      <div className="home">
        <div className="game">
          {!playerOnline && (
            <div className="play">
              <button className="playonline" onClick={playOnline}>
                {"Play online"}
              </button>
            </div>
          )}

          {playerOnline && !gameStart && (
            <div className="loading">
              <FontAwesomeIcon icon={faSpinner} spin /> &emsp;
              {" Finding pair, Please wait ..."}
            </div>
          )}

          {playerOnline && gameStart && (
            <div>
              <div className="nextmove">{nextStatus}</div>

              <div className="playername">
                <div className={`player1 ${playingAs === nextMoves ? "turn" : ""}`} >
                  <div className={playingAs === "X" ? "crosssign" : "circlesign"} ></div>
                  <div>{playerName}</div>
                </div>

                <div className={`player2 ${playingAs !== nextMoves ? "turn" : ""}`} >
                  <div className={playingAs === "X" ? "circlesign" : "crosssign"} ></div>
                  <div>{opponentPLayer}</div>
                </div>
              </div>

              <div className="board">
                {[0, 1, 2].map((row) => (
                  <div className="board-row" key={row}>
                    {[0, 1, 2].map((col) => (
                      <Cell
                        key={col}
                        value={cells[row * 3 + col]}
                        onCellClick={() => cellClick(row * 3 + col)}
                        isWin={[cell1, cell2, cell3].includes(row * 3 + col)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="side-panel">
          <div className="performance_matrix">
            <Matrix email={playerName} />
          </div>
          <div className="stats">
            <button className="dash" onClick={() => navigate("/dashboard")}>
              {"Statistics Dashboard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
