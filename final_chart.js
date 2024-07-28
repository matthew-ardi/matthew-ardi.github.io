// Function to get query parameters
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(param => {
        const [key, value] = param.split("=");
        params[key] = decodeURIComponent(value);
    });
    return params;
}

const margin = {top: 50, right: 150, bottom: 50, left: 50},
      width = 1200 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleTime()
    .range([0, width]);

const y = d3.scaleLinear()
    .range([height, 0]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

const datasets = [
    {id: "dataset1", file: "less_high_school_over_25.json", label: "Less than High School Diploma"},
    {id: "dataset2", file: "high_school_no_college_over_25.json", label: "High School Graduates"},
    {id: "dataset3", file: "college_or_associate_over_25.json", label: "Some College or Associate Degree"}
];

function getAnnotation(x, y, svg) {
    // Add annotation for September 2008
    const annotations = [
        {
            note: { 
                title: "Great Recession", 
                lineType: "none", 
                align: "middle",
              },
              subject: {
                height: height,
                width: x(d3.timeParse("%Y-%b")("2009-Jun")) - x(d3.timeParse("%Y-%b")("2007-Dec"))
              },
              type: d3.annotationCalloutRect,
              y: 0,
              x: x(d3.timeParse("%Y-%b")("2007-Dec")),
              disable: ["connector"],
              dx: (x(d3.timeParse("%Y-%b")("2009-Jun")) - x(d3.timeParse("%Y-%b")("2007-Dec")))/2,
              data: { x: "12/1/2007"}
        },
        {
            note: { 
                title: "COVID-19", 
                lineType: "none", 
                align: "middle",
              },
              subject: {
                height: height,
                width: x(d3.timeParse("%Y-%b")("2022-Jul")) - x(d3.timeParse("%Y-%b")("2020-Mar"))
              },
              type: d3.annotationCalloutRect,
              y: 0,
              x: x(d3.timeParse("%Y-%b")("2020-Mar")),
              disable: ["connector"],
              dx: (x(d3.timeParse("%Y-%b")("2022-Jul")) - x(d3.timeParse("%Y-%b")("2020-Mar")))/2,
              data: { x: "03/1/2020"}
        }
    ];

    const makeAnnotations = d3.annotation()
    .annotations(annotations);

    svg.append("g")
    .attr("class", "annotation-group")
    .style("font-size", 12)
    .call(makeAnnotations);
}

Promise.all(datasets.map(d => d3.json(d.file)))
    .then(allData => {
        allData.forEach((data, i) => {
            datasets[i].data = data.map(d => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return months.map(month => ({
                    date: d3.timeParse("%Y-%b")(`${d.Year}-${month}`),
                    value: +d[month]
                }));
            }).flat();
        });

        x.domain(d3.extent(datasets.flatMap(d => d.data), d => d.date));
        y.domain([0, d3.max(datasets.flatMap(d => d.data), d => d.value)]);

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

        const lines = svg.selectAll(".line")
            .data(datasets)
            .enter().append("g")
            .attr("class", "line");

        lines.append("path")
            .attr("class", d => `line ${d.id}`)
            .attr("fill", "none")
            .attr("stroke", (d, i) => color(i))
            .attr("stroke-width", 1.5)
            .attr("d", d => line(d.data));
        
        // Add legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width}, 0)`);

        datasets.forEach((d, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", color(i));

            legendRow.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .attr("dy", "0.32em")
                .text(d.label);
        });

        getAnnotation(x, y, svg);

        lines.selectAll(".dot")
            .data(d => d.data)
            .enter().append("line")
            .attr("class", "dot")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.value))
            .attr("r", 3)
            .attr("fill", (d, i, nodes) => color(d3.select(nodes[i].parentNode).datum().index))
            .on("mouseover", (event, d) => {
                d3.select("#details-content").html(`<p><strong>Date:</strong> ${d3.timeFormat("%Y-%b")(d.date)}<br><strong>Unemployment Rate:</strong> ${d.value}%</p>`);
            })
            .on("mouseout", () => {
                d3.select("#details-content").html(`<p>Hover over the points on the chart to see detailed information about the unemployment rate for each date.</p>`);
            });

        // Handle checkbox changes
        d3.selectAll("#controls input").on("change", function() {
            const id = this.id;
            const checked = this.checked;

            svg.selectAll(`.${id}`)
                .style("display", checked ? null : "none");
        });

        
    });
