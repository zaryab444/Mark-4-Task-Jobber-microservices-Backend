import { Password } from '@gateway/controllers/auth/password';
import { SignIn } from '@gateway/controllers/auth/signin';
import { SignUp } from '@gateway/controllers/auth/signup';
import { VerifyEmail } from '@gateway/controllers/auth/verify-email';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    //reason why we use prototype in class  because we are not instantiated
    this.router.post('/auth/signup', SignUp.prototype.create); //this route send to authService
    this.router.post('/auth/signin', SignIn.prototype.read);
    this.router.put('/auth/verify-email', VerifyEmail.prototype.update);
    this.router.put('/auth/forgot-password', Password.prototype.forgotPassword);
    this.router.put('/auth/reset-password/:token', Password.prototype.resetPassword);
    this.router.put('/auth/change-password', Password.prototype.changePassword);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();