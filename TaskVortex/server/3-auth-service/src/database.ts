import { Sequelize } from 'sequelize';


export const sequelize: Sequelize = new Sequelize(process.env.MYSQL_DB!,  {
  dialect: 'mysql',  //type of database like postgress, sqlite etc
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export async function databaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('AuthService Mysql database connection has been established successfully.');
  } catch (error) {
    console.log('Auth Service - Unable to connect to database.');
    console.log('error', 'AuthService databaseConnection() method error:', error);
  }
}