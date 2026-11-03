/**
 * FitLifeCraft - Celebratory Confetti Particle System
 * Creates a festive canvas animation on workout completion
 */

class ConfettiEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationFrameId = null;
    this.isActive = false;

    this.colors = [
      '#8FA28A', // Sage
      '#C7D3C0', // Light Sage
      '#C8A96B', // Muted Gold
      '#E2C37B', // Bright Gold
      '#5A8A65', // Forest Green
      '#FFFFFF'  // White highlight
    ];

    if (this.canvas) {
      window.addEventListener('resize', () => this.resize());
      this.resize();
    }
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth || window.innerWidth;
    this.canvas.height = parent.clientHeight || window.innerHeight;
  }

  start(particleCount = 120) {
    if (!this.canvas || !this.ctx) {
      this.canvas = document.getElementById('confetti-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
        this.resize();
      }
    }
    if (!this.canvas || !this.ctx) return;

    this.resize();
    this.particles = [];
    this.isActive = true;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height * 0.5,
        w: Math.random() * 8 + 6,
        h: Math.random() * 12 + 8,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: Math.random() * 0.3 + 0.7
      });
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.render();
  }

  render() {
    if (!this.isActive || !this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeParticles = 0;

    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // Gentle wobble
      p.vx += Math.sin(p.y * 0.02) * 0.05;

      if (p.y < this.canvas.height + 20) {
        activeParticles++;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.ctx.restore();
    }

    if (activeParticles > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.render());
    } else {
      this.stop();
    }
  }

  stop() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

window.confettiEngine = new ConfettiEngine('confetti-canvas');
