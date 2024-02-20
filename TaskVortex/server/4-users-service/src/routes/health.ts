//  import { health } from './console.dir(object)';
import express, { Router } from 'express';

const router: Router = express.Router();

const healthRoutes = (): Router => {
  router.get('/user-health');

  return router;
};

export { healthRoutes };