angular.service('persistencejs', function() {
	persistence.store.websql.config(persistence, 'todo2', 'todo database', 5*1024*1024);
	var Todo = persistence.define('todo', {
		content: 'TEXT',
		done: 'BOOL'
	});
	Todo.enableSync('/todoUpdates'); //this will create the table with sync attributes
	persistence.schemaSync();
	return {
		add: function(item){
			var t = new Todo();
			persistence.add(t);			
			t.content = item;
			t.done = false;
			persistence.flush(function(){
				// 6 persistence (server-side/mysql)				
				Todo.syncAll(
					function(){alert('Callback');},
					function(){alert("Done!");},
					function(){alert("Error");}
				);									
			});
		},
		
		edit: function(startContent, endContent){
			Todo.all().filter('content','=',startContent).one(function(item){
				item.content = endContent;
				persistence.flush(function(){
					// 6 persistence (server-side/mysql)					
					Todo.syncAll(
						function(){alert('Callback');},
						function(){alert("Done!");},
						function(){alert("Error");}
					);
										
				});
			});
		},
		
		changeStatus: function(item){
			Todo.all().filter('content','=',item.content).one(function(todo){
				todo.done = item.done;
				persistence.flush(function(){
					// 6 persistence (server-side/mysql)					
					Todo.syncAll(
						function(){alert('Callback');},
						function(){alert("Done!");},
						function(){alert("Error");}
					);
									
				});
			});
		},
		
		clearCompletedItems: function(){
			Todo.all().filter('done','=',true).destroyAll(function(){
				// 6 persistence (server-side/mysql)				
				Todo.syncAll(
					function(){alert('Callback');},
					function(){
						Todo.all().filter('done','=',true).destroyAll(function(){
							alert("Done!");
						});
					},
					function(){alert("Error");}
				);
							
			});
		},
		
		remove: function(item){
			Todo.all().filter('content','=',item.content).destroyAll(function(){
				// 6 persistence (server-side/mysql)				
				Todo.syncAll(
					function(){alert('Callback');},
					function(){
						Todo.all().filter('content','=',item.content).destroyAll(function(){
							alert("Done!");
						});
					},
					function(){alert("Error");}
				);
											
			});
		},
		
		fetchAll: function(controller){
			Todo.syncAll(
				function(){alert('Callback');},
				function(){
					Todo.all().list(function(items){
						var itemCount = items.length;
						var todos = [];
						items.forEach(function(item){
							todos.push({
								content: item.content,
								done: item.done,
								editing: false
							});
							if(--itemCount == 0){
								controller.todos = todos;
								controller.refresh();
							}
						});									
					});
				},
				function(){alert("Error");}
			);			
		},
	};
});