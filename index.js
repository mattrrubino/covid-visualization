// TODO:
// Dynamically resize graph
// Dynamically resize text
// Change tick count as graph shrinks
// Dynamic margin?

let usData;
let usStatesData;
let usStatesDataFlat;
let usGeo;

let selectedData;

loadAndProcessData().then(data => {
    usData = data.usData;
    usStatesData = data.usStatesData;
    usStatesDataFlat = Array.from(usStatesData, ([_, value]) => value).flat();
    usGeo = data.usGeo;

    render();
});

//#region Initialize window
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const svgCasesLine = d3.select('.cases-line')
    .attr('height', windowHeight / 2)
    .attr('width', windowWidth / 2);

const svgCasesGeo = d3.select('.cases-geo')
    .attr('height', windowHeight / 2)
    .attr('width', windowWidth / 2);

const svgDeathsLine = d3.selectAll('.deaths-line')
    .attr('height', windowHeight / 2)
    .attr('width', windowWidth / 2);

const svgDeathsGeo = d3.select('.deaths-geo')
    .attr('height', windowHeight / 2)
    .attr('width', windowWidth / 2);
//#endregion

//#region General attributes
const timeValue = d => d.date;
const casesValue = d => d.cases;
const deathsValue = d => d.deaths;
//#endregion

//#region Line chart attributes
const dateOptions = { month: 'short', year: '2-digit' }
const dateFormat = new Intl.DateTimeFormat('en-US', dateOptions);

const hoverDateOptions = { month: 'short', day: '2-digit' };
const hoverDateFormat = new Intl.DateTimeFormat('en-US', hoverDateOptions);
//#endregion

//#region Map attributes
const geoName = d => d.properties.NAME;
const geoRegion = d => d.properties.STATE;

const projection = d3.geoAlbersUsa();
const geoGenerator = d3.geoPath().projection(projection);
//#endregion

const render = () => {

    // Scale range assignment performed in lineChart.js
    const timeScale = d3.scaleTime()
        .domain(d3.extent(usData, timeValue));

    const casesScale = d3.scaleLinear()
        .domain([0, d3.max(usData, casesValue)])
        .nice();
    const deathsScale = d3.scaleLinear()
        .domain([0, d3.max(usData, deathsValue)])
        .nice();

    const casesColorScale = d3.scaleSequential()
        .domain([0, d3.max(usStatesDataFlat, casesValue)])
        .interpolator(d3.interpolateReds);
    const deathsColorScale = d3.scaleSequential()
        .domain([0, d3.max(usStatesDataFlat, deathsValue)])
        .interpolator(d3.interpolateBlues);


    svgCasesLine.call(lineChart, {
        margin: {top: 75, right: 100, bottom: 100, left: 100},
        xValue: timeValue,
        xAxisLabel: "Date",
        xScale: timeScale,
        formatX: dateFormat.format,
        formatXHover: hoverDateFormat.format,
        yValue: casesValue,
        yAxisLabel: "Cases",
        yScale: casesScale,
        formatY: d => d3.format('.2s')(d).replace('.0', ''),
        formatYHover: d3.format('.3s'),
        title: "US COVID Cases Over Time",
        setSelectedData: d => selectedData = d,
        selectedData: selectedData,
        lineColor: 'red',
        data: usData
    });

    svgCasesGeo.call(geoMap, {
        margin: {top: 50, right: 50, bottom: 100, left: 50},
        xValue: timeValue,
        colorValue: casesValue,
        colorScale: casesColorScale,
        geoGenerator: geoGenerator,
        geoName: geoName,
        geoRegion: geoRegion,
        geoData: usGeo,
        selectedData: selectedData,
        groupedData: usStatesData
    });

    svgDeathsLine.call(lineChart, {
        margin: {top: 75, right: 100, bottom: 100, left: 100},
        xValue: timeValue,
        xAxisLabel: "Date",
        xScale: timeScale,
        formatX: dateFormat.format,
        formatXHover: hoverDateFormat.format,
        yValue: deathsValue,
        yAxisLabel: "Deaths",
        yScale: deathsScale,
        formatY: d => d3.format('.2s')(d).replace('.0', ''),
        formatYHover: d3.format('.3s'),
        title: "US COVID Deaths Over Time",
        setSelectedData: d => selectedData = d,
        selectedData: selectedData,
        lineColor: 'blue',
        data: usData
    });

    svgDeathsGeo.call(geoMap, {
        margin: {top: 50, right: 50, bottom: 100, left: 50},
        xValue: timeValue,
        colorValue: deathsValue,
        colorScale: deathsColorScale,
        geoGenerator: geoGenerator,
        geoName: geoName,
        geoRegion: geoRegion,
        geoData: usGeo,
        selectedData: selectedData,
        groupedData: usStatesData
    });

};

// Do window resize here
// window.addEventListener('resize', () => console.log('resized'));
