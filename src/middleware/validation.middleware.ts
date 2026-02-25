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
  for (const key in req.query) {
    if (req.query.hasOwnProperty(key)) {
      const value = req.query[key];
      const parsedValue = parseInt(value);
      if (!isNaN(parsedValue)) {
        req.query[key] = parsedValue;
      }
    }
  }
  next();
};
