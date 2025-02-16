const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
require("dotenv-safe").config();

const app = express()
const port = 3000;
const serverAPI = 'http://localhost:3001';

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'public', 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const blacklist = [];

async function lerListaUsuario(){
  try {
    const response = await fetch(serverAPI + '/ListUsuarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return []; 
  }
}

async function lerUsuario() {
  try {
    const response = await fetch(serverAPI + '/Usuarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const statusServer = response.status; // Captura o status da resposta
    const data = await response.json();   // Converte a resposta para JSON
    
    return data;  // Retorna os usuários para quem chamou essa função
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
}

async function lerTarefas(ProjetoID) {
  try {
    const response = await fetch(serverAPI + '/Projeto/' + ProjetoID, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }); 
    const data = await response.json();   // Converte a resposta para JSON
    return data;  // Retorna os usuários para quem chamou essa função
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
}

async function lerProjetos() {
  try {
    const response = await fetch(serverAPI + '/Projeto', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const statusServer = response.status; // Captura o status da resposta
    const data = await response.json();   // Converte a resposta para JSON
    
    return data;  
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return []; 
  }
  // const data = fs.readFileSync(Arquivo_Projetos);
  // return JSON.parse(data);
}

async function getUserFromToken( req){
  const token = req.cookies.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const users = await lerUsuario();
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
    return res.status(401).redirect("/login?msg=not_logged_in");
  }

  const index = blacklist.findIndex((item) => item === token);
  if (index !== -1) {
    return res.status(401).redirect("/login?msg=black_list_token");
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).redirect("/login?msg=invalid_token");
    }
    req.userid = decoded.userid;
    next();
  });
}

async function validar_admin(req, res, next){
  const adminUser = await getUserFromToken(req);
  if (adminUser.role !== "administrador") {
    return res.render("error", { message: "Acesso não autorizado." });
  }
  next()
}

async function validar_gerente(req, res, next){
  const adminUser = await getUserFromToken(req);
  if (adminUser.role !== "administrador" && adminUser.role !== "gerente") {
    return res.render("error", { message: "Acesso não autorizado." });
  }
  next()
}

async function validarUsuario(req,res,next) {
  const user = await getUserFromToken(req);
  const ProjetoID = parseInt(req.params.ProjetoID);
  const Projetos = await lerProjetos();
  let accessibleProjetos = Projetos.filter(
    (projeto) => ["administrador", "gerente"].includes(user.role) ||
      ( ProjetoID===projeto.id && projeto.acessivel.includes(user.username))
      
  );
  if (accessibleProjetos.length === 0) {
    return res.render("error", { message: "Acesso não autorizado." });
  }
  next();
}

async function encontrarProjeto(req, res, next) {
  const ProjetoID = parseInt(req.params.ProjetoID);
  const Projetos = await lerProjetos()
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

app.post('/Login', async (req, res) => {
  const username = req.body.username;
  const hashedPassword = sha512(req.body.password, process.env.SECRET_USERS);
  
  if (username && hashedPassword) {
    const users = await lerUsuario();
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

app.post("/Cadastro", async (req, res) => {
  try{
    const cadastroPost = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(req.body),
    };
    fetch(serverAPI + '/Usuarios',cadastroPost).then(async (response) => {
      const statusServer = response.status; // Captura o status da resposta
      if(statusServer === 401){
        const msg = await response.json(); // Captura o corpo da resposta JSON  
        return res.status(401).render('cadastro',msg); 
      }
      else{
        return res.status(200).redirect('/login?error=Sucess');
      }
    });
  }
  catch(error){
    console.error(error);
    res.status(500).render('cadastro', { error: "Erro na comunicação com o Servidor C" });
  }
});

app.get("/logout", verifyJWT, (req, res) => {
  const token = req.cookies.token;

  if (token) {
    blacklist.push(token);
    res.clearCookie("token"); // Remove o cookie de autenticação
  }

  res.redirect("/");
});

app.get( "/modificar-usuario",verifyJWT, validar_admin, async (req, res) => {

   const page = parseInt(req.query.page) || 1;
   const pageSize = 10; // Quantos usuários por página
   const users = await lerUsuario();

   const totalUsers = users.length;
   const totalPages = Math.ceil(totalUsers / pageSize);
 
   const startIndex = (page - 1) * pageSize;
   const endIndex = startIndex + pageSize;
 
   const usersOnPage = users.slice(startIndex, endIndex);
   const adminUser = await getUserFromToken(req)
 
   res.render("modificar-usuario", {
     users: usersOnPage,
     currentPage: page,
     totalPages,
     adminUser
   });
});

app.post("/update-user",verifyJWT, validar_admin, async (req, res) => {
  const { id, newPassword, newRole } = req.body;
  
  try {
    const response = await fetch(serverAPI + "/Usuarios", {
      method: "put",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ id, newPassword, newRole }),
    });

    if (response.status === 200) {
      return res.redirect(`/modificar-usuario`);
    } else {
      return res.status(response.status).json(data);
    }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ error: "Erro interno no servidor B" });

  }
});

