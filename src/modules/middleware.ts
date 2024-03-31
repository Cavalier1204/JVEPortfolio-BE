import { validationResult } from "express-validator";

export const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

export const parseQueryToInt = (req, res, next) => {
  // Loop through each query parameter and parse it to an integer if possible
  for (const key in req.query) {
    if (req.query.hasOwnProperty(key)) {
      const value = req.query[key];
      const parsedValue = parseInt(value);
      if (!isNaN(parsedValue)) {
        // If parsing is successful, replace the string value with the parsed integer value
        req.query[key] = parsedValue;
      }
    }
  }
  // Move to the next middleware or route handler
  next();
};
