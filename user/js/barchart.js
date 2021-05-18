const barchart = {
    init(elementId, width, height) {
        this.elementId = elementId;
        this.height = height;
        this.width = width;
        this.margin =  {
            left: 65,
            top: 20,
            right: 20,
            bottom: 65,
        }
        this.x = d3.scaleBand();
        this.y = d3.scaleLinear();
        this.svg = d3.select(`#${this.elementId}`)
                    .append('svg')
                    .attr('class', 'barchart')
                    .attr('viewBox', `0 0 
                            ${this.width + this.margin.left + this.margin.right} 
                            ${this.height + this.margin.top + this.margin.bottom}`);
    },

    render(dataset, xLabel, yLabel) {
        this.dataset = dataset;
        this.clear();
        this.adjustScales();
        this.renderLabels(xLabel, yLabel);
        this.renderBars();
        this.renderXAxis();
        this.renderYAxis();
    },

    clear() {
        this.svg.selectAll('*').remove();
        this.svgContent = this.svg
                            .append('g')
                            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    },

    adjustScales() {
        this.x
            .domain(d3.map(this.dataset, (d) => d['date']))
            .range([0, this.width])
            .padding(0.2);
        this.y
            .domain([0, d3.max(this.dataset, (d) => d['value'])])
            .nice()
            .range([this.height, 0]);
    },

    renderLabels(xLabel, yLabel) {
        // Factors 2.75 and -15 are chosen empirically
        // We can also calculate the length and height of the strings when rendered
        // but it's much more cumbersome

        this.svg.append('g')
                .attr('transform', `translate(10 ${this.margin.top + (this.height)/2.75}) rotate(90)`)
                .append('text')
                .attr('class', 'barchart-x-axis-label')
                .text(xLabel)

        this.svg.append('g')
                .attr('transform', `translate(${this.margin.left + (this.width)/2.75} ${this.margin.top + this.height + this.margin.bottom - 15})`)
                .append('text')
                .attr('class', 'barchart-y-axis-label')
                .text(yLabel)
    },

    renderBars() {
        this.svgContent
        .append('g')
        .attr('class', 'barchart-content')
        .selectAll(".barchart-bar")
        .data(this.dataset)
        .join("rect")
        .transition()
        .duration(200)
        .attr('class', 'barchart-bar')
        .attr('x', (d) => this.x(d['date']))
        .attr('y', (d) => this.y(d['value']))
        .attr('width', this.x.bandwidth())
        .attr('height', (d) => this.y(0) - this.y(d['value']));
    },
    renderXAxis() {
        let xAxis = d3.axisBottom(this.x).tickFormat(d3.timeFormat('%a'))

        this.svgContent
            .append('g')
            .attr('class', 'barchart-x-axis')
            .attr('transform', `translate(0 ${this.height})`)
            .call(xAxis);  
    },
    renderYAxis() {
        let yAxis = d3.axisLeft(this.y)
        .ticks(5);
        
        this.svgContent
            .append('g')
            .attr('class', 'barchart-y-axis')
            .call(yAxis);  
    }
}

export default barchart;