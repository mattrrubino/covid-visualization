const lineChart = (selection, props) => {
    const {
        margin,
        xValue,
        xAxisLabel,
        xScale,
        formatX,
        formatXHover,
        setXState,
        xState,
        yValue,
        yAxisLabel,
        yScale,
        formatY,
        formatYHover,
        setYState,
        yState,
        title,
        lineColor,
        data
    } = props;

    const height = +selection.attr('height');
    const width = +selection.attr('width');
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const lineChart = selection.selectAll('.line-chart').data([null]);
    const lineChartEnter = lineChart.enter().append('g');

    lineChartEnter
        .attr('class', 'line-chart')
        .merge(lineChart)
            .attr('transform', `translate(${margin.left}, ${margin.top})`);



    const xAxis = d3.axisBottom(xScale.range([0, innerWidth]))
        .tickSize(-innerHeight)
        .tickFormat(formatX);

    const xAxisG = lineChart.selectAll('.x-axis');
    const xAxisGEnter = lineChartEnter.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${innerHeight})`);

    xAxisGEnter.merge(xAxisG)
        .call(xAxis)
        .selectAll('.domain')
            .remove();

    xAxisGEnter.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(${innerWidth / 2}, 60)`)
        .text(xAxisLabel);



    const yAxis = d3.axisLeft(yScale.range([innerHeight, 0]))
        .tickSize(-innerWidth)
        .tickFormat(formatY);

    const yAxisG = lineChart.selectAll('.y-axis');
    const yAxisGEnter = lineChartEnter.append('g')
        .attr('class', 'y-axis');

    yAxisGEnter.merge(yAxisG)
        .call(yAxis)
        .selectAll('.domain')
            .remove();

    yAxisGEnter.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `rotate(-90) translate(${-innerHeight / 2}, -50)`)
        .text(yAxisLabel);
    


    const lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))
        .curve(d3.curveBasis);

    const linePath = lineChart.selectAll('.line-path');
    const linePathEnter = lineChartEnter.append('path')
        .attr('class', 'line-path')
        .attr('stroke', lineColor)
        .attr('d', lineGenerator(data));


    
    lineChartEnter.append('text')
        .merge(lineChart.selectAll('.title'))
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -25)
            .text(title);



    lineChartEnter.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('class', 'selection-rect')
        .merge(lineChart.selectAll('.selection-rect'))
            .on('mousemove', e => {
                const x = d3.pointer(e)[0];
                setXState(xScale.invert(x));
                render();
            });

    const bisect = d3.bisector(xValue).left;

    const hoverCircleG = lineChart.selectAll('.hover');
    const hoverCircleGEnter = lineChartEnter.append('g')
        .attr('class', 'hover');

    hoverCircleGEnter.merge(hoverCircleG)
        .attr('transform', () => {
            const i = bisect(data, xState, 1);
            setYState(yValue(data[i]));

            const x = xScale(xState);
            const y = yScale(yState);

            return `translate(${x ?? 0}, ${y ?? 0})`;
        });
    
    hoverCircleGEnter.append('circle')
        .attr('fill', lineColor)
        .attr('opacity', 0.5)
        .merge(hoverCircleG.selectAll('circle'))
            .attr('r', xState ? 5 : 0)

    const hoverText = hoverCircleG.selectAll('.hover-text');
    const hoverTextEnter = hoverCircleGEnter.append('text')
        .attr('class', 'hover-text')
        .attr('transform', `translate(10, 0)`);

    hoverTextEnter.merge(hoverText)
        .attr('fill', xState == null ? 'none' : 'black');

    hoverTextEnter.append('tspan')
        .attr('class', 'x-hover-text')
        .attr('x', 0)
        .merge(hoverText.selectAll('.x-hover-text'))
            .text(xAxisLabel + ': ' + formatXHover(xState == null ? xValue(data[0]) : selectedYear));

    hoverTextEnter.append('tspan')
        .attr('class', 'y-hover-text')
        .attr('x', 0)
        .attr('dy', 18)
        .merge(hoverText.selectAll('.y-hover-text'))
            .text(yAxisLabel + ': ' + formatYHover(yState == null ? yValue(data[0]) : yState));
};
