const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();

// MIDDLEWARE
app.use(bodyParser.json());

// CREATE todos
app.post('/todos', (req,res) => {
	const todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

// GET todos
app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({
			todos: todos
		});
	}, (e) => {
		res.status(400).send(e);
	})
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
	const id = req.params.id;
	
	// Validate ID
	if (!ObjectID.isValid(id)) {
		return res.status(404).send('error');
	}

	// findById
	Todo.findById(id).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.send({todo: todo});
	}, (e) => {
		res.status(400).send();
	})
});

app.listen(3000, () => {
	console.log('Started on port 3000');
});

module.exports = {app};