// Nova rota para excluir usuário
app.post("/delete-user", verifyJWT, validar_admin, async (req, res) => {
  const { id } = req.body;

  try {
    const response = await fetch(serverAPI + "/Usuarios", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ id }),
    });

    // const data = await response.json();

    if (response.status === 200) {
      return res.redirect(`/modificar-usuario`);
    } else {
      return res.status(response.status)
    }
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    return res.status(500).json({ error: "Erro interno no servidor B" });
  }
});

app.get('/Criar-Projeto', verifyJWT, validar_gerente, async (req, res) => {
  const user = await getUserFromToken(req);
  res.render('criar-projeto', { user:user ,error:""});
});

app.post('/Criar-Projeto', verifyJWT, validar_gerente, async (req,res) => {
  const user = await getUserFromToken(req);
  try{
    const cadastroPost = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(req.body),
    };
    fetch(serverAPI + '/Projeto',cadastroPost).then(async (response) => {
      const statusServer = response.status; // Captura o status da resposta
      if(statusServer === 200){
        return res.status(201).render('criar-projeto', { user:user,error: "Cadastro De projeto realizado com sucesso."});
      }
    });
  }
  catch(error){
    console.error(error);
    res.status(500).render('cadastro', { error: "Erro na comunicação com o Servidor C" });
  }
});

app.get('/projeto/:ProjetoID', verifyJWT, encontrarProjeto, validarUsuario , async (req, res) => {
  const user = await getUserFromToken(req);
  Tarefas = await lerTarefas(req.params.ProjetoID);
  res.render('task', {
    user,
    ProjetoID: req.params.ProjetoID,
    Projeto: Tarefas.nome,
    Tarefas: Tarefas.Tarefas,
  });
});

app.post('/projeto/:ProjetoID/del', verifyJWT, encontrarProjeto, validar_gerente ,  async (req, res) => {
  try {
    const response = await fetch(serverAPI + '/Projeto/' + req.params.ProjetoID, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }); 

    return res.redirect('/Pesquisar-Projeto');

  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return res.redirect('/Pesquisar-Projeto');
  }
  
});

app.get('/projeto/:ProjetoID/new',verifyJWT, encontrarProjeto, validar_gerente, async (req, res) => {
  let user = await getUserFromToken(req)
  res.render('new-task', { ProjetoID: req.params.ProjetoID,user });
});

app.post('/projeto/:ProjetoID/add',verifyJWT, encontrarProjeto, validar_gerente, async (req, res) => {
  try{
    const projetoPost = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(req.body),
    };
    fetch(serverAPI + '/Projeto/' + req.params.ProjetoID,projetoPost).then(async (response) => {
      const statusServer = response.status; // Captura o status da resposta
      res.redirect(`/projeto/${req.params.ProjetoID}`);
    });
  }
  catch(error){
    console.error(error);
    res.status(500).render('cadastro', { error: "Erro na comunicação com o Servidor C" });
  }

});

