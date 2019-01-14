// const MongoClient = require('mongodb').MongoClient;
// Destructed version of above
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connected to MongoDB server');
	const db = client.db('TodoApp');

	// findOneAndUpdate
	db.collection('Users').findOneAndUpdate({
		_id: new ObjectID('5c3bd9c16519193ecff8c3e5')
	}, {
		$set: {
			name: 'Joshy'
		},
		$inc: {
			age: 2
		}
	}, {
		returnOriginal: false
	}).then((result) => {
		console.log(result);
	});

	// client.close();
});