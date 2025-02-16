const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
require("dotenv-safe").config();

const app = express();
const port = 3001;
const Arquivo_Usuarios = "users.json";
const Arquivo_Projetos = "Projetos.json";
const Arquivo_Tarefas = "Tarefas";
const Lista_Usuarios = "userlist.json";

app.use(express.json());

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

const sha512 = (pwd, key) => {
  const hash = crypto.createHmac("sha512", key);
  hash.update(pwd);
  return hash.digest("hex");
};

// app.options('*', (req, res) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     return res.sendStatus(200);
//   });


app.get("/ListaUsuarios",(req,res) =>{
    const ListaUsuarios = lerListaUsuario();
    return res.status(200).json(ListaUsuarios)
})

app.get("/Usuarios",(req,res) =>{
    const usuarios = lerUsuario();
    return res.status(200).json(usuarios)
})

app.post("/Usuarios", (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(401).json({ error: "As senhas não coincidem" }); 
    }

    let users = lerUsuario();
    let listaUsuario = lerListaUsuario();

    if (users.some((u) => u.username === username)) {
        return res.status(401).json({ error: "Nome de usuário já existe" }); 
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
    res.status(201).end();
})

app.put("/Usuarios", (req, res) => {
    const { id, newPassword, newRole } = req.body;
    let users = lerUsuario();
  
    const userIndex = users.findIndex((u) => u.id == id);

    if (newPassword) {
      users[userIndex].password = sha512(newPassword, process.env.SECRET_USERS);
    }
    if (newRole) {
      users[userIndex].role = newRole;
    }
    escreverUsuario(users);
    return res.status(200).end();
  });

app.patch("/Usuarios", (req, res) => {
    const { id } = req.body;
    let users = lerUsuario();
    let listaUsers = lerListaUsuario();
    const userIndex = users.findIndex((u) => u.id == id);
    const listUserIndex = listaUsers.findIndex((u) => u.username == users[userIndex].username);
    
    if (userIndex === -1) {
      return res.status(404);
    }
  
    // Impede desativação do admin
    if (users[userIndex].username === "admin") {
      return res.status(403);
    }
  
    users.splice(userIndex, 1);
    listaUsers.splice(listUserIndex,1);
    escreverUsuario(users);
    escreverListaUsuario(listaUsers);
    return res.status(200).end();
});

app.get("/Projeto",(req,res) =>{
  const projetos = lerProjetos();
  return res.status(200).json(projetos)
})

app.post("/Projeto",(req,res) =>{
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
    return res.status(200).end();
})

app.get("/Projeto/:ProjetoID",(req,res) =>{
    const ProjetoID = req.params.ProjetoID;
    const Tarefas = lerTarefas(ProjetoID);
    return res.status(200).json(Tarefas)
})

app.post("/Projeto/:ProjetoID",(req,res) =>{
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
  return res.status(200).end();
})

app.patch("/Projeto/:ProjetoID", (req,res) =>{
  let projetos = lerProjetos();
  const filteredProjetos = projetos.filter(projeto => projeto.id != req.params.ProjetoID);
  const newProjetos = Array.isArray(filteredProjetos) ? filteredProjetos : [filteredProjetos].filter(Boolean);
  excluirTarefas(req.params.ProjetoID);
  escreverProjeto(newProjetos);
  return res.status(200).end();
});

app.patch('/Projeto/:ProjetoID/edit/:taskId', (req, res) => {
  const { ProjetoID, taskId } = req.params;
  const { title, description, responsible, deadline, status } = req.body;
  // Lê as tarefas do projeto (supondo que lerTarefas retorne um objeto com array Tarefas)
  let tarefasData = lerTarefas(ProjetoID); // Ex.: { Tarefas: [ ... ] }

  // Atualiza a tarefa que tiver id igual a taskId
  tarefasData.Tarefas = tarefasData.Tarefas.map(task => {
    if (task.id == taskId) {
      return { ...task, title, description, responsible, deadline, status };
    }
    return task;
  });

  // Salva as alterações
  escreverTarefas(ProjetoID, tarefasData.Tarefas);
  return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
});

app.patch('/Projeto/:ProjetoID/delete/:taskId', (req, res) => {
  const { ProjetoID, taskId } = req.params;
  // Lê as tarefas do projeto
  let tarefasData = lerTarefas(ProjetoID);

  // Filtra as tarefas, removendo a de id igual a taskId
  const filteredTarefas = tarefasData.Tarefas.filter(task => task.id != taskId);

  // Salva o novo array de tarefas
  escreverTarefas(ProjetoID, filteredTarefas);

  return res.status(200).json({ message: "Tarefa deletada com sucesso" });
});

app.post('/api/projetos', (req, res) => {
  const { status, prioridade, Titulo, user } = req.body;
  let projetos = lerProjetos(); // Função que lê os projetos
  let accessibleProjetos = projetos.filter(
    (projeto) =>
      projeto.acessivel.includes(user.username) ||
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

  // Filtro por nome (Título)
  if (Titulo && Titulo.trim() !== '') {
    accessibleProjetos = accessibleProjetos.filter(projeto =>
      projeto.Titulo.toLowerCase().includes(Titulo.toLowerCase())
    );
  }
  return res.status(200).json(accessibleProjetos);
});

app.get("/ListUsuarios",(req,res) =>{
    const listUsuarios = lerListaUsuario()
    return res.status(200).json(listUsuarios)
})

app.listen(port, () => {
    console.log(`Servidor C rodando na porta ${port}`);
  });

