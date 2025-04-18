document.addEventListener('DOMContentLoaded', () => {
    const floatingNumbers = d3.select('#floating-numbers');
    const enterButton = document.getElementById('enter-chamber');
    
    // Create floating numbers
    const numbers = Array.from({length: 30}, () => ({
        value: Math.random() > 0.5 ? 
            Math.floor(Math.random() * 4) : 
            -Math.floor(Math.random() * 4),
        radius: 20
    }));

    // Create SVG container
    const svg = floatingNumbers
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    // Create number elements
    const numberElements = svg.selectAll('g')
        .data(numbers)
        .enter()
        .append('g')
        .attr('class', 'number-group');

    // Add glowing circle backgrounds
    numberElements.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.value >= 0 ? '#6AD2A0' : '#F3AE49')
        .attr('opacity', 0.2)
        .attr('filter', 'url(#glow)');

    // Add number text
    numberElements.append('text')
        .text(d => d.value)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', d => d.value >= 0 ? '#6AD2A0' : '#F3AE49')
        .style('font-family', 'IBM Plex Mono')
        .style('font-size', '24px')
        .style('opacity', 0.7);

    // Add glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
        .attr('id', 'glow');

    filter.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

    // Set up force simulation
    const simulation = d3.forceSimulation(numbers)
        .force('charge', d3.forceManyBody().strength(50))
        .force('collide', d3.forceCollide().radius(d => d.radius * 2).strength(0.8))
        .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
        .force('bounds', () => {
            for (let node of numbers) {
                if (node.x < node.radius) node.x = node.radius;
                if (node.x > window.innerWidth - node.radius) node.x = window.innerWidth - node.radius;
                if (node.y < node.radius) node.y = node.radius;
                if (node.y > window.innerHeight - node.radius) node.y = window.innerHeight - node.radius;
            }
        })
        .on('tick', () => {
            numberElements.attr('transform', d => `translate(${d.x},${d.y})`);
        });

    // Add hover effects
    numberElements
        .on('mouseover', function(event, d) {
            const group = d3.select(this);
            group.select('circle')
                .transition()
                .duration(200)
                .attr('r', d.radius * 1.5)
                .attr('opacity', 0.4);
            
            group.select('text')
                .transition()
                .duration(200)
                .style('font-size', '32px')
                .style('opacity', 1);

            // Add velocity on hover
            d.vx = (Math.random() - 0.5) * 5;
            d.vy = (Math.random() - 0.5) * 5;
        })
        .on('mouseout', function(event, d) {
            const group = d3.select(this);
            group.select('circle')
                .transition()
                .duration(200)
                .attr('r', d.radius)
                .attr('opacity', 0.2);
            
            group.select('text')
                .transition()
                .duration(200)
                .style('font-size', '24px')
                .style('opacity', 0.7);
        });

    // Handle window resize
    window.addEventListener('resize', () => {
        simulation.force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
        simulation.alpha(1).restart();
    });

    // Handle enter button click
    enterButton.addEventListener('click', () => {
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('input-page').classList.add('active');
    });
}); 