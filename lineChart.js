const lineChart = (selection, props) => {
    const {
        margin,
        xValue,
        xAxisLabel,
        xScale,
        formatX,
        formatXHover,
        yValue,
        yAxisLabel,
        yScale,
        formatY,
        formatYHover,
        title,
        setSelectedData,
        selectedData,
        selecting,
        setSelecting,
        lineColor,
        data
    } = props;

    const height = +selection.attr('height');
    const width = +selection.attr('width');
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const lineChart = selection.selectAll('.line-chart').data([null]);
    const lineChartEnter = lineChart.enter().append('g')
        .attr('class', 'line-chart');

    lineChartEnter
        .merge(lineChart)
            .attr('transform', `translate(${margin.left}, ${margin.top})`);


    //#region Create x-axis
    const xAxis = d3.axisBottom(xScale.range([0, innerWidth]))
        .tickSize(-innerHeight)
        .tickFormat(formatX);

    const xAxisG = lineChart.selectAll('.x-axis');
    const xAxisGEnter = lineChartEnter.append('g')
        .attr('class', 'x-axis noselect')
        .attr('transform', `translate(0, ${innerHeight})`);

    xAxisGEnter.merge(xAxisG)
        .call(xAxis)
        .selectAll('.domain')
            .remove();

    xAxisGEnter.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(${innerWidth / 2}, 30)`)
        .text(xAxisLabel);
    //#endregion

    //#region Create y-axis
    const yAxis = d3.axisLeft(yScale.range([innerHeight, 0]))
        .tickSize(-innerWidth)
        .tickFormat(formatY);

    const yAxisG = lineChart.selectAll('.y-axis');
    const yAxisGEnter = lineChartEnter.append('g')
        .attr('class', 'y-axis noselect');

    yAxisGEnter.merge(yAxisG)
        .call(yAxis)
        .selectAll('.domain')
            .remove();

    yAxisGEnter.append('text')
        .attr('class', 'axis-label noselect')
        .attr('transform', `rotate(-90) translate(${-innerHeight / 2}, -30)`)
        .text(yAxisLabel);
    //#endregion

    //#region Create line
    const lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))
        .curve(d3.curveBasis)

    const linePath = lineChart.selectAll('.line-path');
    const linePathEnter = lineChartEnter.append('path')
        .attr('class', 'line-path')
        .attr('stroke', lineColor)
        .attr('d', lineGenerator(data));
    //#endregion

    //#region Create title
    lineChartEnter.append('text')
        .merge(lineChart.selectAll('.title'))
            .attr('class', 'title noselect')
            .attr('x', innerWidth / 2)
            .attr('y', -10)
            .text(title);
    //#endregion


    //#region Create hover information
    const bisect = d3.bisector(xValue).left;

    const updateSelectedData = e => {
        const mouseX = d3.pointer(e)[0];
        const x = xScale.invert(mouseX);
        const i = bisect(data, x, 1);

        if (data[i] != null)
            setSelectedData(data[i]);
    }

    lineChartEnter.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('class', 'selection-rect')
        .merge(lineChart.selectAll('.selection-rect'))
            .on('click', e => {
                setSelecting(!selecting);
                updateSelectedData(e);
            })
            .on('mousemove', e => {
                if (selecting)
                    updateSelectedData(e);
            });

    const hoverCircleG = lineChart.selectAll('.hover');
    const hoverCircleGEnter = lineChartEnter.append('g')
        .attr('class', 'hover');

    hoverCircleGEnter.merge(hoverCircleG)
        .attr('transform', () => {
            const x = xScale(xValue(selectedData ?? data[0]));
            const y = yScale(yValue(selectedData ?? data[0]));

            return `translate(${x ?? 0}, ${y ?? 0})`;
        });
    
    hoverCircleGEnter.append('circle')
        .attr('pointer-events', 'none')
        .merge(hoverCircleG.selectAll('circle'))
            .attr('fill', selecting ? lineColor : 'black')
            .attr('opacity', selecting ? 0.5 : 1.0)
            .attr('r', selectedData ? 5 : 0)

    const hoverText = hoverCircleG.selectAll('.hover-text');
    const hoverTextEnter = hoverCircleGEnter.append('text')
        .attr('class', 'hover-text noselect')
        .attr('transform', `translate(10, 0)`);

    hoverTextEnter.merge(hoverText)
        .attr('fill', selectedData ? 'black' : 'none');

    hoverTextEnter.append('tspan')
        .attr('class', 'x-hover-text')
        .attr('x', 0)
        .merge(hoverText.selectAll('.x-hover-text'))
            .text(xAxisLabel + ': ' + formatXHover(xValue(selectedData ?? data[0])));

    hoverTextEnter.append('tspan')
        .attr('class', 'y-hover-text')
        .attr('x', 0)
        .attr('dy', 12)
        .merge(hoverText.selectAll('.y-hover-text'))
            .text(yAxisLabel + ': ' + formatYHover(yValue(selectedData ?? data[0])));
    //#endregion
};
