import express from 'express';
import errorMiddleware from './middleware/error-middleware.js';
import { PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';
import Todo from './models/todo-model.js';

const app = express();

app.get('/', (req, res) => {
  res.json({
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

    const newTasks = await Todo.create([{
      task: task
    }], { session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "task created successfully",
      data: {
        task: newtasks[0],
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