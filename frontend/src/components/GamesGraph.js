import React, {useEffect, useState, useRef} from "react";
import * as d3 from "d3";

export default function GamesGraph (props){
    const [data,setData] = useState();
    const [filter,setFilter]=useState(props.graphFilter);
    const ref = useRef();

    useEffect(()=>{
        async function getdata(){
            const response = await fetch('http://localhost:5000/api/dbquery',{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                  },
                body:JSON.stringify({type:"game", filter: props.graphFilter})
            });

            if(response.ok){
                const res = await response.json();
                setData(res);
            }
        }
        setFilter(props.graphFilter)
        getdata();
    },[props]);

    

    useEffect(() => {
        if(!data)
            return;
        d3.select(ref.current).selectAll("*").remove();
        // set the dimensions and margins of the graph
        const margin = { top: 30, right: 30, bottom: 70, left: 60 },
          width = 760 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
    
        // append the svg object to the body of the page
        const svg = d3
          .select(ref.current)
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
    
        
          // X axis
          const x = d3
            .scaleBand()
            .range([0, width])
            .domain(data.map((d) => d[filter]))
            .padding(0.2);
          svg
            .append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
    
          // Add Y axis
          const y = d3.scaleLinear().domain([0, Math.max(...data.map(d =>d.count))]).range([height, 0]);
          svg.append("g").call(d3.axisLeft(y));
    
          // Bars
          svg
            .selectAll("barchart")
            .data(data)
            .join("rect")
            .attr("x", (d) => x(d[filter]))
            .attr("y", (d) => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.count))
            .attr("fill", "#007406");
      }, [data]);




    return (
        <svg height={'400px'} width={'760px' } id='barchart' ref={ref}> </svg>
    );
}