app.get('/projeto/:ProjetoID/edit/:taskId', verifyJWT, validarUsuario, encontrarProjeto,async(req, res) => {
  user = await getUserFromToken(req)
  const taskId = parseInt(req.params.taskId);
  const ProjetoID = parseInt(req.params.ProjetoID);
  const Tarefas = await lerTarefas(ProjetoID,user.username)
  const taskName = Tarefas.nome;
  const task = Tarefas.Tarefas.find(task => task.id === taskId);
  if (!task) return res.redirect(`/Projetos/${ProjetoID}`);
  res.render('edit-task', { Projeto: req.Projeto, task, taskName, user });
});

// Rota para salvar as alterações de uma tarefa de um projeto
app.post('/projeto/:ProjetoID/edit/:taskId', verifyJWT, validarUsuario, encontrarProjeto,async(req, res) => {
  const { ProjetoID, taskId } = req.params;
  // O payload com os dados da tarefa editada:
  const payload = {
    title: req.body.title,
    description: req.body.description,
    responsible: req.body.responsible,
    deadline: req.body.deadline,
    status: req.body.status
  };
  try {
    const response = await fetch(`${serverAPI}/Projeto/${ProjetoID}/edit/${taskId}`, {
      method: 'PATCH',  // Usando PATCH para atualização parcial
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(payload)
    });
    // Opcional: processa a resposta vinda do Servidor C (ex: log, verificação de erros)
    res.redirect(`/projeto/${ProjetoID}`);
  } catch (error) {
    console.error("Erro ao editar tarefa:", error);
    res.status(500).render('error', { error: "Erro ao editar a tarefa" });
  }

});

app.post('/projeto/:ProjetoID/delete/:taskId', verifyJWT, encontrarProjeto, validar_gerente, async (req, res) => {
  const { ProjetoID, taskId } = req.params;
  try {
    const response = await fetch(`${serverAPI}/Projeto/${ProjetoID}/delete/${taskId}`, {
      method: 'PATCH',  // Usando PATCH para atualizar (exclusão lógica)
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      // Aqui você pode enviar um payload opcional, se necessário. Por exemplo:
      body: JSON.stringify({ action: 'delete' })
    });
    res.redirect(`/projeto/${ProjetoID}`);
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    res.status(500).render('error', { error: "Erro ao deletar a tarefa" });
  }
});

// MUDAR PARA GET

app.post('/api/projetos', verifyJWT, async (req, res) => {
  const user = await getUserFromToken(req)
  const payload = { ...req.body, user };
  try {
    const response = await fetch(`${serverAPI}/api/projetos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
  
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Erro ao filtrar projetos:", error);
    res.status(500).json({ error: "Erro interno ao obter os projetos" });
  }
});

app.get('/api/tarefas', verifyJWT, async (req, res) => {
  const { status, responsavel } = req.query;
  const user = await getUserFromToken(req)
  const projetos = await lerProjetos()
  let allTarefas = []
  const accessibleProjetos = projetos.filter(
    (projeto) =>
      projeto.acessivel.includes(user.username) ||
      ["administrador", "gerente"].includes(user.role)
  );

  for (const projeto of accessibleProjetos) {
    const tarefas = await lerTarefas(projeto.id);
    let Ptarefas = tarefas.Tarefas;

    if (Ptarefas.length > 0) {
      if (status && status !== 'todos') {
        Ptarefas = Ptarefas.filter(tarefa => tarefa.status === status);
      }
      if (responsavel && responsavel.trim() !== '') {
        Ptarefas = Ptarefas.filter(tarefa =>
          tarefa.responsible.toLowerCase().includes(responsavel.toLowerCase())
        );
      }
      allTarefas.push(...[[projeto.id,Ptarefas]]);
    }
  }
  res.status(200).json(allTarefas);
});

app.get('/Listar/nome', verifyJWT, async (req, res) => {
  nomes = await lerListaUsuario()
  res.json(nomes);
});

app.get('/Pesquisar-Projeto',verifyJWT, async (req, res) => {
  const user = await getUserFromToken(req);
  res.render('pesquisar-projeto', { user:user });
});

app.get('/Pesquisar-Tarefa',verifyJWT, async (req, res) => {
  const user = await getUserFromToken(req);
  res.render('pesquisar-tarefa', { user:user });
});

app.listen(port, () => {
console.log(`Servidor rodando em http://localhost:${port}`);
});