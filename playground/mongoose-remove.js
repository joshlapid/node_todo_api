const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.deleteMany({}).then((result) => {
// 	console.log(result);
// });

Todo.findOneAndDelete('5c4663ff7eb8d89d359f7a7b').then((todo) => {
	console.log(todo);
});

