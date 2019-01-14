// const MongoClient = require('mongodb').MongoClient;
// Destructed version of above
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connected to MongoDB server');
	const db = client.db('TodoApp');

	// db.collection('Todos').insertOne({
	// 	text: 'Something to do',
	// 	completed: false
	// }, (err, result) => {
	// 	if (err) {
	// 		return console.log('Unable to insert todo', err);
	// 	}

	// 	console.log(JSON.stringify(result.ops, undefined, 2));
	// });

	// db.collection('Users').insertOne({
	// 	name: 'Josh',
	// 	age: 28,
	// 	location: 'San Diego'
	// }, (err, res) => {
	// 	if (err) {
	// 		return console.log('Unable to insert user', err);
	// 	}
	// 	console.log(res.ops[0]._id.getTimestamp());
	// });

	client.close();
});