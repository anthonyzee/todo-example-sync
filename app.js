var strVcap = process.env.VCAP_SERVICES || '{"mysql-5.1":[{"name":"mysql-d70a3","label":"mysql-5.1","plan":"free","tags":["mysql","mysql-5.1","relational"],"credentials":{"name":"todoappdb","hostname":"localhost","host":"localhost","port":3306,"user":"root","username":"root","password":"MyNewPass"}}]}';
var jsonVcap = JSON.parse(strVcap);

//persistence declaration
var persistence = require('persistencejs/lib/persistence').persistence;
var persistenceStore = require('persistencejs/lib/persistence.store.mysql');
var persistenceSync = require('persistencejs/lib/persistence.sync.server');

persistenceStore.config(persistence, jsonVcap["mysql-5.1"][0].credentials.host, jsonVcap["mysql-5.1"][0].credentials.port, jsonVcap["mysql-5.1"][0].credentials.name, jsonVcap["mysql-5.1"][0].credentials.username, jsonVcap["mysql-5.1"][0].credentials.password);
persistenceSync.config(persistence); 

//init sync
var session = persistenceStore.getSession();
var Todo = persistence.define('todo', {
	content: 'TEXT',
	done: 'BOOL'
});
Todo.enableSync(); //this create table with sync attribute
session.schemaSync(); //generate the table

//nodejs module declaration
var express = require("express");
var app = express();

//init express
app.use(express.static(__dirname));
app.use(express.bodyParser());
app.get('/todoUpdates',  function(req, res) {
	console.log(" - get /todoUpdates - ");
	//var session = persistenceStore.getSession();
	session.transaction(function(tx){
		persistenceSync.pushUpdates(session, tx, Todo, req.query.since, function(updates) {
			res.send(updates);
    	});
	});
});
app.post('/todoUpdates',  function(req, res) {
    console.log(" - post /todoUpdates - ");
	//var session = persistenceStore.getSession();
	session.transaction(function(tx){	
		persistenceSync.receiveUpdates(session, tx, Todo, req.body, function(result) {
			res.send(result);
		});
	});
});

app.listen(process.env.VCAP_APP_PORT || 3301);

