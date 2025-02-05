const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
require("dotenv-safe").config();

const app = express()
const port = 3000;
const USERS_FILE = "./api/data/users.json";
const Projects_FILE = "./api/data/projects.json";
const Task_FILE = "./api/data/tasks.json";
const dataFilePath = path.join(__dirname, 'public', 'data/tasks.json');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'public', 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const blacklist = [];

function readUsers() {
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readTasks() {
  const data = fs.readFileSync(Task_FILE);
  return JSON.parse(data);
}

function writeTasks(tasks) {
  fs.writeFileSync(Task_FILE, JSON.stringify(tasks, null, 2));
}

function readProjects() {
  const data = fs.readFileSync(Projects_FILE);
  return JSON.parse(data);
}

function writeProjects(Projects) {
  fs.writeFileSync(Projects_FILE, JSON.stringify(Projects, null, 2));
}

function getUserFromToken(req) {
  const token = req.cookies.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    return users.find((u) => u.id === decoded.id);
  } catch (err) {
    return null;
  }
}

const sha512 = (pwd, key) => {
  const hash = crypto.createHmac("sha512", key);
  hash.update(pwd);
  return hash.digest("hex");
};

function verifyJWT(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).render("login", { error: "Token não encontrado." });
  }

  const index = blacklist.findIndex((item) => item === token);
  if (index !== -1) {
    return res.status(401).end("Token inválido.");
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).end("Token inválido.");
    }
    req.userid = decoded.userid;
    next();
  });
}

app.get('/', (req, res) => {
    res.render('inicio')
});

app.get('/Login', (req, res) => {
    res.render('login', { error: null }); 
});

app.post('/Login', (req, res) => {
  const username = req.body.username;
  const hashedPassword = sha512(req.body.password, process.env.SECRET_USERS);
  
  if (username && hashedPassword) {
    const users = readUsers();
    const user = users.find(
      (item) =>  item.username === username && item.password === hashedPassword
    );
    
    if (user) {
      const token = jwt.sign({ id:user.id}, process.env.SECRET, {
        expiresIn: 300,
      });
      res.cookie("token", token, {
        httpOnly: true,  // Evita acesso ao cookie via scripts no browser
        secure: false,   // Ative "true" se usar HTTPS
        maxAge: 300000   // Tempo de validade em milissegundos
      });
      return res.render("pesquisar-projeto", {user});
    }
    res.status(401).render("login", { error: "Usuário ou senha incorretos." });
  }
});

app.get('/Cadastro', (req, res) => {
  res.render('cadastro', { error: null }); 
});

app.post("/Cadastro", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(401).render('cadastro', { error: "As senhas não coincidem" }); 
  }

  let users = readUsers();

  if (users.some((u) => u.username === username)) {
    return res.status(401).render('cadastro', { error: "Nome de usuário já existe" }); 
  }

  const newUser = {
    id: users.length + 1,
    username,
    password: sha512(password, process.env.SECRET_USERS),
    role: "colaborador",
  };

  users.push(newUser);
  writeUsers(users);

  return res.status(201).render('login',{ error: "Cadastro realizado com sucesso. Faça login." });
});

app.get("/logout", (req, res) => {
  const token = req.cookies.token;

  if (token) {
    blacklist.push(token);
    res.clearCookie("token"); // Remove o cookie de autenticação
  }

  res.redirect("/");
});

