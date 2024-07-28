// Function to get query parameters
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(param => {
        const [key, value] = param.split("=");
        params[key] = decodeURIComponent(value);
    });
    return params;
}

function getHoverGuide(){
    d3.select("#details-content").html(`<p>Hover over the points on the chart to see detailed information about the unemployment rate for each date.</p>`);
}
// Get the file name from query parameters
const params = getQueryParams();
const fileName = params.file || 'less_high_school_over_25.json';  // Default file if not provided


d3.json(fileName).then(data => {
    // Transform the data to the desired format
    // const transformedData = data.map(d => ({
    //     year: d3.timeParse("%Y")(d.Year),
    //     value: +d.Apr // Change this to the desired month or calculate the average
    // }));
    getHoverGuide()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const transformedData = [];
    data.forEach(d => {
        months.forEach(month => {
            transformedData.push({
                date: d3.timeParse("%Y-%b")(`${d.Year}-${month}`),
                value: +d[month]
            });
        });
    });

    const margin = {top: 50, right: 30, bottom: 30, left: 50},
          width = 1000 - margin.left - margin.right,
          height = 450 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(transformedData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(transformedData, d => d.value)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2)
        .attr("y", margin.bottom)
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .text("Unemployment Rate (%)");

    svg.append("path")
        .datum(transformedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value)));

    svg.selectAll(".dot")
        .data(transformedData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .on("mouseover", (event, d) => {
            d3.select("#details-content").html(`<p><strong>Date:</strong> ${d3.timeFormat("%Y-%b")(d.date)}<br><strong>Unemployment Rate:</strong> ${d.value}%</p>`);
        })
        .on("mouseout", () => {
            getHoverGuide()    
        })
        ;
});