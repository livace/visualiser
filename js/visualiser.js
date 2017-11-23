const getScreenCenter = function() {
  const w = window;
  const d = document;
  const e = d.documentElement;
  const g = d.body;
  const x = w.innerWidth || e.clientWidth || g.clientWidth;
  const y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  return {
    x: x / 2,
    y: y / 2
  }
};

const Visualiser = function (elementID, params, callback) {
  const self = this;
  const AudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audio = new Audio();

  const defaultParams = {
    center: getScreenCenter,
    r: 130,
    R: 150,
    count: 1024,
    color: '#330099',
    smoothingTimeConstant: 0.7
  };

  self.params = params || {};

  setParams(self.params, defaultParams);

  console.log(self.params);

  audio.src = './other/RockAngel.mp3';

  self.paused = function () {
    return audio.paused;
  };

  self.play = function () {
    audio.play();
  };
  self.pause = function () {
    audio.pause();
  };

  const scriptProcessor = AudioCtx.createScriptProcessor(2048, 1, 1);
  const analyser = AudioCtx.createAnalyser();

  analyser.smoothingTimeConstant = self.params.smoothingTimeConstant;
  analyser.fftSize = self.params.count;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  const nodeCount = analyser.frequencyBinCount;

  const source = AudioCtx.createMediaElementSource(audio);

  source.connect(analyser);

  analyser.connect(scriptProcessor);
  scriptProcessor.connect(AudioCtx.destination);
  source.connect(AudioCtx.destination);

  const init = function () {
    requestAnimationFrame(draw);
  };

  audio.addEventListener('canplay', init);

  const parentEl = document.getElementById (elementID);
  const canvasEl =  document.createElement('canvas');

  canvasEl.style.width ='100%';
  canvasEl.style.height='100%';

  parentEl.appendChild(canvasEl);

  let avgVolume = 0;

  const draw = function () {
    analyser.getByteFrequencyData(dataArray);
    const canvasCtx = canvasEl.getContext('2d');
    canvasCtx.lineWidth = 1;

    avgVolume = 0;

    canvasEl.width = canvasEl.offsetWidth;
    canvasEl.height = canvasEl.offsetHeight;

    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    canvasCtx.strokeStyle = self.params.color;

    for (let i = 0; i < nodeCount; i++) {
      let center;
      if (typeof self.params.center === 'function') {
        center = self.params.center();
      } else {
        center = self.params.center;
      }
      const x0 = center.x;
      const y0 = center.y;

      const x1 = Math.cos(i * 180. / nodeCount) * self.params.r + x0;
      const y1 = Math.sin(i * 180. / nodeCount) * self.params.r + y0;
      const x2 = Math.cos(i * 180. / nodeCount) * (self.params.R + dataArray[i]) + x0;
      const y2 = Math.sin(i * 180. / nodeCount) * (self.params.R + dataArray[i]) + y0;

      avgVolume += dataArray[i];

      canvasCtx.beginPath();
      canvasCtx.moveTo(x1, y1);
      canvasCtx.lineTo(x2, y2);
      canvasCtx.stroke();
    }

    avgVolume /= nodeCount;

    requestAnimationFrame(draw);
  };

  self.averageVolume = function () {
    return Math.max(1, avgVolume / 5);
  };

  if (callback) callback();
};