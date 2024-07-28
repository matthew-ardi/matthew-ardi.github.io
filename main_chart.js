// Function to get query parameters
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(param => {
        const [key, value] = param.split("=");
        params[key] = decodeURIComponent(value);
    });
    return params;
}

function getLastURISegment() {
    const pathArray = window.location.pathname.split('/');
    return pathArray[pathArray.length - 1];
}
const margin = {top: 50, right: 30, bottom: 30, left: 50},
          width = 1200 - margin.left - margin.right,
          height = 450 - margin.top - margin.bottom;
function getAnnotation(x, y, transformedData, svg, slide_name) {
    const annotations_slide_1 = [
        {
            note: {
                label: "The Fall of Lehman Brothers",
                title: "September 2008"
            },
            x: x(d3.timeParse("%Y-%b")("2008-Sep")),
            y: y(transformedData.find(d => d.date.getTime() === d3.timeParse("%Y-%b")("2008-Sep").getTime()).value),
            dy: -120,
            dx: -1,
        },
        {
            note: {
                label: "Financial Crisis",
                title: "2007- 2009"
            },
            x: x(d3.timeParse("%Y-%b")("2008-Sep")),
            y: y(transformedData.find(d => d.date.getTime() === d3.timeParse("%Y-%b")("2008-Sep").getTime()).value),
            dy: -200,
            dx: 50,
            subject: {
                radius: 80,
                radiusPadding: 2
            },
            type: d3.annotationCalloutCircle
        },
        {
            note: { 
                title: "Economic Recovery", 
                lineType: "none", 
                align: "middle",
              },
              subject: {
                height: height - margin.top - margin.bottom,
                width: x(d3.timeParse("%Y-%b")("2017-Mar")) - x(d3.timeParse("%Y-%b")("2009-Jun"))
              },
              type: d3.annotationCalloutRect,
              y: margin.top + 20,
              x: x(d3.timeParse("%Y-%b")("2009-Dec")),
              disable: ["connector"],
              dx: (x(d3.timeParse("%Y-%b")("2016-Mar")) - x(d3.timeParse("%Y-%b")("2009-Jun")))/2,
              data: { x: "06/1/2010"}
        }
    ];

    const annotations_slide_2 = [
        {
            note: {
                label: "China announced discovery a cluster of pneumonia cases",
                title: "Wuhan Outbreak"
            },
            x: x(d3.timeParse("%Y-%b")("2019-Dec")),
            y: y(transformedData.find(d => d.date.getTime() === d3.timeParse("%Y-%b")("2021-Dec").getTime()).value),
            dy: -50,
            dx: -50,
        },
        {
            note: {
                label: "Federal and State started imposing 'stay at home' Quarantine",
                title: "Stay At Home"
            },
            x: x(d3.timeParse("%Y-%b")("2020-Mar")),
            y: y(transformedData.find(d => d.date.getTime() === d3.timeParse("%Y-%b")("2020-Mar").getTime()).value),
            dy: -190,
            dx: -50,
        },
        {
            note: {
                label: "COVID-19 Quarantine resulted in massive layoffs nationwide",
                title: "Peak Unemployment Rate"
            },
            x: x(d3.timeParse("%Y-%b")("2020-Apr")),
            y: y(transformedData.find(d => d.date.getTime() === d3.timeParse("%Y-%b")("2020-Apr").getTime()).value),
            dy: 1,
            dx: 50,
        },
        {
            note: {
                label: "FDA issued Emergency Use Authorization of Pfizer vaccine",
                title: "COVID-19 vaccine"
            },
            x: x(d3.timeParse("%Y-%b")("2020-Dec")),
            y: y(transformedData.find(d => d.date.getTime() === d3.timeParse("%Y-%b")("2020-Dec").getTime()).value),
            dy: -30,
            dx: 50,
        },
        {
            note: {
                label: "Unemployment Rate fell below pre-pandemic level",
                title: "Quick Recovery"
            },
            x: x(d3.timeParse("%Y-%b")("2022-Feb")),
            y: y(transformedData.find(d => d.date.getTime() === d3.timeParse("%Y-%b")("2022-Feb").getTime()).value),
            dy: -40,
            dx: 50,
        },
    ]
    var annotations = [];
    if (slide_name === "index.html"){
        console.log("capturing slide 1 annotations")
        annotations = annotations_slide_1;
    } else if (slide_name === "slide2.html"){
        annotations = annotations_slide_2;
    }
    const makeAnnotations = d3.annotation()
    .annotations(annotations);

    svg.append("g")
    .attr("class", "annotation-group")
    .style("font-size", 12)
    .call(makeAnnotations);
}

function getHoverGuide(){
    d3.select("#details-content").html(`<i>Hover over the points on the chart to see detailed information about the unemployment rate for each month.</i>`);
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

    const slide_name = getLastURISegment();
    console.log("slide_name is " + slide_name);
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
    

    getAnnotation(x, y, transformedData, svg, slide_name);

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