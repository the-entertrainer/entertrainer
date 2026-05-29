// Neural Network Skill Visualization - Animated Knowledge Graph
// Skills and tools as nodes in an animated network with learning pathways

class NeuralNetwork {
  constructor() {
    this.container = document.querySelector('[data-screen-label="tools"]');
    this.isDesktop = window.matchMedia('(min-width: 840px)').matches;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.container || !this.isDesktop || this.isReducedMotion) return;

    this.skills = [
      { name: 'Storyline', category: 'authoring', x: 150, y: 150 },
      { name: 'Synthesia', category: 'video', x: 350, y: 100 },
      { name: 'Adobe Suite', category: 'design', x: 550, y: 150 },
      { name: 'HTML5', category: 'web', x: 450, y: 300 },
      { name: 'Python', category: 'coding', x: 200, y: 350 },
      { name: 'Figma', category: 'design', x: 650, y: 350 },
    ];

    this.createNetwork();
  }

  createNetwork() {
    // Create SVG canvas
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'neural-network-canvas');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('aria-hidden', 'true');

    this.container.parentElement.insertBefore(svg, this.container);

    // Create connections (edges)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'neural-gradient');
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'var(--orange)');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', 'rgba(255, 140, 0, 0.1)');
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Draw edges
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'neural-edges');

    this.skills.forEach((skill1, i) => {
      this.skills.forEach((skill2, j) => {
        if (i < j && Math.random() > 0.5) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', skill1.x);
          line.setAttribute('y1', skill1.y);
          line.setAttribute('x2', skill2.x);
          line.setAttribute('y2', skill2.y);
          line.setAttribute('class', 'neural-edge');
          line.setAttribute('stroke', 'url(#neural-gradient)');
          line.setAttribute('stroke-width', '1');
          edgeGroup.appendChild(line);
        }
      });
    });

    svg.appendChild(edgeGroup);

    // Draw nodes
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'neural-nodes');

    this.skills.forEach((skill, index) => {
      // Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', skill.x);
      circle.setAttribute('cy', skill.y);
      circle.setAttribute('r', '20');
      circle.setAttribute('class', 'neural-node');
      circle.setAttribute('data-category', skill.category);
      circle.setAttribute('fill', 'var(--orange)');
      circle.setAttribute('opacity', '0.3');
      circle.setAttribute('data-index', index);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', skill.x);
      text.setAttribute('y', skill.y + 40);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'neural-label');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', 'rgba(245, 240, 235, 0.6)');
      text.textContent = skill.name;

      nodeGroup.appendChild(circle);
      nodeGroup.appendChild(text);
    });

    svg.appendChild(nodeGroup);

    // Animate on scroll
    this.animateNetwork(svg);
  }

  animateNetwork(svg) {
    window.addEventListener('scroll', () => {
      const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const nodes = svg.querySelectorAll('.neural-node');
      const edges = svg.querySelectorAll('.neural-edge');

      nodes.forEach((node, index) => {
        const activationThreshold = index / nodes.length;
        const isActive = scrollProgress > activationThreshold;

        node.style.opacity = isActive ? 1 : 0.2;
        node.style.transition = 'opacity 0.3s ease';

        if (isActive) {
          node.style.filter = `drop-shadow(0 0 ${10 * (1 - (scrollProgress - activationThreshold))}px var(--orange))`;
        } else {
          node.style.filter = 'none';
        }
      });

      edges.forEach((edge, index) => {
        const isActive = scrollProgress > 0.3;
        edge.style.opacity = isActive ? 0.4 : 0.1;
        edge.style.transition = 'opacity 0.3s ease';
      });
    });

    // Gentle floating animation
    let time = 0;
    setInterval(() => {
      time += 0.02;
      const nodes = svg.querySelectorAll('.neural-node');
      nodes.forEach((node, index) => {
        const float = Math.sin(time + index) * 2;
        node.setAttribute('cy', this.skills[index].y + float);
      });
    }, 50);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new NeuralNetwork());
} else {
  new NeuralNetwork();
}
