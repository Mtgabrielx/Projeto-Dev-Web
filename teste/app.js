const express = require("express");
const fs = require("fs");
const md5 = require("md5");

const app = express();
const PORT = 3000;
const USERS_FILE = "./users.json";
const PROJECTS_FILE = "./api/projects.json";

// Funções de manipulação de arquivos
function readProjects() {
  const data = fs.readFileSync(PROJECTS_FILE);
  return JSON.parse(data);
}

function readUsers() {
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// Página de login
app.get("/", (req, res) => {
  res.render("login");
});

// Autenticação
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = md5(password);
  const users = readUsers();

  const user = users.find(
    (u) => u.username === username && u.password === hashedPassword
  );

  if (user) {
    res.render("dashboard", { user });
  } else {
    res.render("error", { message: "Usuário ou senha incorretos." });
  }
});

// Registro de usuários
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("error", { message: "As senhas não coincidem." });
  }

  let users = readUsers();

  if (users.some((u) => u.username === username)) {
    return res.render("error", { message: "Nome de usuário já existe." });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password: md5(password),
    role: "colaborador",
  };

  users.push(newUser);
  writeUsers(users);

  res.render("dashboard", { user: newUser });
});

// Gerenciamento de usuários (somente admin)
app.get("/manage-users", (req, res) => {
  const users = readUsers().filter((u) => u.username !== "admin");
  const adminUser = readUsers().find((u) => u.username === req.query.admin);

  if (!adminUser || adminUser.role !== "administrador") {
    return res.render("error", { message: "Acesso não autorizado." });
  }

  res.render("manage-users", { users });
});

app.post("/update-user", (req, res) => {
  const { id, newPassword, newRole } = req.body;
  let users = readUsers();

  const userIndex = users.findIndex((u) => u.id == id);

  // Impede alteração do admin
  if (userIndex !== -1 && users[userIndex].username !== "admin") {
    if (newPassword) {
      users[userIndex].password = md5(newPassword);
    }
    if (newRole) {
      users[userIndex].role = newRole;
    }
    writeUsers(users);
  }

  res.redirect(`/manage-users?admin=admin`);
});

// Rota API que retorna os projetos
app.get("/api/projects", (req, res) => {
  const userId = parseInt(req.query.id);
  const users = readUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(403).json({ message: "Acesso negado." });
  }

  const allProjects = readProjects();

  let accessibleProjects = allProjects.filter(
    (project) =>
      project.allowedUsers.length === 0 ||
      project.allowedUsers.includes(userId) ||
      ["administrador", "gerente"].includes(user.role)
  );

  res.json(accessibleProjects);
});

// Página de projetos dinâmica
app.get("/projects", (req, res) => {
  const userId = parseInt(req.query.id);
  const users = readUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.render("error", { message: "Usuário não encontrado." });
  }

  res.render("projects", { user });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
