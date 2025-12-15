/**
 * Logs incoming HTTP requests
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {Function} next 
 */
export const requestLogger = (req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
};

export default requestLogger;
