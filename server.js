const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
require("dotenv-safe").config();

const app = express()
const port = 3000;
const Arquivo_Usuarios = "./api/data/users.json";
const Arquivo_Projetos = "./api/data/Projetos.json";
const Arquivo_Tarefas = "./api/data/Tarefas";
const Lista_Usuarios = "./api/data/userlist.json";

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'public', 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const blacklist = [];

function lerListaUsuario(){
  const data = fs.readFileSync(Lista_Usuarios);
  return JSON.parse(data);
}

function escreverListaUsuario(users){
  fs.writeFileSync(Lista_Usuarios, JSON.stringify(users, null, 2));
}

function lerUsuario() {
  const data = fs.readFileSync(Arquivo_Usuarios);
  return JSON.parse(data);
}

function escreverUsuario(users) {
  fs.writeFileSync(Arquivo_Usuarios, JSON.stringify(users, null, 2));
}

function excluirTarefas(ProjetoID){
  const id = ProjetoID;
  const FILE = path.join(Arquivo_Tarefas,`${id}.json`)
  fs.unlink(FILE, (err) =>{
    if (err) {
      console.error('Erro ao excluir o arquivo:', err);
    }
    return;
  })
}

function lerTarefas(ProjetoID) {
  const id = ProjetoID;
  const FILE = path.join(Arquivo_Tarefas,`${id}.json`)
  const data = fs.readFileSync(FILE);
  return JSON.parse(data);
}

function escreverTarefas(ProjetoID,Tarefas) {
  filePath = path.join(Arquivo_Tarefas,`${ProjetoID}.json`)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error('Erro ao converter o arquivo para JSON:', parseErr);
      return;
    }
    
    jsonData.Tarefas = Tarefas;
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Erro ao escrever no arquivo:', writeErr);
      } 
    });
  });
}

function criarTarefa(Projeto,Tarefas=[]) {
  const id = Projeto.id;
  const name = Projeto.Titulo;
  const FILE = path.join(Arquivo_Tarefas,`${id}.json`);
  fs.writeFileSync(FILE, JSON.stringify({nome:name,Tarefas}, null, 2));
}

function lerProjetos() {
  const data = fs.readFileSync(Arquivo_Projetos);
  return JSON.parse(data);
}

function escreverProjeto(Projetos) {
  fs.writeFileSync(Arquivo_Projetos, JSON.stringify(Projetos, null, 2));
}

// function atualizarProjeto(Projetos)

function getUserFromToken(req) {
  const token = req.cookies.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const users = JSON.parse(fs.readFileSync(Arquivo_Usuarios));
    const user = users.find((u) => u.id === decoded.id);
    return user
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
    return res.status(401).redirect("/login?error=not_logged_in");
  }

  const index = blacklist.findIndex((item) => item === token);
  if (index !== -1) {
    return res.status(401).redirect("/login?error=black_list_token");
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).redirect("/login?error=invalid_token");
    }
    req.userid = decoded.userid;
    next();
  });
}

function validar_admin(req, res, next){
  const adminUser = getUserFromToken(req);
  if (adminUser.role !== "administrador") {
    return res.render("error", { message: "Acesso não autorizado." });
  }
  next()
}

function validar_gerente(req, res, next){
  const adminUser = getUserFromToken(req);
  if (adminUser.role !== "administrador" && adminUser.role !== "gerente") {
    return res.render("error", { message: "Acesso não autorizado." });
  }
  next()
}

function encontrarProjeto(req, res, next) {
  const ProjetoID = parseInt(req.params.ProjetoID);
  const Projetos = lerProjetos()
  const Projeto = Projetos.find(p => p.id === ProjetoID);
  if (!Projeto) return res.redirect('/pesquisar-projeto');

  req.Projeto = Projeto;
  next();
}

app.get('/', (req, res) => {
    res.render('inicio')
});

app.get('/Login', (req, res) => {
  let error;
  if(req.query){
    error = {error:null}
  }
  else{
    error = req.query
  }
  res.render('login', error); 
});

