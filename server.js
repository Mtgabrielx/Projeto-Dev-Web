const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'public', 'views'));

app.get('/', (req, res) => {
    res.render('inicio')
});

app.get('/index', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'data', 'data.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
          console.error('Erro ao ler o arquivo JSON:', err);
          return res.status(500).send('Erro ao carregar os dados.');
      }

      const items = JSON.parse(data);
      res.render('index', { items });
  });
});

app.get('/Tarefas', (req, res) => {

  const dataPath = path.join(__dirname, 'public', 'data', 'tasks.json');

  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Error loading data.');
      return;
    }

    const tasks = JSON.parse(jsonData);
    res.render('partials/tarefas', { tasks }, (err, html) => {
      if (err) {
        console.error('Erro ao renderizar EJS:', err);
        return res.status(500).json({ error: 'Erro ao renderizar o conteúdo.' });
      }
      res.json({
        html,
        css: "/css/table.css",
        js: "/js/table.js"
      });
    });
  });
});

app.get('/Desempenho', (req, res) => {

  const desempenho_path = path.join(__dirname, 'public', 'data', 'desempenho.json');
  const tarefa_path = path.join(__dirname, 'public', 'data', 'tasks.json');

  fs.readFile(desempenho_path, 'utf8', (err, desempenho_data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Error loading data.');
      return;
    }

    fs.readFile(tarefa_path, 'utf8', (err, tarefa_data) => {
      const desempenho = JSON.parse(desempenho_data);
      const tarefa = JSON.parse(tarefa_data);
      res.render('partials/desempenho', { desempenho, tarefa }, (err, html) => {
        if (err) {
          console.error('Erro ao renderizar EJS:', err);
          return res.status(500).json({ error: 'Erro ao renderizar o conteúdo.' });
        }
        res.json({
          html,
          css: "/css/grafico-alternativo.css",
          js: "/js/grafico.js"
        });
      });
    });
  });
});

app.get('/Projetos', (req, res) => {
  const dataPath = path.join(__dirname, 'public', 'data', 'projeto.json');
  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Error loading data.');
      return;
    }

    const Projetos = JSON.parse(jsonData);
    res.render('partials/projetos', { Projetos }, (err, html) => {
      if (err) {
        console.error('Erro ao renderizar EJS:', err);
        return res.status(500).json({ error: 'Erro ao renderizar o conteúdo.' });
      }
      res.json({
        html,
        css: "/css/projeto-alternativo.css",
        js: "/js/projeto.js"
      });
    });
  });
});

app.get('/Login', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'data', 'data.json');
  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
    console.error('Erro ao ler o arquivo JSON:', err);
    return res.status(500).send('Erro ao carregar os dados.');
    }

    const items = JSON.parse(data); 
    res.render('login', { items }); 
  });
});

app.get('/Cadastro', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'data', 'data.json');
  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
    console.error('Erro ao ler o arquivo JSON:', err);
    return res.status(500).send('Erro ao carregar os dados.');
    }

    const items = JSON.parse(data); 
    res.render('cadastro', { items }); 
  });
});



app.listen(port, () => {
console.log(`Servidor rodando em http://localhost:${port}`);
});