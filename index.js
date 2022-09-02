import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import sql from "mssql/msnodesqlv8.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import authRouter from "./routes/authRoute.js";
import courseRoute from "./routes/courseRoute.js";
import courseRegdRoute from "./routes/courseRegdRoute.js";
import usersRoute from "./routes/usersRoute.js";
import trainerRoute from "./routes/trainerRoute.js";
import trainerProfileRoute from "./routes/trainerProfileRoute.js";
import traineeProfileRoute from "./routes/traineeProfileRoute.js";
import trainerEarningsRoute from "./routes/trainerEarningRoute.js";
import corporateCourseRoute from "./routes/corpCourseRoute.js";
import mentorRoute from "./routes/mentorRoute.js";
import TraineeBookingProfileRoute from "./routes/traineeBookingProfileRoute.js";
import mentorBookingRoute from "./routes/MentorBookingRoute.js";
import FeedbackRoute from "./routes/feedbackRoute.js";
import ContributersRoute from "./routes/contributersRoute.js";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { createServer } from "http";

import config from "./config/dbconfig.js";
import rp from "request-promise";
import * as schedule from "node-schedule";

const job = schedule.scheduleJob("31 * * * *", function () {});

const app = express();
const httpServer = createServer(app);
dotenv.config();
app.use(express.json());
app.use(morgan("common"));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use(
  fileUpload({
    createParentPath: true,
  })
);
const port = process.env.PORT || 3000;

app.get("/api/get-razorpay-key", (req, res) => {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/hello-world", async (req, res) => {
  const date = new Date().toLocaleDateString();
  const time = new Date().getTime();
  res.send(
    `The server is working fine on this date: ${date} and time: ${time}`
  );
  // sql.connect(config, function (err) {
  //   if (err) {
  //     res.json(err.message);
  //     console.log(err);
  //   } else {
  //     // create request object
  //     var request = new sql.Request();
  //     // query to the database
  //     request.query("select * from user_dtls", function (err, result) {
  //       if (err) {
  //         res.send(err.message);
  //       } else {
  //         res.send(result.recordset);
  //         console.log(result.recordset);
  //       }
  //     });
  //   }
  // });
});

app.use("/api/auth", authRouter);
app.use("/api/courses/new", courseRegdRoute);
app.use("/api/courses", courseRoute);
app.use("/api/trainee", traineeProfileRoute);
app.use("/api/earnings", trainerEarningsRoute);
app.use("/api/trainer/profile", trainerProfileRoute);
app.use("/api/trainer", trainerRoute);
app.use("/api/users", usersRoute);
app.use("/api/corporate", corporateCourseRoute);
app.use("/api/mentor", mentorRoute);
app.use("/api/mentor/profile", TraineeBookingProfileRoute);
app.use("/api/mentor/bookings", mentorBookingRoute);
app.use("/api/feedback", FeedbackRoute);
app.use("/api/contributers", ContributersRoute);
const io = new Server(httpServer, {
  /* options */ cors: {
    origin: "http://localhost:3000",
  },
});

let allUsers = [];
const addNewUser = (userEmail, socketId) => {
  !allUsers.some((user) => user.userEmail === userEmail) &&
    allUsers.push({ userEmail, socketId });
};
const removeUser = (socketId) => {
  allUsers = allUsers.filter((user) => user.socketId !== socketId);
};
const getSpecificUser = (userEmail) => {
  return allUsers.find((user) => user.userEmail === userEmail);
};
io.on("connection", (socket) => {
  socket.on("newUser", (userEmail) => {
    addNewUser(userEmail, socket.id);
  });
  socket.on("booked", ({ userEmail, mentorEmail }) => {
    const receiver = getSpecificUser(mentorEmail);
    io.to(receiver.socketId).emit("getNotification", {
      userEmail,
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});
const payload = {
  iss: process.env.ZOOM_APP_API_KEY,
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.ZOOM_APP_API_SECRET_KEY);
app.get("/new-meeting", (req, res) => {
  var email = "b.mahesh311296@gmail.com";
  var options = {
    method: "POST",
    uri: "https://api.zoom.us/v2/users/me/meetings",
    body: {
      topic: "test meeting title",
      type: 1,
      start_time: new Date("2022-08-12T12:46:02.166Z"),
      contact_email: email,
      registrants_email_notification: true,
      calendar_type: 2,
      recurrence: {
        end_date_time: new Date("2022-08-12T12:46:02.166Z"),
        end_times: 7,
        monthly_day: 1,
        monthly_week: 1,
        monthly_week_day: 1,
        repeat_interval: 1,
        type: 1,
        weekly_days: "1",
      },
      settings: {
        host_video: "true",
        participant_video: "true",
      },
    },
    auth: {
      bearer: token,
    },
    headers: {
      "User-Agent": "Zoom-api-Jwt-Request",
      "content-type": "application/json",
    },
    json: true, //Parse the JSON string in the response
  };
  rp(options)
    .then(function (response) {
      console.log("response is: ", response);
      res.send("create meeting result: " + JSON.stringify(response));
    })
    .catch(function (err) {
      // API call failed...
      console.log("API call failed, reason ", err.message);
    });
});
httpServer.listen(port, (req, res) => {
  console.log("listening on port " + port);
});

// app.listen(port, (req, res) => {
//   console.log("listening on port " + port);
// });
