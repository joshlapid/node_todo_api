const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

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
	});
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
	// get the id
	const id = req.params.id;

	// validate -> 404
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	// remove todo by id
	Todo.findByIdAndDelete(id).then((todo) => {
		if (!todo) {
			return res.sendStatus(404).send();
		}
		res.status(200).send({todo: todo});
	}).catch((e) => {
		res.status(400).send();
	});
});

// PATCH /todos/:id
app.patch('/todos/:id', (req, res) => {
	const id = req.params.id;
	// Uses lodash to create body
	const body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) =>{
		if (!todo) {
			return res.status(404).send;
		}

		res.status(200).send({todo});
	}).catch((e) => {
		res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};