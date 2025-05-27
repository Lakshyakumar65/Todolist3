const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON parsing for AJAX requests

mongoose.connect("mongodb+srv://eng22cy0053:TWnLPxnLOELKSM3E@assignment.c6erzqv.mongodb.net/?retryWrites=true&w=majority&appName=ASSIGNMENT");

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model("Task", taskSchema);

// Display req
app.get("/", function(req, res) {
    Task.find({})
        .sort({ createdAt: -1 }) // Sort by newest first
        .then((foundItems) => {
            res.render("list", { tasks: foundItems });
        })
        .catch(err => {
            console.error("Error fetching documents:", err);
            res.render("list", { tasks: [] });
        });
});

// POST - Create new task
app.post("/", function(req, res) {
    const itemName = req.body.taskName;
    const priority = req.body.priority || 'medium';
    
    // Check if task name is empty
    if (!itemName || itemName.trim() === '') {
        return res.redirect("/");
    }
    
    const newTask = new Task({
        name: itemName.trim(),
        priority: priority
    });
    
    newTask.save()
        .then(() => {
            res.redirect("/");
        })
        .catch(err => {
            console.error("Error saving task:", err);
            res.redirect("/");
        });
});

// PUT - Update existing task
app.put("/update/:id", function(req, res) {
    const taskId = req.params.id;
    const { name, priority } = req.body;
    
    // Check if task name is empty
    if (!name || name.trim() === '') {
        return res.json({ 
            success: false, 
            message: "Task title cannot be empty!" 
        });
    }
    
    Task.findByIdAndUpdate(
        taskId, 
        { 
            name: name.trim(), 
            priority: priority || 'medium' 
        }, 
        { new: true }
    )
    .then((updatedTask) => {
        if (!updatedTask) {
            return res.json({ 
                success: false, 
                message: "Task not found!" 
            });
        }
        res.json({ 
            success: true, 
            message: "Task updated successfully!",
            task: updatedTask
        });
    })
    .catch(err => {
        console.error("Error updating task:", err);
        res.json({ 
            success: false, 
            message: "Error updating task. Please try again." 
        });
    });
});
//delete task 
app.delete("/delete/:id", function(req, res) {
    const taskId = req.params.id;
    
    if (!taskId) {
        return res.json({ 
            success: false, 
            message: "Task ID is required!" 
        });
    }
    
    Task.findByIdAndDelete(taskId)
        .then((deletedTask) => {
            if (!deletedTask) {
                return res.json({ 
                    success: false, 
                    message: "Task not found!" 
                });
            }
            console.log("Task deleted:", deletedTask.name);
            res.json({ 
                success: true, 
                message: "Task deleted successfully!",
                taskId: taskId
            });
        })
        .catch(err => {
            console.error("Error deleting task:", err);
            res.json({ 
                success: false, 
                message: "Error deleting task. Please try again." 
            });
        });
});

// GET - Get single task for editing
app.get("/task/:id", function(req, res) {
    const taskId = req.params.id;
    
    Task.findById(taskId)
        .then((task) => {
            if (!task) {
                return res.json({ 
                    success: false, 
                    message: "Task not found!" 
                });
            }
            res.json({ 
                success: true, 
                task: task 
            });
        })
        .catch(err => {
            console.error("Error fetching task:", err);
            res.json({ 
                success: false, 
                message: "Error fetching task." 
            });
        });
});

app.listen(8000, function() {
    console.log("Server started on port 8000");
});
