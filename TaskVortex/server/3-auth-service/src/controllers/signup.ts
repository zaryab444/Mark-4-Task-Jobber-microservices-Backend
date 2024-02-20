import crypto from 'crypto';

import { signupSchema } from '@auth/schemes/signup';
import { createAuthUser, getUserByUsernameOrEmail, signToken } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { UploadApiResponse } from 'cloudinary';
import { config } from '@auth/config';
// import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@auth/middleware/error-handler';
import { IAuthDocument, IEmailMessageDetails } from '@auth/middleware/auth.interface';
import { firstLetterUppercase, lowerCase } from '@auth/middleware/helpers';
import { uploads } from '@auth/middleware/cloudinary-upload';
import { publishDirectMessage } from '@auth/queues/auth.produces';


/**
 * 
 *http://localhost:4000/api/gateway/v1/auth/signup
 *  {
"username":"zaryab",
"email":"zaryab@test.com",
"password":"qwerty",
"country":"Pakistan",
"profilePicture":"data:image/jpeg;base64,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"
}
base64 image text in profilePicture variable
 */

export async function create(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(signupSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'SignUp create() method error');
  }
  //for profile picture from frontend send base64 uploaded string
  const { username, email, password, country, profilePicture } = req.body;
  const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
  if (checkIfUserExist) {
    throw new BadRequestError('Invalid credentials. Email or Username', 'SignUp create() method error');
  }

  const profilePublicId = uuidV4();
  const uploadResult: UploadApiResponse = await uploads(profilePicture, `${profilePublicId}`, true, true) as UploadApiResponse;
  if (!uploadResult.public_id) {
    throw new BadRequestError('File upload error. Try again', 'SignUp create() method error');
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    profilePublicId,
    password,
    country,
    profilePicture: uploadResult?.secure_url, //secure url is like https result url
    emailVerificationToken: randomCharacters
  } as IAuthDocument;
  const result: IAuthDocument = await createAuthUser(authData) as IAuthDocument;
  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification', //exchange name
    'auth-email',  //routing key
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service.'
  );
  const userJWT: string = signToken(result.id!, result.email!, result.username!); //this jwt token not stored in cookie it stored in api gateway
  res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT }); 
}