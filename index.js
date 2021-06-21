// TODO:
// Dynamically resize graph
// Dynamically resize text
// Change tick count as graph shrinks

let usData;
let usStatesData;

let selectedYear;
let selectedCases;
let selectedDeaths;

Promise.all([
    d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv"),
    d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv")
]).then(([usDataLoaded, usStatesDataLoaded, usGeo]) => {
    console.log(usGeo);
    usDataLoaded.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    usStatesDataLoaded.forEach(d => {
        d.date = new Date(d.date);
        d.fips = +d.fips;
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    usData = usDataLoaded;
    usStatesData = usStatesDataLoaded;

    render();
});

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const svgCases = d3.select('.cases-line')
    .attr('height', windowHeight / 2)
    .attr('width', windowWidth / 2);

const svgDeaths = d3.selectAll('.deaths-line')
    .attr('height', windowHeight / 2)
    .attr('width', windowWidth / 2);





const xValue = d => d.date;
const casesValue = d => d.cases;
const deathsValue = d => d.deaths;

const dateOptions = { month: 'short', year: '2-digit' }
const dateFormat = new Intl.DateTimeFormat('en-US', dateOptions);

const hoverDateOptions = { month: 'short', day: '2-digit' };
const hoverDateFormat = new Intl.DateTimeFormat('en-US', hoverDateOptions);

const render = () => {

    // Scale range assignment performed in lineChart.js
    const xScale = d3.scaleTime()
        .domain(d3.extent(usData, xValue));

    const casesScale = d3.scaleLinear()
        .domain([0, d3.max(usData, casesValue)])
        .nice();
    const deathsScale = d3.scaleLinear()
        .domain([0, d3.max(usData, deathsValue)])
        .nice();

    svgCases.call(lineChart, {
        margin: {top: 75, right: 100, bottom: 100, left: 100},
        xValue: xValue,
        xAxisLabel: "Date",
        xScale: xScale,
        formatX: dateFormat.format,
        formatXHover: hoverDateFormat.format,
        setXState: d => selectedYear = d,
        xState: selectedYear,
        yValue: casesValue,
        yAxisLabel: "Cases",
        yScale: casesScale,
        formatY: d => d3.format('.2s')(d).replace('.0', ''),
        formatYHover: d3.format('.3s'),
        setYState: d => selectedCases = d,
        yState: selectedCases,
        title: "US COVID Cases Over Time",
        lineColor: 'red',
        data: usData
    });

    svgDeaths.call(lineChart, {
        margin: {top: 75, right: 100, bottom: 100, left: 100},
        xValue: xValue,
        xAxisLabel: "Date",
        xScale: xScale,
        formatX: dateFormat.format,
        formatXHover: hoverDateFormat.format,
        setXState: d => selectedYear = d,
        xState: selectedYear,
        yValue: deathsValue,
        yAxisLabel: "Deaths",
        yScale: deathsScale,
        formatY: d => d3.format('.2s')(d).replace('.0', ''),
        formatYHover: d3.format('.3s'),
        setYState: d => selectedDeaths = d,
        yState: selectedDeaths,
        title: "US COVID Deaths Over Time",
        lineColor: 'blue',
        data: usData
    });
};

// Do window resize here
// window.addEventListener('resize', () => console.log('resized'));
