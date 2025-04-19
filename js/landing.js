document.addEventListener('DOMContentLoaded', () => {
    const floatingNumbers = d3.select('#floating-numbers');
    const enterButton = document.getElementById('enter-chamber');
    
    // Get screen dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const buttonArea = enterButton.getBoundingClientRect();
    
    // Create a grid of numbers
    const gridSize = 110; // Increased grid cell size
    const columns = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);
    
    // Track shift key state
    let isShiftPressed = false;
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            isShiftPressed = true;
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            isShiftPressed = false;
            // Reset all numbers when shift is released
            numberElements
                .style('font-size', '24px')
                .style('opacity', 0.7);
        }
    });
    
    // Create numbers for the grid
    const numbers = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = col * gridSize + gridSize/2;
            const y = row * gridSize + gridSize/2;
            
            // Skip if in button area
            if (!(y > buttonArea.top - 50 && y < buttonArea.bottom + 50 &&
                  x > buttonArea.left - 50 && x < buttonArea.right + 50)) {
                numbers.push({
                    value: Math.floor(Math.random() * 10), // Random number 0-9
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    angle: Math.random() * Math.PI * 2, // Random initial angle
                    speed: 0.02 + Math.random() * 0.02, // Random speed between 0.02 and 0.04
                    radius: 2 + Math.random() * 2 // Random radius between 2 and 4 pixels
                });
            }
        }
    }

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
        .attr('fill', '#4A90E2')
        .style('font-family', 'IBM Plex Mono')
        .style('font-size', '24px')
        .style('opacity', 0.7)
        .style('filter', 'url(#glow)')
        .style('cursor', 'pointer')
        .style('transition', 'all 0.3s ease');

    // Function to scale numbers based on distance
    function scaleNumbersByDistance(mouseX, mouseY) {
        const maxDistance = 300; // Maximum distance for scaling effect
        numberElements.each(function(d) {
            const element = d3.select(this);
            const dx = d.x - mouseX;
            const dy = d.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const scale = 1 + (1 - distance / maxDistance) * 0.5; // Scale up to 1.5x
                const fontSize = Math.floor(24 * scale);
                element
                    .style('font-size', `${fontSize}px`)
                    .style('opacity', 0.7 + (1 - distance / maxDistance) * 0.3);
            } else {
                element
                    .style('font-size', '24px')
                    .style('opacity', 0.7);
            }
        });
    }

    // Add hover effects
    numberElements.each(function() {
        const element = d3.select(this);
        element
            .on('mouseover', function(event) {
                if (isShiftPressed) {
                    const mouseX = event.clientX;
                    const mouseY = event.clientY;
                    scaleNumbersByDistance(mouseX, mouseY);
                } else {
                    d3.select(this)
                        .style('font-size', '50px')
                        .style('opacity', 1);
                }
            })
            .on('mousemove', function(event) {
                if (isShiftPressed) {
                    const mouseX = event.clientX;
                    const mouseY = event.clientY;
                    scaleNumbersByDistance(mouseX, mouseY);
                }
            })
            .on('mouseout', function() {
                if (!isShiftPressed) {
                    d3.select(this)
                        .style('font-size', '24px')
                        .style('opacity', 0.7);
                }
            });
    });

    // Animation function for subtle movement
    function animate() {
        numbers.forEach(d => {
            // Update angle for circular motion
            d.angle += d.speed;
            
            // Calculate new position
            d.x = d.baseX + Math.cos(d.angle) * d.radius;
            d.y = d.baseY + Math.sin(d.angle) * d.radius;
        });

        // Update positions
        numberElements
            .attr('x', d => d.x)
            .attr('y', d => d.y);

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        // Clear existing numbers
        svg.selectAll('text').remove();
        
        // Recalculate grid
        const newWidth = window.innerWidth;
        const newColumns = Math.ceil(newWidth / gridSize);
        const newRows = Math.ceil(height / gridSize);
        
        // Create new numbers array
        const newNumbers = [];
        for (let row = 0; row < newRows; row++) {
            for (let col = 0; col < newColumns; col++) {
                const x = col * gridSize + gridSize/2;
                const y = row * gridSize + gridSize/2;
                
                if (!(y > buttonArea.top - 50 && y < buttonArea.bottom + 50 &&
                      x > buttonArea.left - 50 && x < buttonArea.right + 50)) {
                    newNumbers.push({
                        value: Math.floor(Math.random() * 10),
                        x: x,
                        y: y,
                        baseX: x,
                        baseY: y,
                        angle: Math.random() * Math.PI * 2,
                        speed: 0.02 + Math.random() * 0.02,
                        radius: 2 + Math.random() * 2
                    });
                }
            }
        }
        
        // Update the visualization
        const newNumberElements = svg.selectAll('text')
            .data(newNumbers)
            .enter()
            .append('text')
            .text(d => d.value)
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#4A90E2')
            .style('font-family', 'IBM Plex Mono')
            .style('font-size', '24px')
            .style('opacity', 0.7)
            .style('filter', 'url(#glow)')
            .style('cursor', 'pointer')
            .style('transition', 'all 0.1s ease');
            
        // Add hover effects to new elements
        newNumberElements.each(function() {
            const element = d3.select(this);
            element
                .on('mouseover', function(event) {
                    if (isShiftPressed) {
                        const mouseX = event.clientX;
                        const mouseY = event.clientY;
                        scaleNumbersByDistance(mouseX, mouseY);
                    } else {
                        d3.select(this)
                            .style('font-size', '50px')
                            .style('opacity', 1);
                    }
                })
                .on('mousemove', function(event) {
                    if (isShiftPressed) {
                        const mouseX = event.clientX;
                        const mouseY = event.clientY;
                        scaleNumbersByDistance(mouseX, mouseY);
                    }
                })
                .on('mouseout', function() {
                    if (!isShiftPressed) {
                        d3.select(this)
                            .style('font-size', '24px')
                            .style('opacity', 0.7);
                    }
                });
        });
    });

    // Handle enter button click
    enterButton.addEventListener('click', () => {
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('input-page').classList.add('active');
    });
}); 