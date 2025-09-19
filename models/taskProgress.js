// models/taskProgress.js

import mongoose from "mongoose"

const TaskProgressSchema = new mongoose.Schema({
  id: {
    type: String, 
    required: true,
  },
  regCode: {
    type: String,  
    required: true,
  },
  done: {
    type: Boolean,          
    default: false,
  },
  uuid: {
    type: String,           
    required: true,
    unique: true,          
  },
}, {
  timestamps: true
})

// [ADDED: เช็กว่า model ถูกประกาศซ้ำหรือยัง (hot reload บน Next.js)]
export default mongoose.models.TaskProgress || mongoose.model("TaskProgress", TaskProgressSchema)
