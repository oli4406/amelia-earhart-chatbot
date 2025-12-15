/**
 * Logs incoming HTTP requests
 * @function requestLogger
 * @param {Object} req Express Request object
 * @param {Object} res Express Response object
 * @param {Function} next Express middleware next function
 */
export const requestLogger = (req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
};

export default requestLogger;
