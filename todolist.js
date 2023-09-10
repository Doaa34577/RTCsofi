var draggedItem; // Global variable to store the dragged item

document.getElementById("logout").addEventListener("click", function (event) {
	event.preventDefault(); // Prevent default link behavior

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/logout");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onload = function () {
		if (xhr.status === 200) {
			// Handle successful logout response
			window.location.href = "/"; // Redirect to homepage or login page
		} else {
			// Handle error response
			var errorMessage = xhr.responseText;
			console.log(errorMessage);
		}
	};
	xhr.send(); // No need to send any data in the request body for logout
});
// Add a new function to display the todo list
function showTodoList(items) {
	var todoList = document.getElementById("todolist");
	// Clear the current todo list
	todoList.innerHTML = "";
	// Add each item to the todo list
	for (var i = 0; i < items.length; i++) {
		var listItem = document.createElement("li");
		listItem.textContent = items[i];
		listItem.draggable = true; // Enable dragging for list item
		listItem.addEventListener("dragstart", dragStartHandler);
		listItem.addEventListener("dragover", dragOverHandler);
		listItem.addEventListener("drop", dropHandler);
		listItem.addEventListener("dragend", dragEndHandler);
		todoList.appendChild(listItem);
	}
}

function getToDoList() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/webservice");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onerror = function () {
		console.error("An error occurred while retrieving the to-do list.");
	};
	xhr.onload = function () {
		if (xhr.status === 200) {
			var response = JSON.parse(xhr.responseText);
			// On successful retrieval, display the todo list
			showTodoList(response);
		}
	};
	xhr.send();
}

function saveTodoList() {
	var items = [];
	var todoList = document.getElementById("todolist");
	var todoItems = todoList.getElementsByTagName("li");
	for (var i = 0; i < todoItems.length; i++) {
		var itemText = todoItems[i].textContent;
		items.push(itemText);
	}
	var data = {
		items: items,
	};
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/webservice");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onerror = function () {
		console.error("An error occurred while saving the to-do list.");
	};
	xhr.onload = function () {
		if (xhr.status === 200) {
			// On successful save, update the displayed todo list
			getToDoList();
		}
	};
	xhr.send(JSON.stringify(data));
}

function addTodo() {
	var todoInput = document.getElementById("itemtext");
	var newItem = todoInput.value.trim(); // Trim leading/trailing whitespace
	if (newItem !== "") {
		var todoList = document.getElementById("todolist");
		var listItem = document.createElement("li");
		listItem.textContent = newItem;

		// Apply Scriptaculous effect
		new Effect.Highlight(listItem, {
			startcolor: "#ffff99",
			endcolor: "#ffffff",
		});
		todoList.appendChild(listItem);
		todoInput.value = ""; // Clear the input field
		saveTodoList(); // Save the updated todo list
	}
}

function deleteTopItem() {
	var todoList = document.getElementById("todolist");
	var firstItem = todoList.firstChild;
	if (firstItem) {
		console.log(firstItem);
		Effect.Puff(firstItem, { duration: 3 });
		todoList.removeChild(firstItem);
		saveTodoList(); // Save the updated todo list
	}
}

function dragStartHandler(event) {
	draggedItem = this;
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setData("text/html", this.innerHTML);
	this.classList.add("dragging");
}

function dragOverHandler(event) {
	event.preventDefault();
	this.classList.add("dragover");
}

function dropHandler(event) {
	event.preventDefault();
	this.classList.remove("dragover");
	draggedItem.parentNode.removeChild(draggedItem);
	this.parentNode.insertBefore(draggedItem, this.nextSibling);
}

function dragEndHandler(event) {
	draggedItem.classList.remove("dragging");
}

document.addEventListener("DOMContentLoaded", function () {
	var element = document.getElementById("todolist");

	// Example effect: Appear
	Effect.Appear(element, {
		duration: 2.0,
		from: 0.0,
		to: 1.0,
	});

	// Example effect: Shake
	Effect.Shake(element, {
		duration: 0.5,
		distance: 10,
	});
});

// Add an event listener to the "Add" button or any other relevant event
var addButton = document.getElementById("addTodoBtn");
addButton.addEventListener("click", addTodo);

// Add an event listener to the "Delete" button or any other relevant event
var deleteButton = document.getElementById("delete");
deleteButton.addEventListener("click", deleteTopItem);
// Call the showTodoList function when the page first loads to display the initial todo list
window.addEventListener("DOMContentLoaded", getToDoList());
