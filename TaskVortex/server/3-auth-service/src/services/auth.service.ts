import { config } from '@auth/config';
import { IAuthBuyerMessageDetails, IAuthDocument } from '@auth/middleware/auth.interface';
import { firstLetterUppercase, lowerCase } from '@auth/middleware/helpers';
import { AuthModel } from '@auth/model/auth.schema';
import { publishDirectMessage } from '@auth/queues/auth.produces';
// import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';


//every user who create account become automatically a buyer
export async function createAuthUser(data: IAuthDocument): Promise<IAuthDocument | undefined> {
  try {
    const result: Model = await AuthModel.create(data);
    //this messageDetails is used to create a new buyer
    const messageDetails: IAuthBuyerMessageDetails = {
      username: result.dataValues.username!,
      email: result.dataValues.email!,
      profilePicture: result.dataValues.profilePicture!,
      country: result.dataValues.country!,
      createdAt: result.dataValues.createdAt!,
      type: 'auth'
    };
    await publishDirectMessage(
      authChannel,
      'jobber-buyer-update', //exchange name 
      'user-buyer', //routinng key
      JSON.stringify(messageDetails),
      'Buyer details sent to buyer service.' //log value
    );
    //we dont want to return a password so we omit the password omit is for particular feild key or value not send password to frontend
    const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
    return userData;
  } catch (error) {
    console.log(error);
  }
}

//get single user by id
export async function getAuthUserById(authId: number): Promise<IAuthDocument | undefined> {
  try {
    const user: Model = await AuthModel.findOne({
      where: { id: authId }, //where clause check id matches authid
      attributes: {
        exclude: ['password']
      }
    }) as Model;  //casting as Model
    return user?.dataValues;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | undefined> {
  try {
    const user: Model = await AuthModel.findOne({
      where: {
        [Op.or]: [{ username: firstLetterUppercase(username)}, { email: lowerCase(email)}]
      },
    }) as Model;
    return user?.dataValues;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserByUsername(username: string): Promise<IAuthDocument | undefined> {
  try {
    const user: Model = await AuthModel.findOne({
      where: { username: firstLetterUppercase(username) },
    }) as Model;
    return user?.dataValues;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserByEmail(email: string): Promise<IAuthDocument | undefined> {
  try {
    const user: Model = await AuthModel.findOne({
      where: { email: lowerCase(email) },
    }) as Model;
    return user?.dataValues;
  } catch (error) {
    console.log(error);
  }
}

export async function getAuthUserByVerificationToken(token: string): Promise<IAuthDocument | undefined> {
  try {
    const user: Model = await AuthModel.findOne({
      where: { emailVerificationToken: token },
      attributes: {
        exclude: ['password']
      }
    }) as Model;
    return user?.dataValues;
  } catch (error) {
    console.log(error);
  }
}

export async function getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | undefined> {
  try {
    const user: Model = await AuthModel.findOne({
      where: {
        [Op.and]: [{ passwordResetToken: token}, { passwordResetExpires: { [Op.gt]: new Date() }}]
      },
    }) as Model;
    return user?.dataValues;
  } catch (error) {
    console.log(error);
  }
}

export async function updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken?: string): Promise<void> {
  try {
    await AuthModel.update(
    !emailVerificationToken ?  {
        emailVerified
      } : {
        emailVerified,
        emailVerificationToken
      },
      { where: { id: authId }},
    );
  } catch (error) {
    console.log(error);
  }
}

//this is user want to change the password token when they are already login 
export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
  try {
    await AuthModel.update(
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      },
      { where: { id: authId }},
    );
  } catch (error) {
    console.log(error);
  }
}

//this is when user want to add new pasword
export async function updatePassword(authId: number, password: string): Promise<void> {
  try {
    await AuthModel.update(
      {
        password, //whatever password user add
        passwordResetToken: '',
        passwordResetExpires: new Date()
      },
      { where: { id: authId }},
    );
  } catch (error) {
    console.log(error);
  }
}

export function signToken(id: number, email: string, username: string): string {
  return sign(
    {
      id,
      email,
      username
    },
    config.JWT_TOKEN!
  );
}