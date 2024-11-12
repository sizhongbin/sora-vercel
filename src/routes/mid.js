

// Check if body is empty
export function isBodyEmpty(req, res, next) {
  console.log('body: ', req.body);
  if (Object.keys(req.body).length === 0) res.status(400).send('Empty body');
  else next();
}

// Get current time
export function now(time = +new Date()) {
  var date = new Date(time + 8 * 3600 * 1000);
  return date.toJSON().substring(0, 23).replace('T', ' ');
}

// Dice Dn
export function D(max) {
  return Math.floor(Math.random() * max) + 1;
}

// Dice nD6
export function V(count) {
  let validity;
  for (let i = 0; i < count; i++) if (D(6) > 3) validity++;
  return validity;
}
