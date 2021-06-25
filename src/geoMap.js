import { colorLegend } from './colorLegend.js';

const selectedDataMap = new Map();

export const geoMap = (selection, props) => {
    const {
        margin,
        xValue,
        xFormat,
        colorValue,
        colorScale,
        colorLabel,
        colorFormat,
        geoGenerator,
        geoName,
        geoRegion,
        geoData,
        selectedData,
        groupedData
    } = props;

    const height = +selection.attr('height');
    const width = +selection.attr('width');
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    const geoG = selection.selectAll('.geo-graph').data([null]);
    const geoGEnter = geoG.enter().append('g')
        .attr('class', 'geo-graph');

    const bisect = d3.bisector(xValue).left;
    groupedData.forEach((v, k) => {
        const i = bisect(v, xValue(selectedData ?? v[0]), 1);

        selectedDataMap.set(k, v[i] ?? v[v.length-1]);
    });

    //#region Create map
    const map = geoGEnter.merge(geoG).selectAll('.region').data(geoData.features);
    const mapEnter = map.enter().append('path')
        .attr('class', 'region')
        .attr('title', geoName)
        .attr('d', geoGenerator);

    mapEnter.append('title');

    mapEnter.merge(map)
        .attr('fill', d => {
            return colorScale(colorValue(selectedDataMap.get(geoRegion(d))));
        })
        .select('title')
            .text(d => {
                const value = '' + colorValue(selectedDataMap.get(geoRegion(d)));
                return xFormat(xValue(selectedData)) + '\n' + geoName(d) + '\n' + colorLabel + ': ' + colorFormat(value);
            });
    //#endregion

    //#region Adjust graph scale
    const bounds = selection.select('.geo-graph').node().getBBox();

    const heightScale = innerHeight / bounds.height;
    const widthScale = innerWidth / bounds.width;
    const scale = Math.min(heightScale, widthScale);

    geoGEnter
        .attr('transform', `translate(${margin.left}, ${margin.top}) scale(${scale})`);
    //#endregion

    //#region Create color legend
    geoGEnter.append('g')
        .call(colorLegend, {
            height: 200,
            width: 40,
            colorScale: colorScale,
            colorLabel: colorLabel,
            colorFormat: colorFormat
        })
        .attr('transform', `translate(${width*2}, ${innerHeight / 2})`);
    //#endregion
};
