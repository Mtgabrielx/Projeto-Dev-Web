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

// Funções de leitura e escrita de arquivos

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
  const FILE = path.join(Arquivo_Tarefas, `${ProjetoID}.json`);
  fs.unlink(FILE, (err) => {
    if (err) {
      console.error('Erro ao excluir o arquivo:', err);
    }
  });
}

function lerTarefas(ProjetoID) {
  const FILE = path.join(Arquivo_Tarefas, `${ProjetoID}.json`);
  const data = fs.readFileSync(FILE);
  return JSON.parse(data);
}

function escreverTarefas(ProjetoID, Tarefas) {
  const filePath = path.join(Arquivo_Tarefas, `${ProjetoID}.json`);
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

function criarTarefa(Projeto, Tarefas = []) {
  const id = Projeto.id;
  const name = Projeto.Titulo;
  const FILE = path.join(Arquivo_Tarefas, `${id}.json`);
  fs.writeFileSync(FILE, JSON.stringify({ nome: name, Tarefas }, null, 2));
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

app.get("/ListaUsuarios", (req, res) => {
  try {
    const ListaUsuarios = lerListaUsuario();
    return res.status(200).json(ListaUsuarios);
  } catch (error) {
    console.error("Erro ao ler ListaUsuarios:", error);
    return res.status(500);
  }
}); 

app.get("/Usuarios", (req, res) => {
  try {
    const usuarios = lerUsuario();
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Erro ao ler usuários:", error);
    return res.status(500);
  }
});

app.post("/Usuarios", (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(401).json({ error: "As senhas não coincidem" });
    }

    let users = lerUsuario();
    let listaUsuario = lerListaUsuario();

    if (users.some((u) => u.username === username)) {
      return res.status(401).json({ error: "Nome de usuário já existe" });
    }

    let tamProjeto = users.length === 0 ? 0 : users[users.length - 1].id;
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
    return res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500);
  }
});

app.put("/Usuarios", (req, res) => {
  try {
    const { id, newPassword, newRole } = req.body;
    let users = lerUsuario();

    const userIndex = users.findIndex((u) => u.id == id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (newPassword) {
      users[userIndex].password = sha512(newPassword, process.env.SECRET_USERS);
    }
    if (newRole) {
      users[userIndex].role = newRole;
    }
    escreverUsuario(users);
    return res.status(200).json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500);
  }
});

app.delete("/Usuarios", (req, res) => {
  try {
    const { id } = req.body;
    let users = lerUsuario();
    let listaUsers = lerListaUsuario();
    const userIndex = users.findIndex((u) => u.id == id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    if (users[userIndex].username === "admin") {
      return res.status(403).json({ error: "Não é permitido excluir o admin" });
    }
    const listUserIndex = listaUsers.findIndex((u) => u.username == users[userIndex].username);
    users.splice(userIndex, 1);
    if (listUserIndex > -1) {
      listaUsers.splice(listUserIndex, 1);
    }
    escreverUsuario(users);
    escreverListaUsuario(listaUsers);
    return res.status(200).json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return res.status(500);
  }
});

app.get("/Projeto", (req, res) => {
  try {
    const projetos = lerProjetos();
    return res.status(200).json(projetos);
  } catch (error) {
    console.error("Erro ao ler projetos:", error);
    return res.status(500);
  }
});

app.post("/Projeto", (req, res) => {
  try {
    const { Titulo, Descricao, Prazo, Prioridade, Status } = req.body;
    const acessivel = [];
    let Projetos = lerProjetos();
    let tamProjeto = Projetos.length === 0 ? 0 : Projetos[Projetos.length - 1].id;
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
    return res.status(201).json({ message: "Projeto criado com sucesso" });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return res.status(500);
  }
});

app.get("/Projeto/:ProjetoID", (req, res) => {
  try {
    const ProjetoID = req.params.ProjetoID;
    const Tarefas = lerTarefas(ProjetoID);
    return res.status(200).json(Tarefas);
  } catch (error) {
    console.error("Erro ao ler tarefas do projeto:", error);
    return res.status(500);
  }
});

app.post("/Projeto/:ProjetoID", (req, res) => {
  try {
    const { title, description, responsible, deadline, status } = req.body;
    const tarefasData = lerTarefas(req.params.ProjetoID);
    let taks = tarefasData.Tarefas || [];
    const Projetos = lerProjetos();
    let tamProjeto = taks.length === 0 ? 0 : taks[taks.length - 1].id;
    let id = parseInt(tamProjeto + 1);
    const newTask = {
      id,
      title,
      description,
      responsible,
      deadline,
      status,
    };

    let Projeto = Projetos.find(projeto => projeto.id === parseInt(req.params.ProjetoID));
    if (!Projeto) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }
    if (!Projeto.acessivel.includes(responsible)) {
      Projeto.acessivel.push(responsible);
    }
    taks.push(newTask);
    escreverTarefas(req.params.ProjetoID, taks);
    escreverProjeto(Projetos);
    return res.status(201).json({ message: "Tarefa criada com sucesso" });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res.status(500);
  }
});

app.delete("/Projeto/:ProjetoID", (req, res) => {
  try {
    let projetos = lerProjetos();
    const filteredProjetos = projetos.filter(projeto => projeto.id != req.params.ProjetoID);
    const newProjetos = Array.isArray(filteredProjetos) ? filteredProjetos : [filteredProjetos].filter(Boolean);
    excluirTarefas(req.params.ProjetoID);
    escreverProjeto(newProjetos);
    return res.status(200).json({ message: "Projeto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    return res.status(500);
  }
});

app.patch('/Projeto/:ProjetoID/edit/:taskId', (req, res) => {
  try {
    const { ProjetoID, taskId } = req.params;
    const { title, description, responsible, deadline, status } = req.body;
    let tarefasData = lerTarefas(ProjetoID);
    if (!tarefasData || !Array.isArray(tarefasData.Tarefas)) {
      return res.status(404).json({ error: "Tarefas não encontradas" });
    }
    let found = false;
    tarefasData.Tarefas = tarefasData.Tarefas.map(task => {
      if (task.id == taskId) {
        found = true;
        return { ...task, title, description, responsible, deadline, status };
      }
      return task;
    });
    if (!found) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    escreverTarefas(ProjetoID, tarefasData.Tarefas);
    return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return res.status(500);
  }
});

app.delete('/Projeto/:ProjetoID/delete/:taskId', (req, res) => {
  try {
    const { ProjetoID, taskId } = req.params;
    let tarefasData = lerTarefas(ProjetoID);
    if (!tarefasData || !Array.isArray(tarefasData.Tarefas)) {
      return res.status(404).json({ error: "Tarefas não encontradas" });
    }
    const filteredTarefas = tarefasData.Tarefas.filter(task => task.id != taskId);
    if (filteredTarefas.length === tarefasData.Tarefas.length) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    escreverTarefas(ProjetoID, filteredTarefas);
    return res.status(200).json({ message: "Tarefa deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    return res.status(500);
  }
});

app.get("/ListUsuarios", (req, res) => {
  try {
    const listUsuarios = lerListaUsuario();
    return res.status(200).json(listUsuarios);
  } catch (error) {
    console.error("Erro ao ler lista de usuários:", error);
    return res.status(500);
  }
});

app.listen(port, () => {
  console.log(`Servidor C rodando na porta ${port}`);
});
