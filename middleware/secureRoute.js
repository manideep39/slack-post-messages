async function secureRoute(req, res, next) {
  const pin = req.query.pin;
  if (process.env.PIN == pin) {
    next();
  } else {
    res.status(401).send('Incorrect password');
  }
}

module.exports = secureRoute;
