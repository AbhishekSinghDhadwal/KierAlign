class MatrixVisualization {
    constructor(config) {
        this.container = document.getElementById(config.container);
        if (!this.container) {
            console.error('Container not found:', config.container);
            return;
        }
        
        this.sequenceA = config.sequenceA;
        this.sequenceB = config.sequenceB;
        this.matchScore = config.matchScore;
        this.mismatchScore = config.mismatchScore;
        this.gapScore = config.gapScore;
        this.cellSize = config.cellSize || 80;
        this.containerWidth = config.containerWidth || 1200;
        this.containerHeight = config.containerHeight || 1000;
        this.textColor = config.textColor || "#E0FBFF";
        this.matchColor = config.matchColor || "#ff6b6b";
        this.strokeColor = config.strokeColor || "#E0FBFF";
        
        this.matrix = [];
        this.svg = null;
        this.cells = [];
    }

    initialize() {
        if (!this.container) return;
        
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create SVG element
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.containerWidth} ${this.containerHeight}`)
            .style('background', 'transparent');

        // Initialize empty matrix
        this.initializeEmptyMatrix();
    }

    initializeEmptyMatrix() {
        const m = this.sequenceA.length + 1;
        const n = this.sequenceB.length + 1;

        // Initialize matrix with null values
        this.matrix = Array(m).fill().map(() => Array(n).fill(null));
        this.cells = [];

        // Calculate total matrix dimensions
        const totalWidth = n * this.cellSize;
        const totalHeight = m * this.cellSize;
        
        // Calculate starting position to center the matrix
        const startX = (this.containerWidth - totalWidth) / 2;
        const startY = (this.containerHeight - totalHeight) / 2;

        // Create empty cells
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                const x = startX + j * this.cellSize;
                const y = startY + i * this.cellSize;
                
                // Draw cell rectangle
                const cell = this.svg.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', this.cellSize)
                    .attr('height', this.cellSize)
                    .style('fill', 'transparent')
                    .style('stroke', this.strokeColor)
                    .style('stroke-width', '1px');

                // Add empty text element
                const text = this.svg.append('text')
                    .attr('x', x + this.cellSize / 2)
                    .attr('y', y + this.cellSize / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .style('fill', this.textColor)
                    .style('font-size', this.cellSize / 3 + 'px')
                    .text('');

                this.cells.push({ rect: cell, text: text, value: null });
            }
        }

        // Add sequence labels with adjusted positions
        this.addSequenceLabels(startX, startY);
    }

    addSequenceLabels(startX, startY) {
        const fontSize = this.cellSize / 3;
        const labelPadding = 20; // Space between labels and matrix

        // Add sequence A labels (vertical)
        this.svg.selectAll('.seqA')
            .data(['', ...this.sequenceA])
            .enter()
            .append('text')
            .attr('class', 'seqA')
            .attr('x', startX - labelPadding)
            .attr('y', (d, i) => startY + i * this.cellSize + this.cellSize / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('fill', this.textColor)
            .style('font-size', fontSize + 'px')
            .text(d => d);

        // Add sequence B labels (horizontal)
        this.svg.selectAll('.seqB')
            .data(['', ...this.sequenceB])
            .enter()
            .append('text')
            .attr('class', 'seqB')
            .attr('x', (d, i) => startX + i * this.cellSize + this.cellSize / 2)
            .attr('y', startY - labelPadding)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'bottom')
            .style('fill', this.textColor)
            .style('font-size', fontSize + 'px')
            .text(d => d);
    }

    updateCell(i, j, value) {
        const index = i * (this.sequenceB.length + 1) + j;
        if (index < this.cells.length) {
            this.matrix[i][j] = value;
            this.cells[index].value = value;
            this.cells[index].text.text(value);
        }
    }

    render() {
        const padding = 50;
        const fontSize = this.cellSize / 3;

        // Add sequence A labels (vertical)
        this.svg.selectAll('.seqA')
            .data(['', ...this.sequenceA])
            .enter()
            .append('text')
            .attr('class', 'seqA')
            .attr('x', padding / 2)
            .attr('y', (d, i) => padding + i * this.cellSize + this.cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', this.textColor)
            .style('font-size', fontSize + 'px')
            .text(d => d);

        // Add sequence B labels (horizontal)
        this.svg.selectAll('.seqB')
            .data(['', ...this.sequenceB])
            .enter()
            .append('text')
            .attr('class', 'seqB')
            .attr('x', (d, i) => padding + i * this.cellSize + this.cellSize / 2)
            .attr('y', padding / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', this.textColor)
            .style('font-size', fontSize + 'px')
            .text(d => d);

        // Create grid cells
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[0].length; j++) {
                const x = padding + j * this.cellSize;
                const y = padding + i * this.cellSize;
                
                // Draw cell rectangle
                this.svg.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', this.cellSize)
                    .attr('height', this.cellSize)
                    .style('fill', 'transparent')
                    .style('stroke', this.strokeColor)
                    .style('stroke-width', '1px');

                // Add score text
                this.svg.append('text')
                    .attr('x', x + this.cellSize / 2)
                    .attr('y', y + this.cellSize / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .style('fill', this.textColor)
                    .style('font-size', fontSize + 'px')
                    .text(this.matrix[i][j]);
            }
        }

        // Add hover effects
        this.addInteractivity();
    }

    addInteractivity() {
        const cells = this.svg.selectAll('rect');
        const padding = 50;

        cells.on('mouseover', (event, d) => {
            const cell = d3.select(event.target);
            const x = parseInt(cell.attr('x'));
            const y = parseInt(cell.attr('y'));
            
            // Calculate matrix indices
            const i = (y - padding) / this.cellSize;
            const j = (x - padding) / this.cellSize;

            // Highlight current cell
            cell.style('fill', 'rgba(255, 107, 107, 0.2)');

            // Highlight corresponding sequence letters
            if (i > 0 && j > 0) {
                this.svg.selectAll('.seqA')
                    .filter((d, index) => index === i)
                    .style('fill', this.matchColor);
                
                this.svg.selectAll('.seqB')
                    .filter((d, index) => index === j)
                    .style('fill', this.matchColor);
            }
        });

        cells.on('mouseout', () => {
            // Reset all highlights
            this.svg.selectAll('rect')
                .style('fill', 'transparent');
            
            this.svg.selectAll('.seqA, .seqB')
                .style('fill', this.textColor);
        });
    }
}

// Function to initialize the visualization
function initializeMatrixVisualization(containerId, sequenceA, sequenceB, matchScore, mismatchScore, gapScore) {
    const visualization = new MatrixVisualization(
        containerId,
        sequenceA,
        sequenceB,
        matchScore,
        mismatchScore,
        gapScore
    );
    visualization.render();
    return visualization;
} 