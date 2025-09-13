import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  task: { 
    type: String, 
    required: [true, 'task field is required'], 
  },
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;