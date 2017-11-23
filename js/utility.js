const setParams = function (params, defaultParams) {
  if (typeof params === 'undefined') {
    params = {}; // It's not working :(
  }
  if (typeof defaultParams === 'undefined') {
    return;
  }
  Object.keys(defaultParams).forEach(function(key) {
    if (typeof params[key] === 'undefined') {
      params[key] = defaultParams[key];
      return;
    }
    if (typeof defaultParams[key] === 'object') {
      setParams(params[key], defaultParams[key]);
    } else {
      params[key] = (params[key] ? params[key] : defaultParams[key]);
    }
  });
};

const RandVector = function (minLength, maxLength) {
  const speed = RandInInterval(minLength, maxLength);
  let x = RandInInterval(-speed, speed);
  let y = Math.sqrt(speed * speed - x * x);
  if (RandInInterval(-1, 1) < 0) {
    y = -y;
  }
  return {
    x: x,
    y: y
  };
};


const RandInInterval = function(min, max) {
  return min + Math.random() * (max - min);
};