import express, { NextFunction, Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const loggingMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url} FROM THE LOGGING MIDDLEWARE`);
  next();
};

const resolveIndexByUserIdMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params;

  const index = users.findIndex((user) => user.id === Number(userId));

  if (index === -1) {
    return res.send(`<h1>The user you asked for doesn't exist.</h1>`);
  }

  (req as Request & { index: number }).index = index;
  next();
};

app.use(loggingMiddleWare);

const users = [
  {
    id: 1,
    name: "John Doe",
  },
  {
    id: 2,
    name: "Jane Doe",
  },
  {
    id: 3,
    name: "Alice Johnson",
  },
  {
    id: 4,
    name: "Bob Brown",
  },
  {
    id: 5,
    name: "Charlie Davis",
  },
];

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

// GET all
app.get("/users", (req, res) => {
  // Query params look like this: /users?name=John

  const queryParams = req.query;

  if ("name" in queryParams) {
    const usersWithEnteredName = users.filter((user) => {
      return user.name.includes(queryParams.name as string);
    });

    return res.send(`
      <div>
      ${usersWithEnteredName.map((user) => `<h2>${user.name}</h2>`).join("\n")}
      </div>
      `);
  }

  res.send(`
    <div>
    ${users.map((user) => `<h2>${user.name}</h2>`).join("\n")}
    </div>
    `);
});

// GET one
app.get("/users/:userId", (req, res) => {
  const { userId } = req.params;

  const requiredUser = users.find((user) => user.id === Number(userId));

  if (!requiredUser) {
    res.send(`<h1>The user you asked for doesn't exist.</h1>`);
  } else {
    res.send(
      `<h1>You asked for ${requiredUser?.name} with the id ${requiredUser.id}</h1>`,
    );
  }
});

// POST
app.post("/users", (req, res) => {
  const { name } = req.body;

  const newUser = {
    id: users.length + 1,
    name,
  };

  users.push(newUser);

  res.status(201).send(newUser);
});

// PUT
app.put("/users/:userId", resolveIndexByUserIdMiddleWare, (req, res) => {
  const { index } = req as Request & { index: number };

  const { name } = req.body;

  if (!name) {
    res.send(`<h1>Name is required</h1>`);
  } else {
    const requiredUser = users[index];

    const newUser = { ...requiredUser, name };

    users[index] = newUser;

    res.send(
      `<h1>We replaced the username from ${requiredUser.name} to ${name}</h1>`,
    );
  }
});

// PATCH
app.patch("/users/:userId", resolveIndexByUserIdMiddleWare, (req, res) => {
  const { index } = req as Request & { index: number };

  const { name } = req.body;

  if (!name) {
    res.send(`<h1>Name is required</h1>`);
  } else {
    const requiredUser = users[index];

    const oldName = requiredUser.name;

    requiredUser.name = name;

    res.send(`<h1>We replaced the username from ${oldName} to ${name}</h1>`);
  }
});

// DELETE
app.delete("/users/:userId", resolveIndexByUserIdMiddleWare, (req, res) => {
  const { index } = req as Request & { index: number };

  users.splice(index, 1);
  res.send(`<h1>User with id ${req.params.userId} has been deleted.</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
