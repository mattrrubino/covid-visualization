import { loadAndProcessData } from './loadAndProcessData.js';
import { lineChart } from './lineChart.js';
import { geoMap } from './geoMap.js';

let usData;
let usStatesData;
let usStatesDataFlat;
let usGeo;

let selectedData;
let selecting;

loadAndProcessData().then(data => {
    usData = data.usData;
    usStatesData = data.usStatesData;
    usStatesDataFlat = Array.from(usStatesData, ([_, value]) => value).flat();
    usGeo = data.usGeo;

    selectedData = usData[0];
    selecting = true;

    render();
});

//#region Initialize visualization
const graphs = d3.select('.graphs');
const graphsHeight = +d3.select('.graphs').attr('height');
const graphsWidth = +d3.select('.graphs').attr('width');

const svgCasesLine = d3.select('.cases-line')
    .attr('height', graphsHeight / 2)
    .attr('width', graphsWidth / 2);

const svgCasesGeo = d3.select('.cases-geo')
    .attr('height', graphsHeight / 2)
    .attr('width', graphsWidth / 2)
    .attr('transform', `translate(${graphsWidth / 2}, 0)`);

const svgDeathsLine = d3.selectAll('.deaths-line')
    .attr('height', graphsHeight / 2)
    .attr('width', graphsWidth / 2)
    .attr('transform', `translate(0, ${graphsHeight / 2})`);

const svgDeathsGeo = d3.select('.deaths-geo')
    .attr('height', graphsHeight / 2)
    .attr('width', graphsWidth / 2)
    .attr('transform', `translate(${graphsWidth / 2}, ${graphsHeight / 2})`);

const scaleGraphs = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const scale = Math.min(windowWidth / graphsWidth, windowHeight / graphsHeight);
    const xTranslate = graphsWidth * (scale-1) / 2;
    const yTranslate = graphsHeight * (scale-1) / 2;

    graphs.attr('transform', `translate(${xTranslate}, ${yTranslate}) scale(${scale})`);
}

window.addEventListener('resize', scaleGraphs);
scaleGraphs();
//#endregion

//#region General attributes
const timeValue = d => d.date;
const casesValue = d => d.cases;
const deathsValue = d => d.deaths;
//#endregion

//#region Line chart attributes
const setSelectedData = d => {
    selectedData = d;
    render();
}
const setSelecting = d => {
    selecting = d;
    render();
}

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
        margin: {top: 30, right: 50, bottom: 50, left: 70},
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
        setSelectedData: setSelectedData,
        selectedData: selectedData,
        setSelecting: setSelecting,
        selecting: selecting,
        lineColor: 'red',
        data: usData
    });

    svgCasesGeo.call(geoMap, {
        margin: {top: 20, right: 100, bottom: 20, left: 0},
        xValue: timeValue,
        xFormat: hoverDateFormat.format,
        colorValue: casesValue,
        colorScale: casesColorScale,
        colorLabel: "New Cases",
        colorFormat: d => d3.format('.2s')(Math.round(+d)),
        geoGenerator: geoGenerator,
        geoName: geoName,
        geoRegion: geoRegion,
        geoData: usGeo,
        selectedData: selectedData,
        groupedData: usStatesData
    });

    svgDeathsLine.call(lineChart, {
        margin: {top: 30, right: 50, bottom: 50, left: 70},
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
        setSelectedData: setSelectedData,
        selectedData: selectedData,
        setSelecting: setSelecting,
        selecting: selecting,
        lineColor: 'blue',
        data: usData
    });

    svgDeathsGeo.call(geoMap, {
        margin: {top: 20, right: 100, bottom: 20, left: 0},
        xValue: timeValue,
        xFormat: hoverDateFormat.format,
        colorValue: deathsValue,
        colorScale: deathsColorScale,
        colorLabel: "New Deaths",
        colorFormat: d => d3.format('.2s')(Math.round(+d)),
        geoGenerator: geoGenerator,
        geoName: geoName,
        geoRegion: geoRegion,
        geoData: usGeo,
        selectedData: selectedData,
        groupedData: usStatesData
    });

};
