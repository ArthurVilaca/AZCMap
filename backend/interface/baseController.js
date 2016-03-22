'use strict';

class BaseController {
  //Use this for logic validation errors
  validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function (error) {
      res.status(statusCode).json({ error });
    }
  }

  //Use this to handle errors (in catches)
  handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (error) {
      res.status(statusCode).send({ error });
    };
  }

  respondWith(res, statusCode) {
    statusCode = statusCode || 200;
    return function () {
      res.status(statusCode).end();
    };
  }
  
  //TODO: add the default api methods do the interface (create, destroy etc) 
}

module.exports = BaseController;