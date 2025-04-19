document.addEventListener('DOMContentLoaded', () => {
    const floatingNumbers = d3.select('#floating-numbers');
    const enterButton = document.getElementById('enter-chamber');
    
    // Get screen dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const buttonArea = enterButton.getBoundingClientRect();
    
    // Create columns for each number type (-6 to 6)
    const numberTypes = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
    const columnWidth = width / numberTypes.length;
    
    // Create numbers for each column
    const numbers = [];
    numberTypes.forEach((value, columnIndex) => {
        const numInColumn = Math.floor(height / 60); // More dense spacing
        for (let i = 0; i < numInColumn; i++) {
            const yPos = i * 60 + Math.random() * 20;
            if (!(yPos > buttonArea.top - 50 && yPos < buttonArea.bottom + 50 &&
                  columnWidth * columnIndex > buttonArea.left - 50 && 
                  columnWidth * columnIndex < buttonArea.right + 50)) {
                numbers.push({
                    value: value,
                    x: columnWidth * columnIndex + columnWidth/2,
                    y: yPos,
                    columnIndex: columnIndex
                });
            }
        }
    });

    // Create SVG container
    const svg = floatingNumbers
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    // Add glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
        .attr('id', 'glow');

    filter.append('feGaussianBlur')
        .attr('stdDeviation', '2')
        .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

    // Create number elements
    const numberElements = svg.selectAll('text')
        .data(numbers)
        .enter()
        .append('text')
        .text(d => d.value)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', d => {
            // Create a gradient of colors from red (-6) through amber (0) to green (+6)
            if (d.value < 0) {
                return d3.interpolateRgb('#F3AE49', '#ff4444')(Math.abs(d.value) / 6);
            } else if (d.value > 0) {
                return d3.interpolateRgb('#F3AE49', '#6AD2A0')(d.value / 6);
            }
            return '#F3AE49'; // 0 remains amber
        })
        .style('font-family', 'IBM Plex Mono')
        .style('font-size', '24px')
        .style('opacity', 0.7)
        .style('filter', 'url(#glow)')
        .style('cursor', 'pointer') // Add pointer cursor on hover
        .style('transition', 'transform 0.2s ease, opacity 0.2s ease');
        //.style('z-index', '1000');;

    // Add hover effects with CSS transforms
    numberElements.each(function() {
        const element = d3.select(this);
        element
            .on('mouseover', function() {
                d3.select(this)
                    .style('transform', 'scale(1.5)')
                    .style('opacity', 1);
                console.log('hover');
            })
            //.on('mouseover', function() { console.log('hover') })
            .on('mouseout', function() {
                d3.select(this)
                    .style('transform', 'scale(1)')
                    .style('opacity', 0.7);
            });
    });

    // Animation function
    function animate() {
        numberElements
            .attr('y', function(d) {
                d.y += 0.2; // Adjust speed of falling
                if (d.y > height) {
                    d.y = -30;
                }
                // Avoid button area
                if (d.y > buttonArea.top - 50 && d.y < buttonArea.bottom + 50 &&
                    d.x > buttonArea.left - 50 && d.x < buttonArea.right + 50) {
                    d.y = buttonArea.bottom + 50;
                }
                return d.y;
            });

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newColumnWidth = newWidth / numberTypes.length;
        
        numbers.forEach(d => {
            d.x = newColumnWidth * d.columnIndex + newColumnWidth/2;
        });
        
        numberElements
            .attr('x', d => d.x);
    });

    // Handle enter button click
    enterButton.addEventListener('click', () => {
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('input-page').classList.add('active');
    });
}); 