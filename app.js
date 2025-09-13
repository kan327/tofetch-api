import express from 'express';
import rateLimit from 'express-rate-limit';

import errorMiddleware from './middleware/error-middleware.js';
import { DB_URI, NODE_ENV, PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';
import Todo from './models/todo-model.js';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 🚫 Rate Limiting Middleware: Maksimal 100 request per 15 menit per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 menit
  max: 60, // max 100 request per window per IP
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});
app.use(limiter);

app.get('/', (req, res) => {
  res.json({
    logUri: DB_URI,
    logENV: NODE_ENV,
    message: "Welcome to the Todo API",
    endpoints: {
      getAllTodos: {
        method: "GET",
        path: "/api/todo",
        description: "Get all todo items"
      },
      createTodo: {
        method: "POST",
        path: "/api/todo",
        description: "Create a new todo item",
        body: {
          task: "String - required"
        }
      }
    }
  });
});

app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

app.get('/api/todo', async (req, res, next) => {
  try {
    const todos = await Todo.find();

    res.status(200).json({
      success: true,
      message: "success get all Todo data",
      data: todos
    })
  } catch (error) {
    next(error);
  }
});

app.post('/api/todo', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { task } = req.body;

    if(!task) {
      return res.status(422).json({
        success: false,
        message: "task cannot be empty",
        data: {}
      })
    }

    const newTasks = await Todo.create([{
      task: task
    }], { session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "task created successfully",
      data: {
        task: newTasks[0],
      }
    })
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});



app.use(errorMiddleware);
app.listen(PORT, async () => {
  console.log('Server is Running on port : ', PORT);

  await connectToDatabase()
})

export default app;