const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5c3c0958a293024f49f53106';

// if (!ObjectID.isValid(id)) {
// 	console.log('ID not valid')
// }

// Todo.find({
// 	// Mongoose automatically converts string to obj id
// 	_id: id
// }).then((todos) => {
// 	console.log('Todos', todos);
// });

// Todo.findOne({
// 	// Mongoose automatically converts string to obj id
// 	_id: id
// }).then((todo) => {
// 	console.log('Todo', todo);
// });

// Todo.findById(id).then((todoById) => {
// 	if(!todoById) {
// 		return console.log('ID not found')
// 	}
// 	console.log('TodoByID', todoById);
// }).catch((e) => console.log(e));

User.findById(id).then((user) => {
	if(!user) {
		return console.log('User not found')
	}
	console.log('User', user);
}).catch((e) => console.log(e));