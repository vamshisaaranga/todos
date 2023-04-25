const express = require("express");
const app = express();
let db = null;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const InitializeDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("SERVER IS RUNNING");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
    process.exit(1);
  }
};
InitializeDB();

app.get("/todos/", async (request, response) => {
  const todoDetails = request.query;
  const { status, priority, search_q = "", category } = todoDetails;
  if (
    (priority == undefined) &
    (status !== undefined) &
    (search_q == "") &
    (category == undefined)
  ) {
    const getTodoStatusQuery = `
      SELECT
      id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM
      todo
      WHERE
      status = '${status}';`;
    const getTodo = await db.all(getTodoStatusQuery);

    if (getTodo.length > 0) {
      response.send(getTodo);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (
    (priority !== undefined) &
    (status == undefined) &
    (search_q == "") &
    (category == undefined)
  ) {
    const getTodoPriorityQuery = `
      SELECT
       id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
       FROM
       todo
       WHERE
       priority = '${priority}';`;
    const getTodo = await db.all(getTodoPriorityQuery);
    if (getTodo.length > 0) {
      response.send(getTodo);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (
    (priority !== undefined) &
    (status !== undefined) &
    (search_q == "") &
    (category == undefined)
  ) {
    const getTodoQuery = `
      SELECT
      id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM 
      todo
      WHERE
      status = '${status}' AND
      priority = '${priority}';`;
    const getTodo = await db.all(getTodoQuery);
    response.send(getTodo);
  }
  if (
    (priority == undefined) &
    (status == undefined) &
    (search_q !== "") &
    (category == undefined)
  ) {
    const getTodoQuery = `
      SELECT
      id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM 
      todo
      WHERE
      todo LIKE '%${search_q}%';`;
    const getTodo = await db.all(getTodoQuery);
    response.send(getTodo);
  }
  if (
    (priority == undefined) &
    (status !== undefined) &
    (search_q == "") &
    (category !== undefined)
  ) {
    const getTodQuery = `
     SELECT
     id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM 
      todo
      WHERE
      category = '${category}' AND
      status = '${status}';`;
    const getTodo = await db.all(getTodQuery);
    response.send(getTodo);
  }
  if (
    (priority == undefined) &
    (status == undefined) &
    (search_q == "") &
    (category !== undefined)
  ) {
    const getTodoQuery = `
        SELECT
        id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM
      todo
      WHERE
      category = '${category}';`;
    const getTodo = await db.all(getTodoQuery);
    if (getTodo.length > 0) {
      response.send(getTodo);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  if (
    (priority !== undefined) &
    (status == undefined) &
    (search_q == "") &
    (category !== undefined)
  ) {
    const getTodoQuery = `
        SELECT
        id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM
      todo
      WHERE
      category = '${category}' AND
      priority = '${priority}';`;
    const getTodo = await db.all(getTodoQuery);
    response.send(getTodo);
  }
});

//API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
     id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM
      todo
      WHERE
      id = ${todoId};`;
  const getTodo = await db.get(getTodoQuery);
  response.send(getTodo);
});

//API3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const newDate = new Date(date);
  const formatDate = format(newDate, "yyyy-MM-dd");
  const givenDate = new Date(formatDate);
  console.log(givenDate.getMonth());
  const getTodoQuery = `
  SELECT
      id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
      FROM
      todo
      WHERE
      due_date = '${formatDate};'`;
  const getTodo = await db.all(getTodoQuery);
  if (getTodo.length > 0) {
    response.send(getTodo);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//api4

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  let allValidValues;
  const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
  const priorityArray = ["HIGH", "MEDIUM", "LOW"];
  const categoryArray = ["WORK", "HOME", "LEARNING"];
  if (statusArray.includes(status)) {
    allValidValues = true;
  } else {
    allValidValues = false;
    response.status(400);
    response.send("Invalid Todo Status");
  }
  if (priorityArray.includes(priority)) {
    allValidValues = true;
  } else {
    allValidValues = false;
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  if (categoryArray.includes(category)) {
    allValidValues = true;
  } else {
    allValidValues = false;
    response.status(400);
    response.send("Invalid Todo Category");
  }
  const objDate = new Date(dueDate);
  if (objDate.getMonth() < 12) {
    allValidValues = true;
  } else {
    allValidValues = false;
    response.status(400);
    response.send("Invalid Due Date");
  }
  if (allValidValues) {
    const addNewTodoQuery = `
  INSERT INTO
  todo(id, todo, category, priority, status, due_date)
    VALUES
    (${id}, '${todo}','${category}', '${priority}', '${status}',${dueDate});`;
    const addNewTodo = await db.run(addNewTodoQuery);
    response.send("Todo Successfully Added");
  }
});

//api5
app.put("/todos/:todoId/", async (request, response) => {
  const updatesTodo = request.body;
  const { status, priority, todo, category, dueDate } = updatesTodo;
  const { todoId } = request.params;
  if (
    (priority == undefined) &
    (status !== undefined) &
    (category == undefined) &
    (todo == undefined)
  ) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (statusArray.includes(status)) {
      const updateTodoStatusQuery = `
        UPDATE
        todo
        SET
        status = '${status}'
        WHERE
        id = ${todoId};`;
      const updateTodoStatus = await db.run(updateTodoStatusQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (
    (priority !== undefined) &
    (status == undefined) &
    (category == undefined) &
    (todo == undefined)
  ) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (priorityArray.includes(priority)) {
      const updatePriorityQuery = `
      UPDATE
      todo
      SET
      priority = '${priority}'
      WHERE
      id = ${todoId};`;
      const updatePriority = await db.run(updatePriorityQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (
    (priority == undefined) &
    (status == undefined) &
    (category == undefined) &
    (todo !== undefined)
  ) {
    const updateTodoQuery = `
      UPDATE
      todo
      SET
      todo = '${todo}'
      WHERE
      id = ${todoId};`;
    const updateTodo = await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
  if (
    (priority == undefined) &
    (status == undefined) &
    (category !== undefined) &
    (todo == undefined)
  ) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    if (categoryArray.includes(category)) {
      const updateCategoryQuery = `
        UPDATE
        todo
        SET
        category = '${category}'
        WHERE
        id = ${todoId};`;
      const updateCategory = await db.run(updateCategoryQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  if (dueDate !== undefined) {
    const updateDueDate = `
      UPDATE
      todo
      SET
      due_date = '${dueDate}'
      WHERE
      id = ${todoId}`;
    const updateDate = await db.run(updateDueDate);
    response.send("Due Date Updated");
  }
});

//api6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM
    todo
    WHERE
    id = ${todoId};`;
  const deleteTodo = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