app.get("/modificar-usuario",verifyJWT, (req, res) => {
  // // const users = readUsers().filter((u) => u.username !== "admin");
  // const user = getUserFromToken(req)

  // // if (user.role !== "administrador") {
  // //   return res.render("error", { message: "Acesso não autorizado." });
  // // }

  // // res.render("modificar-usuario", { user,users });

  //  // Número da página atual (por padrão, 1)
   const page = parseInt(req.query.page) || 1;
   const pageSize = 10; // Quantos usuários por página
 
  //  // Lê todos os usuários do arquivo JSON
   const allUsers = readUsers();
 
  //  // (Opcional) Exclui o usuário admin da listagem, se for o caso
   const users = allUsers.filter((u) => u.username !== "admin");
 
  //  // Total de usuários (já filtrados)
   const totalUsers = users.length;
  //  // Cálculo do número total de páginas
   const totalPages = Math.ceil(totalUsers / pageSize);
 
  //  // Cálculo dos índices de corte para slice
   const startIndex = (page - 1) * pageSize;
   const endIndex = startIndex + pageSize;
 
  //  // Pega apenas os usuários da página atual
   const usersOnPage = users.slice(startIndex, endIndex);
   const adminUser = getUserFromToken(req)
  //  // Verifica se o usuário atual é admin
   if (adminUser.role !== "administrador") {
     return res.render("error", { message: "Acesso não autorizado." });
   }
 
  //  // Renderiza a view, passando:
  //  // - Os usuários da página
  //  // - A página atual
  //  // - O total de páginas
   res.render("modificar-usuario", {
     users: usersOnPage,
     currentPage: page,
     totalPages,
     adminUser
   });
});

app.post("/update-user", (req, res) => {
  const { id, newPassword, newRole } = req.body;
  let users = readUsers();

  const userIndex = users.findIndex((u) => u.id == id);

  // Impede alteração do admin
  if (userIndex !== -1 && users[userIndex].username !== "admin") {
    if (newPassword) {
      users[userIndex].password = sha512(newPassword, process.env.SECRET_USERS);
    }
    if (newRole) {
      users[userIndex].role = newRole;
    }
    writeUsers(users);
  }

  res.redirect(`/modificar-usuario`);
});

// Nova rota para excluir usuário
app.post("/delete-user", (req, res) => {
  const { id } = req.body;
  let users = readUsers();
  const userIndex = users.findIndex((u) => u.id == id);

  // Impede exclusão do admin
  if (userIndex !== -1 && users[userIndex].username !== "admin") {
    users.splice(userIndex, 1);
    writeUsers(users);
  }

  res.redirect(`/modificar-usuario`);
});

app.get('/Criar-Projeto',verifyJWT, (req, res) => {
  const username = getUserFromToken(req);
  res.render('criar-projeto', { user:username ,error:""});
});

app.post('/Criar-Projeto', (req,res) => {
  const username = getUserFromToken(req);
  const { Titulo, Descricao, Prazo, Prioridade, Status } = req.body;
  
  let projects = readProjects();

  const newProject = {
    id: projects.length + 1,
    Titulo,
    Descricao,
    Prazo,
    Prioridade,
    Status,
  };
  projects.push(newProject);
  writeProjects(projects);

  return res.status(201).render('criar-projeto', { user:username,error: "Cadastro De projeto realizado com sucesso."});
});

app.post('/api/projetos', (req, res) => {
  const { status, prioridade, Titulo} = req.body; 
  const user = getUserFromToken(req);
  let projeto = readProjects()
  let accessibleProjects = projeto.filter(
    (project) =>
      project.acessivel.length === 0 ||
      project.acessivel.includes(user.id) ||
      ["administrador", "gerente"].includes(user.role)
  );
  // Filtro por status
  if (status && status !== 'Todos') {
    accessibleProjects = accessibleProjects.filter(projeto => projeto.Status === status);
  }

  // Filtro por prioridade
  if (prioridade && prioridade !== 'Todos') {
    accessibleProjects = accessibleProjects.filter(projeto => projeto.Prioridade === prioridade);
  }

  // Filtro por nome
  if (Titulo && Titulo.trim() !== '') {
    accessibleProjects = accessibleProjects.filter(projeto => projeto.Titulo.toLowerCase().includes(Titulo.toLowerCase()));
  }
  res.json(accessibleProjects);
});

app.get('/Pesquisar-Projeto',verifyJWT, (req, res) => {
  const username = getUserFromToken(req);
  res.render('pesquisar-projeto', { user:username });
});

app.get('/Pesquisar-Tarefa',verifyJWT, (req, res) => {
  const username = getUserFromToken(req);
  res.render('pesquisar-tarefa', { user:username });
});

app.listen(port, () => {
console.log(`Servidor rodando em http://localhost:${port}`);
});