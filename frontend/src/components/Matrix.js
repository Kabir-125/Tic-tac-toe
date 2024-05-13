import { React, useEffect, useState } from "react";
import "./Matrix.css";

function DotDetailsCard({ stat, playColor, date }) {
  return (
    <div className="dotcard">
      <div className="cardDate">{date}</div>

      <div className="details-row">
        <div
          className="dot card"
          style={{
            backgroundColor: playColor,
          }}
        ></div>
        <span> Games Played {stat ? stat.played : "0"}</span>
      </div>

      <div className="details-row">
        <div className="won dot card"></div>
        <span>Won {stat ? (stat.won ? stat.won : "0") : "0"}</span>
      </div>

      <div className="details-row">
        <div className="lost dot card"></div>
        <span>Lost {stat ? (stat.lost ? stat.lost : "0") : "0"}</span>
      </div>

      <div className="details-row">
        <div className="draw dot card"></div>
        <span>Draw {stat ? (stat.draw ? stat.draw : "0") : "0"}</span>
      </div>
    </div>
  );
}

function Dot({ dayNumberOfTheYear, playersFullStatistics, maxGameDay, year }) {
  const dotDate = new Date(year, 0, 1);
  const lastdate = new Date(year, 11, 31);
  const [hovered, setHovered] = useState(false);
  dotDate.setDate(dotDate.getDate() + dayNumberOfTheYear);
  const dotDateString = `${dotDate.getFullYear()}-${
                         ("0" + (dotDate.getMonth() + 1) ).slice(-2)}-${
                         ("0" + dotDate.getDate()).slice(-2)}`;
  var val = 0;
  var color = "rgb(233, 233, 233)";
  var dotDetails;

  if (playersFullStatistics) {
    if (dotDate > lastdate) 
        return;
    if (maxGameDay === 0) 
        maxGameDay = 1;

    playersFullStatistics.forEach((day) => {
      if (day.date === dotDateString) {
        dotDetails = day;
        val = day.played / maxGameDay;
        if (day.played > 0) 
            color = `rgba(0, 100, 0, ${val})`;
      }
    });
  }

  return (
    <div
      className="dot"
      style={{ backgroundColor: color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <DotDetailsCard
          stat={dotDetails}
          playColor={color}
          date={dotDateString}
        />
      )}
    </div>
  );
}

function Matrix({ email }) {
  const [stat, setStat] = useState();
  const [maxPlayed, setMaxPlayed] = useState(0);
  const [years, setYears] = useState([2024]);
  const [curYear, setCurYear] = useState(2024);

  useEffect(() => {
    var playerYears = years;
    if (stat)
      stat.forEach((s) => {
        const year = parseInt(s.date.slice(0, 4));
        if (!playerYears.includes(year)) playerYears.push(year);
      });
    playerYears.sort();
    setYears(playerYears);
  }, [stat]);

  useEffect(() => {
    if (stat && stat.length > 0) {
      const statcur = stat.filter(
        (s) => parseInt(s.date.slice(0, 4)) === parseInt(curYear)
      );
      if (statcur) {
        const max = Math.max(...statcur.map((s) => s.played));
        setMaxPlayed(max);
      }
    }
  }, [stat, curYear]);

  useEffect(() => {
    if (email) {
      async function getstat() {
        await fetch("http://localhost:5000/api/gameDay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(data.error || "Network response was not ok");
              });
            }
            return response.json();
          })
          .then((data) => {
            if (data.error) {
              alert(data.error);
            } else {
              setStat(data);
              setCurYear(2024);
            }
          })
          .catch((error) => {
            console.error("There was a problem with the fetch operation:", error);
          });
      }
      getstat();
    }
  }, [email]);

  var rows = [], cols = [];
  for (let i = 0; i < 7; i++) 
    rows.push(i);
  for (let i = 0; i < 53; i++) 
    cols.push(i);

  return (
    <div className="performance">
      <div className="head">
        <span>Your Performance matrix in the year</span>
        <select onChange={(e) => setCurYear(e.target.value)} defaultValue={2024}>
          {years.map((year) => (
            <option value={parseInt(year)} key={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="months">
        <span className="month">Jan</span>
        <span className="month">Feb</span>
        <span className="month">Mar</span>
        <span className="month">Apr</span>
        <span className="month">May</span>
        <span className="month">Jun</span>
        <span className="month">Jul</span>
        <span className="month">Aug</span>
        <span className="month">Sep</span>
        <span className="month">Oct</span>
        <span className="month">Nov</span>
        <span className="month">Dec</span>
      </div>
      <div className="matrix">
        {rows.map((row) => (
          <div key={row} className="matrix-row">
            {cols.map((col) => (
              <Dot
                dayNumberOfTheYear={7 * col + row}
                playersFullStatistics={stat}
                maxGameDay={maxPlayed}
                year={curYear}
                key={col}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Matrix;
