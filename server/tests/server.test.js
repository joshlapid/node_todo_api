const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
	_id: new ObjectID(),
	text: 'First test todo'
}, {
	_id: new ObjectID(),
	text: 'Second test todo',
	completed: true,
	completedAt: 1234
}]

beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => done());
});

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		const text = 'Test todo text';

		request(app)
			.post('/todos')
			.send({text: text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.find({text: text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((e) => done(e));
			});
	});

	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.find().then((todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch((e) => done(e));
			});
	});
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text)
			})
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 for non-object IDs', (done) => {
		request(app)
			.get('/todos/123')
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should remove todo doc', (done) => {
		const hexId = todos[0]._id.toHexString();

		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.findById(hexId).then((todo) => {
					expect(todo).toBeFalsy();
					done();
				}).catch((e) => done(e));
			});
	});

	it('should return 404 if todo not found', (done) => {
		const hexId = new ObjectID().toHexString();

		request(app)
			.delete(`/todos/${hexId}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if object Id is invalid', (done) => {
		request(app)
			.delete('/todos/123')
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		// grab id of first item
		const hexId = todos[0]._id.toHexString();
		// update text, set completed true
		request(app)
			.patch(`/todos/${hexId}`)
			.send({text: 'New test text', completed: true})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe('New test text');
				expect(res.body.todo.completed).toBe(true);
				expect(typeof res.body.todo.completedAt).toBe('number');
			})
			.end(done);

	});

	it('should clear completedAt when todo is not completed', (done) => {
		// grab id of first item
		const hexId = todos[1]._id.toHexString();
		// update text, set completed true
		request(app)
			.patch(`/todos/${hexId}`)
			.send({text: 'New test text2', completed: false})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe('New test text2');
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toBe(null);
			})
			.end(done);
	});
});