// TODO:
// Add legend for scale

const geoMap = (selection, props) => {
    const {
        margin,
        xValue,
        colorValue,
        colorScale,
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

    //#region Create map
    const map = geoGEnter.merge(geoG).selectAll('.region').data(geoData.features);
    const mapEnter = map.enter().append('path')
        .attr('class', 'region')
        .attr('title', geoName)
        .attr('d', geoGenerator);

    const bisect = d3.bisector(xValue).left;

    mapEnter.merge(map)
        .attr('fill', d => {
            const regionData = groupedData.get(geoRegion(d));
            const i = bisect(regionData, xValue(selectedData ?? regionData[0]), 1);
            
            return colorScale(colorValue(regionData[i] ?? regionData[regionData.length-1]));
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

    // Legend here
};
