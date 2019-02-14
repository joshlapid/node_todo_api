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
app.post('/todos', authenticate, (req,res) => {
	const todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

// GET /todos
app.get('/todos', authenticate, (req, res) => {
	Todo.find({
		_creator: req.user._id
	}).then((todos) => {
		res.send({
			todos: todos
		});
	}, (e) => {
		res.status(400).send(e);
	})
});

// GET /todos/:id
app.get('/todos/:id', authenticate, (req, res) => {
	const id = req.params.id;
	
	// Validate ID
	if (!ObjectID.isValid(id)) {
		return res.status(404).send('error');
	}

	// findById
	Todo.findOne({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.send({todo: todo});
	}, (e) => {
		res.status(400).send();
	});
});

// DELETE /todos/:id
app.delete('/todos/:id', authenticate, async (req, res) => {
	// get the id
	const id = req.params.id;

	// validate -> 404
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	// Async version
	try {
		const todo = await Todo.findOneAndDelete({
			_id: id,
			_creator: req.user._id
		});
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({todo: todo});
	} catch (e) {
		res.status(400).send();
	}


	// remove todo by id
	// Promise Version
	// Todo.findOneAndDelete({
	// 	_id: id,
	// 	_creator: req.user._id
	// }).then((todo) => {
	// 	if (!todo) {
	// 		return res.status(404).send();
	// 	}
	// 	res.status(200).send({todo: todo});
	// }).catch((e) => {
	// 	res.status(400).send();
	// });
});

// PATCH /todos/:id
app.patch('/todos/:id', authenticate, (req, res) => {
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

	Todo.findOneAndUpdate({
		_id: id,
		_creator: req.user._id
	}, {$set: body}, {new: true}).then((todo) =>{
		if (!todo) {
			return res.status(404).send();
		}

		res.status(200).send({todo});
	}).catch((e) => {
		res.status(400).send();
	});
});

// POST /users
app.post('/users', async (req,res) => {
	try {
		const body = _.pick(req.body, ['email', 'password']);
		const user = new User(body);
		await user.save();
		const token = await user.generateAuthToken();
		res.header('x-auth', token).send(user);
	} catch (e) {
		res.status(400).send(e);
	}

	// user.save().then(() => {
	// 	return user.generateAuthToken();
	// }).then((token) => {
	// 	res.header('x-auth', token).send(user);
	// }).catch((e) => {
	// 	res.status(400).send(e)
	// });
});

// POST /users/login
app.post('/users/login', async (req, res) => {
	// Async Version
	try {
		const body = _.pick(req.body, ['email', 'password']);
		const user = await User.findByCredentials(body.email, body.password);
		const token = await user.generateAuthToken();
		res.header('x-auth', token).send(user);
	} catch (e) {
		res.status(400).send();
	}

	// Promise Version
	// const body = _.pick(req.body, ['email', 'password']);
	// User.findByCredentials(body.email, body.password).then((user) => {
	// 	return user.generateAuthToken().then((token) =>{
	// 		res.header('x-auth', token).send(user);
	// 	});
	// }).catch((e) => {
	// 	res.status(400).send();
	// })
});

// GET /users/me
app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

// DELETE /users/me/token
app.delete('/users/me/token', authenticate, async (req, res) => {
	// Async Version
	try {
		await req.user.removeToken(req.token);
		res.status(200).send();
	} catch (e) {
		res.status(400).send();
	}

	// Promise Version
	// req.user.removeToken(req.token).then(() => {
	// 	res.status(200).send();
	// }, () => {
		
	// });
});

app.listen(port, () => {
	console.log(`Started on port ${port}`);
});


module.exports = {app};