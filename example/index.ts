import express, { ErrorRequestHandler, NextFunction } from 'express';
import { z } from 'zod';
import generateValidationFns from '../src';

const app = express();

app.use(express.json());

/**
 * Method one is to save the generated functions to
 * a varialble and then use dot notation to access
 * the method you would like. This example emulates
 * the default behavior where no config object is passed
 * into generateValidationFns:
 */
// const v = generateValidationFns({
//   errorFn(errors, res) {
//     res.status(400).json(errors);
//   },
// });

// Then the functions can be accessed like this:
// v.validateRequest({
//   params: z.object({
//     someQuery: z.string(),
//   }),
// })

/**
 * Method two is used below and destructures the needed
 * functions from the generator funcion.
 * It also utilizes the express error handling by
 * passing the error to the next function.
 */

const { validateRequest } = generateValidationFns({
  errorFn(errors, res, next) {
    next(errors[0].errors);
  },
});

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.post(
  '/',
  validateRequest({
    body: z.object({
      hello: z.string(),
    }),
  }),
  (req, res) => {
    console.log('POST request to "/" was hit!');
    res.json({ hello: req.body.hello });
  },
);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log('error middleware');
  res.status(500).json({ error: err });
};
app.use(errorHandler);

app.listen(4000, () => {
  console.log('listening on port 4000');
});
