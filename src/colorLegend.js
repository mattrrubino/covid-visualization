export const colorLegend = (selection, props) => {
    const {
        height,
        width,
        colorScale,
        colorLabel,
        colorFormat
    } = props;

    const legendG = selection.selectAll('.color-legend').data([null]);
    const legendGEnter = legendG.enter().append('g')
        .attr('class', 'color-legend noselect');

    //#region Create legend title
    legendGEnter.append('text')
        .attr('class', 'title')
        .text(colorLabel);
    //#endregion

    //#region Create gradient
    const rectGradientEnter = legendGEnter.append('linearGradient')
        .attr('id', colorLabel + ' Gradient')
        .attr('gradientTransform', 'rotate(90)');

    rectGradientEnter.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale.range()[1]);

    rectGradientEnter.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale.range()[0]);
    //#endregion

    //#region Create legend box
    const legendBoxGEnter = legendGEnter.append('g')
        .attr('class', 'legend-box')
        .attr('transform', 'translate(-20, 20)');

    const legendRectEnter = legendBoxGEnter.append('rect')
        .attr('class', 'legend-rect')
        .attr('height', height)
        .attr('width', width)
        .attr('fill', `url("#${colorLabel + ' Gradient'}")`);

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([height, 0])
        .nice();

    const legendAxis = d3.axisLeft(legendScale)
        .tickSize(-width)
        .tickFormat(colorFormat);

    legendBoxGEnter
        .call(legendAxis)
            .selectAll('.domain')
            .remove();
    //#endregion
}