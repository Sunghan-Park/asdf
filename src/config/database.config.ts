// import * as Joi from 'joi'
// import { registerAs } from '@nestjs/config'

// const databaseSchema = Joi.object({
//   DATABSE_HOST: Joi.string(),
//   DATABSE_PORT: Joi.number(),
//   DATABSE_USER: Joi.string(),
//   DATABSE_PASSWORD: Joi.string(),
//   DATABSE_NAME: Joi.string(),
// });

// export default registerAs('database', () => {
//   const { error, value } = databaseSchema.validate(process.env);
//   if (error) {
//     throw new Error(`Database config validation error: ${error.message}`);
//   }
//   return value;
// });
