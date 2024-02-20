import { authService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class SignUp {
  public async create(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.signUp(req.body); //this req.body coming from front end to api gateway then api gatewau go to authservice
    req.session = { jwt: response.data.token }; //this token coming from auth Service controller signup.ts line no 60
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user }); //this message and user coming from auth Service controller signup.ts line no 61
  }
}