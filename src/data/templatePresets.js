/**
 * templatePresets.js
 * Pre-loaded interactive templates for CodeCraft Sandbox
 */

export const TEMPLATE_PRESETS = [
  {
    id: 'interactive-counter',
    name: 'Interactive Counter',
    description: 'Minimalist animated counter with step controls and console logging',
    tags: ['Interactive', 'DOM', 'State'],
    html: `<div class="container">
  <div class="card">
    <div class="badge">COUNTER APP</div>
    <div class="display" id="countDisplay">0</div>
    <div class="step-label">Current Step: <span id="stepDisplay">1</span></div>
    
    <div class="btn-group">
      <button class="btn btn-secondary" id="decBtn">-1</button>
      <button class="btn btn-primary" id="incBtn">+1</button>
    </div>

    <div class="btn-group small-group">
      <button class="btn btn-ghost" id="step5Btn">Step: 5</button>
      <button class="btn btn-ghost" id="resetBtn">Reset</button>
    </div>
  </div>
</div>`,
    css: `body {
  background: #09090b;
  color: #f4f4f5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.container {
  padding: 24px;
}

.card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 32px;
  width: 320px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.badge {
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 600;
  color: #a1a1aa;
  margin-bottom: 8px;
}

.display {
  font-size: 64px;
  font-weight: 800;
  font-family: monospace;
  margin: 16px 0;
  color: #38bdf8;
  transition: transform 0.15s ease;
}

.display.bump {
  transform: scale(1.15);
}

.step-label {
  font-size: 13px;
  color: #71717a;
  margin-bottom: 24px;
}

.btn-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 12px;
}

.small-group {
  margin-top: 16px;
  margin-bottom: 0;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #38bdf8;
  color: #09090b;
  flex: 1;
}

.btn-primary:hover {
  background: #7dd3fc;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #27272a;
  color: #f4f4f5;
  flex: 1;
}

.btn-secondary:hover {
  background: #3f3f46;
  transform: translateY(-2px);
}

.btn-ghost {
  background: transparent;
  color: #a1a1aa;
  border: 1px solid #27272a;
  font-size: 12px;
  padding: 6px 14px;
}

.btn-ghost:hover {
  background: #27272a;
  color: #fafafa;
}`,
    js: `let count = 0;
let step = 1;

const display = document.getElementById('countDisplay');
const stepDisplay = document.getElementById('stepDisplay');
const incBtn = document.getElementById('incBtn');
const decBtn = document.getElementById('decBtn');
const resetBtn = document.getElementById('resetBtn');
const step5Btn = document.getElementById('step5Btn');

function updateDisplay() {
  display.textContent = count;
  display.classList.add('bump');
  setTimeout(() => display.classList.remove('bump'), 150);
}

incBtn.addEventListener('click', () => {
  count += step;
  console.log('Incremented by', step, '-> New Count:', count);
  updateDisplay();
});

decBtn.addEventListener('click', () => {
  count -= step;
  console.log('Decremented by', step, '-> New Count:', count);
  updateDisplay();
});

step5Btn.addEventListener('click', () => {
  step = step === 1 ? 5 : 1;
  incBtn.textContent = '+' + step;
  decBtn.textContent = '-' + step;
  stepDisplay.textContent = step;
  step5Btn.textContent = step === 5 ? 'Step: 1' : 'Step: 5';
  console.info('Step toggled to:', step);
});

resetBtn.addEventListener('click', () => {
  count = 0;
  console.warn('Counter reset to zero');
  updateDisplay();
});

console.log('Interactive Counter ready! Click buttons to test.');`
  },
  {
    id: 'css-glowing-animation',
    name: 'CSS Glowing Animation',
    description: 'Futuristic glowing pulse effect with dynamic color palette switch',
    tags: ['CSS', 'Animation', 'Neon'],
    html: `<div class="scene">
  <div class="glow-orb"></div>
  <div class="card">
    <h1 class="title">NEON MATRIX</h1>
    <p class="subtitle">Real-time reactive luminescence & animations</p>
    
    <div class="button-wrapper">
      <button class="glow-btn" id="pulseBtn">Ignite Energy</button>
    </div>

    <div class="modes">
      <button class="color-dot cyan active" data-color="#06b6d4"></button>
      <button class="color-dot emerald" data-color="#10b981"></button>
      <button class="color-dot violet" data-color="#8b5cf6"></button>
      <button class="color-dot rose" data-color="#f43f5e"></button>
    </div>
  </div>
</div>`,
    css: `:root {
  --glow-color: #06b6d4;
  --glow-rgba: rgba(6, 182, 212, 0.4);
}

body {
  background: #030712;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
}

.scene {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glow-orb {
  position: absolute;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, var(--glow-rgba) 0%, transparent 70%);
  filter: blur(40px);
  animation: float 6s ease-in-out infinite alternate;
  z-index: 0;
  pointer-events: none;
}

@keyframes float {
  0% { transform: scale(0.9) translate(-10px, -10px); }
  100% { transform: scale(1.2) translate(15px, 15px); }
}

.card {
  position: relative;
  z-index: 1;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  width: 340px;
  box-shadow: 0 0 30px var(--glow-rgba);
  transition: box-shadow 0.4s ease;
}

.title {
  font-size: 24px;
  letter-spacing: 3px;
  margin: 0 0 10px 0;
  color: var(--glow-color);
  text-shadow: 0 0 12px var(--glow-rgba);
  transition: color 0.4s ease;
}

.subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 28px 0;
}

.glow-btn {
  background: transparent;
  color: #ffffff;
  border: 2px solid var(--glow-color);
  padding: 12px 28px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border-radius: 9999px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px var(--glow-rgba);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  background: var(--glow-color);
  color: #030712;
  box-shadow: 0 0 25px var(--glow-color);
  transform: translateY(-2px);
}

.glow-btn:active {
  transform: scale(0.96);
}

.modes {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-dot:hover {
  transform: scale(1.2);
}

.color-dot.active {
  border-color: #ffffff;
  transform: scale(1.15);
}

.cyan { background: #06b6d4; }
.emerald { background: #10b981; }
.violet { background: #8b5cf6; }
.rose { background: #f43f5e; }`,
    js: `const pulseBtn = document.getElementById('pulseBtn');
const dots = document.querySelectorAll('.color-dot');
let clickCount = 0;

pulseBtn.addEventListener('click', () => {
  clickCount++;
  console.log('Pulse triggered #' + clickCount);
  pulseBtn.style.transform = 'scale(0.92)';
  setTimeout(() => {
    pulseBtn.style.transform = '';
  }, 150);
});

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    dots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');

    const color = dot.dataset.color;
    document.documentElement.style.setProperty('--glow-color', color);
    
    // Compute rgba approximation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--glow-rgba', \`rgba(\${r}, \${g}, \${b}, 0.45)\`);

    console.info('Switched theme glow to:', color);
  });
});

console.log('Glowing Animation loaded. Click dots to change theme color!');`
  },
  {
    id: 'minimalist-todo-app',
    name: 'Minimalist Todo App',
    description: 'Clean task organizer with dynamic filters, completion toggles, and statistics',
    tags: ['JavaScript', 'DOM', 'Application'],
    html: `<div class="app-wrap">
  <div class="todo-card">
    <header class="todo-header">
      <h2>Tasks</h2>
      <span class="badge" id="statsBadge">0 completed</span>
    </header>

    <form id="todoForm" class="todo-form">
      <input type="text" id="todoInput" placeholder="Add a new task..." autocomplete="off" />
      <button type="submit" class="add-btn">+</button>
    </form>

    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Done</button>
    </div>

    <ul class="todo-list" id="todoList"></ul>
  </div>
</div>`,
    css: `body {
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.app-wrap {
  width: 100%;
  max-width: 400px;
  padding: 16px;
}

.todo-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.todo-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.badge {
  font-size: 11px;
  color: #94a3b8;
  background: #334155;
  padding: 4px 10px;
  border-radius: 12px;
}

.todo-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.todo-form input {
  flex: 1;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 14px;
  color: #f8fafc;
  font-size: 14px;
  outline: none;
}

.todo-form input:focus {
  border-color: #38bdf8;
}

.add-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  width: 40px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #7dd3fc;
}

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 12px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 6px;
}

.filter-btn.active {
  background: #334155;
  color: #f8fafc;
  font-weight: 600;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid #1e293b;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.todo-item.done span {
  text-decoration: line-through;
  color: #64748b;
}

.todo-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.todo-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.del-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
}

.del-btn:hover {
  opacity: 1;
}`,
    js: `const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const list = document.getElementById('todoList');
const statsBadge = document.getElementById('statsBadge');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = [
  { id: 1, text: 'Build React Code Editor', done: true },
  { id: 2, text: 'Test virtual console output', done: false },
  { id: 3, text: 'Deploy to GitHub repository', done: false }
];
let currentFilter = 'all';

function render() {
  list.innerHTML = '';
  const filtered = todos.filter(t => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'completed') return t.done;
    return true;
  });

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item ' + (todo.done ? 'done' : '');
    
    li.innerHTML = \`
      <div class="todo-item-left">
        <input type="checkbox" class="todo-checkbox" \${todo.done ? 'checked' : ''} />
        <span>\${todo.text}</span>
      </div>
      <button class="del-btn" title="Delete">&times;</button>
    \`;

    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => {
      todo.done = !todo.done;
      console.log('Toggled task:', todo.text, '-> done:', todo.done);
      render();
    });

    const delBtn = li.querySelector('.del-btn');
    delBtn.addEventListener('click', () => {
      todos = todos.filter(t => t.id !== todo.id);
      console.warn('Deleted task:', todo.text);
      render();
    });

    list.appendChild(li);
  });

  const completedCount = todos.filter(t => t.done).length;
  statsBadge.textContent = completedCount + ' / ' + todos.length + ' done';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const newTodo = { id: Date.now(), text, done: false };
  todos.push(newTodo);
  input.value = '';
  console.log('Added new task:', text);
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    console.info('Filter set to:', currentFilter);
    render();
  });
});

render();
console.log('Todo application initialized with', todos.length, 'tasks.');`
  },
  {
    id: 'html5-particle-canvas',
    name: 'HTML5 Interactive Canvas',
    description: 'Generative interactive particle system connecting nodes on mouse move',
    tags: ['Canvas', 'Particles', 'Animation'],
    html: `<div class="canvas-container">
  <canvas id="particleCanvas"></canvas>
  <div class="canvas-overlay">
    <h2>PARTICLE CONSTELLATION</h2>
    <p>Move mouse or touch to interact</p>
  </div>
</div>`,
    css: `body {
  margin: 0;
  background: #020617;
  overflow: hidden;
}

.canvas-container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.canvas-overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  color: #f8fafc;
  pointer-events: none;
  font-family: monospace;
}

.canvas-overlay h2 {
  margin: 0 0 4px 0;
  font-size: 16px;
  letter-spacing: 2px;
  color: #38bdf8;
}

.canvas-overlay p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}`,
    js: `const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
const particleCount = 45;
const mouse = { x: null, y: null, radius: 120 };

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        this.x -= (dx / dist) * 2;
        this.y -= (dy / dist) * 2;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = \`rgba(56, 189, 248, \${1 - dist / 100})\`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();
console.log('Canvas particle simulation running with', particleCount, 'particles.');`
  },
  {
    id: 'blank-canvas',
    name: 'Blank Canvas',
    description: 'Empty starting boilerplate for creating your custom project',
    tags: ['Boilerplate', 'Clean'],
    html: `<div class="welcome">
  <h1>Hello, World!</h1>
  <p>Start editing HTML, CSS, and JavaScript in the left panes.</p>
</div>`,
    css: `body {
  background: #09090b;
  color: #f4f4f5;
  font-family: system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
}

.welcome {
  text-align: center;
}

h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: #38bdf8;
}

p {
  color: #71717a;
}`,
    js: `console.log('Welcome to CodeCraft Sandbox!');`
  }
];
