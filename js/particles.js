const Particles = function(elementId, params, callback) {
  const self = this;
  const ParticlesException = function(message) {
    this.message = message;
    this.name = 'ParticlesException'; // Maybe I make it better sometime
  };

  const defaultParams = {
    count: 400,
    size: {
      min: 3,
      max: 10
    },
    lifetime: {
      min: 0.5,
      max: 3.0,
    },
    speed: {
      min: 3,
      max: 30,
      modifier: 1
    },
    gravity: {
      enabled: false
    },
    timeMultiplier: 1,
    color: '#FFFFFF',
    mass: 1
  };

  const parentEl = document.getElementById (elementId);
  const canvasEl =  document.createElement('canvas');

  canvasEl.style.width ='100%';
  canvasEl.style.height='100%';

  let cursorX = 0;
  let cursorY = 0;


  self.params = params || {};

  setParams(self.params, defaultParams);

  if (self.params.gravity.enabled && self.params.gravity.type === "Cursor") {
    canvasEl.addEventListener('mousemove', function (e) {
      cursorY = e.clientY;
      cursorX = e.clientX;
    });
  }
  const getCursorX = function () {
    return cursorX - (canvasEl.offsetLeft - window.scrollX);
  };
  const getCursorY = function () {
    return cursorY - (canvasEl.offsetTop - window.scrollY);
  };

  parentEl.appendChild(canvasEl);

  canvasEl.width = canvasEl.offsetWidth;
  canvasEl.height = canvasEl.offsetHeight;

  if (params.loadFromJSON) {
    console.log ('loading from JSON');
  }

  const createParticle = function () {
    return {
      size: RandInInterval(self.params.size.min, self.params.size.max),
      x: RandInInterval(0, canvasEl.width),
      y: RandInInterval(0, canvasEl.height),
      lifetime: RandInInterval(self.params.lifetime.max, self.params.lifetime.min),
      speed: RandVector(self.params.speed.min, self.params.speed.max),
      aliveTime: 0,
      opacity: 0
    };
  };

  const particles = [];

  for (let i = 0; i < self.params.count; i++) {
    particles.push(createParticle());
  }

  let prevTime = 0;

  const redraw = function (time) {
    let timeMultiplier;
    if (typeof self.params.timeMultiplier === 'function') {
      timeMultiplier = self.params.timeMultiplier();
    } else {
      timeMultiplier = self.params.timeMultiplier;
    }
    let timePassed = (time - prevTime) / 1000 * timeMultiplier; // time in seconds x Multiplier
    // console.log(self.params.)
    prevTime = time;

    canvasEl.width = canvasEl.offsetWidth;
    canvasEl.height = canvasEl.offsetHeight;

    const ctx = canvasEl.getContext('2d');

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height); // clear canvas

    ctx.fillStyle = self.params.color;
    ctx.shadowColor = self.params.color;

    particles.forEach(function (particle, index) {
      particle = updateParticle(particle, timePassed);

      ctx.beginPath();

      const radius = particle.size / 2;

      ctx.shadowBlur = 3 * radius;

      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.globalAlpha = particle.opacity;

      ctx.fill();

      particles[index] = particle; // Any way to this better?
    });
    window.requestAnimationFrame(redraw);
  };
  window.requestAnimationFrame(redraw);

  const gravityConst = .6;

  const applyGravity = function (particle, timePassed) {
    let gravityX;
    let gravityY;

    if (self.params.gravity.type === "cursor") {
      gravityX = getCursorX();
      gravityY = getCursorY();
    } else {
      if (typeof self.params.gravity.position === "function") {
        gravityX = self.params.gravity.position().x;
        gravityY = self.params.gravity.position().y;
      } else {
        gravityX = self.params.gravity.position.x;
        gravityY = self.params.gravity.position.y;
      }
    }

    let averagePositionX = (2 * particle.x + particle.speed.x) / 2;
    let averagePositionY = (2 * particle.y + particle.speed.y) / 2;

    let distanceX = gravityX - averagePositionX;

    let distanceY = gravityY - averagePositionY;

    let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    let acceleration = gravityConst * self.params.gravity.mass / (distance) / timePassed;

    particle.speed.x += acceleration * distanceX / distance;
    particle.speed.y += acceleration * distanceY / distance;
  };

  const updateParticle = function (particle, timePassed) {
    particle.aliveTime += timePassed;
    if (particle.aliveTime > particle.lifetime) {
      return createParticle();
    }
    particle.opacity = Math.sin(Math.PI * particle.aliveTime / particle.lifetime);

    particle.x += particle.speed.x * timePassed;
    particle.y += particle.speed.y * timePassed;

    if (self.params.gravity.enabled) {
      applyGravity(particle, timePassed);
    }
    return particle;
  };


  if (callback) callback(elementId, params);
};