app.post('/Login', (req, res) => {
  const username = req.body.username;
  const hashedPassword = sha512(req.body.password, process.env.SECRET_USERS);
  
  if (username && hashedPassword) {
    const users = lerUsuario();
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

  let users = lerUsuario();
  let listaUsuario = lerListaUsuario();

  if (users.some((u) => u.username === username)) {
    return res.status(401).render('cadastro', { error: "Nome de usuário já existe" }); 
  }

  let tamProjeto = users.length === 0 ? 0 : users[users.length-1].id;
  let id = parseInt(tamProjeto + 1);

  const newUser = {
    id,
    username,
    password: sha512(password, process.env.SECRET_USERS),
    role: "Funcionário",
  };

  users.push(newUser);
  listaUsuario.push(username);

  escreverUsuario(users);
  escreverListaUsuario(listaUsuario);

  return res.status(201).render('login',{ error: "Cadastro realizado com sucesso. Faça login." });
});

app.get("/logout", verifyJWT, (req, res) => {
  const token = req.cookies.token;

  if (token) {
    blacklist.push(token);
    res.clearCookie("token"); // Remove o cookie de autenticação
  }

  res.redirect("/");
});

app.get("/modificar-usuario",verifyJWT, validar_admin, (req, res) => {

   const page = parseInt(req.query.page) || 1;
   const pageSize = 10; // Quantos usuários por página
 
   const users = lerUsuario();
 
  //  // (Opcional) Exclui o usuário admin da listagem, se for o caso
  //  const users = allUsers.filter((u) => u.username !== "admin");
 
   const totalUsers = users.length;
   const totalPages = Math.ceil(totalUsers / pageSize);
 
   const startIndex = (page - 1) * pageSize;
   const endIndex = startIndex + pageSize;
 
   const usersOnPage = users.slice(startIndex, endIndex);
   const adminUser = getUserFromToken(req)
 
   res.render("modificar-usuario", {
     users: usersOnPage,
     currentPage: page,
     totalPages,
     adminUser
   });
});

app.post("/update-user",verifyJWT, validar_admin, (req, res) => {
  const { id, newPassword, newRole } = req.body;
  let users = lerUsuario();

  const userIndex = users.findIndex((u) => u.id == id);

  // Impede alteração do admin
  if (userIndex !== -1 && users[userIndex].username !== "admin") {
    if (newPassword) {
      users[userIndex].password = sha512(newPassword, process.env.SECRET_USERS);
    }
    if (newRole) {
      users[userIndex].role = newRole;
    }
    escreverUsuario(users);
  }

  res.redirect(`/modificar-usuario`);
});

// Nova rota para excluir usuário
app.post("/delete-user", verifyJWT, validar_admin, (req, res) => {
  const { id } = req.body;
  let users = lerUsuario();
  const userIndex = users.findIndex((u) => u.id == id);

  // Impede exclusão do admin
  if (userIndex !== -1 && users[userIndex].username !== "admin") {
    users.splice(userIndex, 1);
    escreverUsuario(users);
  }

  res.redirect(`/modificar-usuario`);
});

app.get('/Criar-Projeto', verifyJWT, validar_gerente, (req, res) => {
  const user = getUserFromToken(req);
  res.render('criar-projeto', { user:user ,error:""});
});

app.post('/Criar-Projeto', verifyJWT, validar_gerente, (req,res) => {
  const user = getUserFromToken(req);
  const { Titulo, Descricao, Prazo, Prioridade, Status } = req.body;
  const acessivel = []
  let Projetos = lerProjetos();
  let tamProjeto = Projetos.length===0 ? 0 : Projetos[Projetos.length-1].id
  let id = parseInt(tamProjeto + 1);
  const newProjeto = {
    id,
    Titulo,
    Descricao,
    Prazo,
    Prioridade,
    Status,
    acessivel,
  };
  
  Projetos.push(newProjeto);

  escreverProjeto(Projetos);

  criarTarefa(newProjeto);

  return res.status(201).render('criar-projeto', { user:user,error: "Cadastro De projeto realizado com sucesso."});
});

app.get('/projeto/:ProjetoID', verifyJWT, encontrarProjeto , (req, res) => {
  const user = getUserFromToken(req);
  Tarefas = lerTarefas(req.params.ProjetoID);
  res.render('task', {
    user,
    ProjetoID: req.params.ProjetoID,
    Projeto: Tarefas.nome,
    Tarefas: Tarefas.Tarefas,
  });
});

app.post('/projeto/:ProjetoID/del', verifyJWT, encontrarProjeto , (req, res) => {
  let projetos = lerProjetos();
  const filteredProjetos = projetos.filter(projeto => projeto.id != req.params.ProjetoID);
  const newProjetos = Array.isArray(filteredProjetos) ? filteredProjetos : [filteredProjetos].filter(Boolean);
  excluirTarefas(req.params.ProjetoID);
  escreverProjeto(newProjetos);
  res.redirect('/Pesquisar-Projeto');
});

app.get('/projeto/:ProjetoID/new',verifyJWT, encontrarProjeto, validar_gerente,(req, res) => {
  let user = getUserFromToken(req)
  res.render('new-task', { ProjetoID: req.params.ProjetoID,user });
});

app.post('/projeto/:ProjetoID/add',verifyJWT, encontrarProjeto, validar_gerente,(req, res) => {
  const { title, description, responsible, deadline, status } = req.body;
  const taks = lerTarefas(req.params.ProjetoID).Tarefas;
  const Projetos = lerProjetos()
  let tamProjeto = taks.length === 0 ? 0 : taks[taks.length-1].id
  let id = parseInt(tamProjeto + 1);
  const newTask = {
    id,
    title,
    description,
    responsible,
    deadline,
    status,
  };
  let Projeto = Projetos.filter(projeto => projeto.id === parseInt(req.params.ProjetoID));

  if(!Projeto[0].acessivel.includes(responsible)){
    Projeto[0].acessivel.push(responsible)
  }
  taks.push(newTask);
  
  escreverTarefas(req.params.ProjetoID,taks)
  escreverProjeto(Projetos)
  res.redirect(`/projeto/${req.params.ProjetoID}`);
});

app.get('/projeto/:ProjetoID/edit/:taskId', verifyJWT, encontrarProjeto,(req, res) => {
  user = getUserFromToken(req)
  const taskId = parseInt(req.params.taskId);
  const ProjetoID = parseInt(req.params.ProjetoID);
  const Tarefas = lerTarefas(ProjetoID)
  const task = Tarefas.Tarefas.find(task => task.id === taskId);
  if (!task) return res.redirect(`/Projetos/${ProjetoID}`);
  res.render('edit-task', { Projeto: req.Projeto, task, user });
});

// Rota para salvar as alterações de uma tarefa de um projeto
app.post('/projeto/:ProjetoID/edit/:taskId', verifyJWT, encontrarProjeto,(req, res) => {
  const taskId = parseInt(req.params.taskId);
  const ProjetoID = parseInt(req.params.ProjetoID);
  const { title, description, responsible, deadline, status } = req.body;
  Tarefas = lerTarefas(ProjetoID)
  Tarefas.Tarefas = Tarefas.Tarefas.map(task => {
    if (task.id === taskId) {
      return { ...task, title, description, responsible, deadline, status };
    }
    return task;
  });

  let projetos = lerProjetos();
  
  escreverTarefas(ProjetoID,Tarefas.Tarefas)
  res.redirect(`/projeto/${req.Projeto.id}`);
});

app.post('/projeto/:ProjetoID/delete/:taskId', verifyJWT, encontrarProjeto, validar_gerente,(req, res) => {
  const taskId = parseInt(req.params.taskId);
  const ProjetoID = parseInt(req.params.ProjetoID);
  const Tarefas = lerTarefas(ProjetoID)
  const filteredTarefas = Tarefas.Tarefas.filter(task => task.id != taskId);
  const ProjetoData = Array.isArray(filteredTarefas) ? filteredTarefas : [filteredTarefas].filter(Boolean);
  
  escreverTarefas(ProjetoID,ProjetoData)
  
  res.redirect(`/projeto/${ProjetoID}`);
});

app.post('/api/projetos', verifyJWT, (req, res) => {
  const { status, prioridade, Titulo} = req.body; 
  const user = getUserFromToken(req);
  let projeto = lerProjetos()
  let accessibleProjetos = projeto.filter(
    (Projeto) =>
      Projeto.acessivel.includes(user.username) ||
      ["administrador", "gerente"].includes(user.role)
  );
  // Filtro por status
  if (status && status !== 'Todos') {
    accessibleProjetos = accessibleProjetos.filter(projeto => projeto.Status === status);
  }

  // Filtro por prioridade
  if (prioridade && prioridade !== 'Todos') {
    accessibleProjetos = accessibleProjetos.filter(projeto => projeto.Prioridade === prioridade);
  }

  // Filtro por nome
  if (Titulo && Titulo.trim() !== '') {
    accessibleProjetos = accessibleProjetos.filter(projeto => projeto.Titulo.toLowerCase().includes(Titulo.toLowerCase()));
  }
  res.json(accessibleProjetos);
});

app.get('/api/nome', verifyJWT, (req, res) => {
  nomes = lerListaUsuario()
  res.json(nomes);
});

app.get('/Pesquisar-Projeto',verifyJWT, (req, res) => {
  const user = getUserFromToken(req);
  res.render('pesquisar-projeto', { user:user });
});

app.get('/Pesquisar-Tarefa',verifyJWT, (req, res) => {
  const user = getUserFromToken(req);
  res.render('pesquisar-tarefa', { user:user });
});

app.listen(port, () => {
console.log(`Servidor rodando em http://localhost:${port}`);
});