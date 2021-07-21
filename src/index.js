const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const user = users.find((usr) => usr.username === username)
    if (!user) {
        return response.status(400).json({ error: "User not foud!" })
    } else {
        request.user = user;
        return next();
    }

}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const usernameExists = users.find((usr) => { return usr.username === username });

    if (usernameExists) {
        return response.status(400).json({ error: "Username already exists" })
    }
    const user = {
        id: uuidv4(),
        name,
        username,
        todos: []
    }

    users.push(user);
    return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;
    const todo = {
        id: uuidv4(),
        title,
        deadline: new Date(deadline),
        created_at: new Date(),
        done: false
    }

    user.todos.push(todo)
    return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;
    const { title, deadline } = request.body;

    const todo = user.todos.find((todo) => { return todo.id === id })

    if (!todo) {
        return response.status(404).json({ error: "Todo not foud" })
    }
    todo.title = title;
    todo.deadline = new Date(deadline)

    return response.status(200).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find((todo) => { return todo.id === id })

    if (!todo) {
        return response.status(404).json({ error: "Todo not foud" })
    }

    todo.done = true;

    return response.status(200).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find((todo) => { return todo.id === id })
    if (!todo) {
        return response.status(404).json({ error: "Todo not foud" })
    }

    user.todos.splice(todo, 1);

    return response.status(204).send("ok");
});

module.exports = app;