require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

// MIDDLEWARE
app.use(bodyParser.json());

// POST /todos
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

// GET /todos
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

// POST /users
app.post('/users', (req,res) => {
	const body = _.pick(req.body, ['email', 'password']);
	const user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e)
	});
});

// POST /users/login
app.post('/users/login', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) =>{
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send();
	})
});

// GET /users/me
app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

// DELETE /users/me/token
app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Started on port ${port}`);
});


module.exports = {app};