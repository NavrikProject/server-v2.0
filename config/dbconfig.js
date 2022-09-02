import dotenv from "dotenv";
import sql from "mssql/msnodesqlv8.js";

dotenv.config();
// Create connection to database
// const config = {
//   authentication: {
//     options: {
//       userName: process.env.SQL_AZURE_USERNAME, // update me
//       password: process.env.SQL_AZURE_PWD, // update me
//     },
//     type: "default",
//   },
//   server: process.env.SQL_AZURE_SERVER, // update me
//   options: {
//     database: process.env.SQL_AZURE_DATABASE, //update me
//     encrypt: true,
//     TrustServerCertificate: false,
//   },
// };

const config = {
  database: "practilearnDb",
  server: "MAHESH\\SQLEXPRESS",
  driver: "msnodesqlv8",
  user: "sa",
  password: "12345",
  port: 1443,
  options: {
    trustServerCertificate: true,
  },
};

export default config;

// Server=tcp:navrikdbserver.database.windows.net,1433;Initial Catalog=navrik;Persist Security Info=False;User ID=navrik;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
