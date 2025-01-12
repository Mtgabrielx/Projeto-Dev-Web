const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'public', 'views'));

app.get('/', (req, res) => {
    // const jsonPath = path.join(__dirname, 'public', 'data', 'data.json'); // Caminho para o arquivo JSON

    // // Ler o arquivo JSON
    // fs.readFile(jsonPath, 'utf8', (err, data) => {
    //     if (err) {
    //     console.error('Erro ao ler o arquivo JSON:', err);
    //     return res.status(500).send('Erro ao carregar os dados.');
    //     }

    //     const items = JSON.parse(data); // Converter JSON em objeto
    //     res.render('inicio', { items }); // Renderizar template com os dados
    // });
    res.render('inicio')
});

// Rota para "Tarefas"
app.get('/index', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'data', 'data.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
          console.error('Erro ao ler o arquivo JSON:', err);
          return res.status(500).send('Erro ao carregar os dados.');
      }

      const items = JSON.parse(data); // Parse JSON
      res.render('index', { items }); // Renderiza somente o conteúdo
  });
});

// Rota para "Tarefas"
// app.get(['/index','/Tarefas'], (req, res) => {
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
          css: "/css/grafico.css",
          js: "/js/grafico.js"
        });
      });
    });
  });
});

// Rota para "Projetos"
app.get('/Projetos', (req, res) => {
  const dataPath = path.join(__dirname, 'public', 'data', 'projeto.json');
  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Error loading data.');
      return;
    }

    const Projeto = JSON.parse(jsonData);
    res.render('partials/projetos', { Projeto }, (err, html) => {
      if (err) {
        console.error('Erro ao renderizar EJS:', err);
        return res.status(500).json({ error: 'Erro ao renderizar o conteúdo.' });
      }
      res.json({
        html,
        css: "/css/projeto.css",
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

    const items = JSON.parse(data); // Converter JSON em objeto
    res.render('login', { items }); // Renderizar template com os dados
  });
});

app.get('/Cadastro', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'data', 'data.json');
  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
    console.error('Erro ao ler o arquivo JSON:', err);
    return res.status(500).send('Erro ao carregar os dados.');
    }

    const items = JSON.parse(data); // Converter JSON em objeto
    res.render('cadastro', { items }); // Renderizar template com os dados
  });
});

app.get('/teste', (req, res) => {
  res.render('teste')
})

app.get('/tico', (req, res) => {
    // const jsonPath = path.join(__dirname, 'public', 'data', 'data.json');

  // fs.readFile(jsonPath, 'utf8', (err, data) => {
  //     if (err) {
  //         console.error('Erro ao ler o arquivo JSON:', err);
  //         return res.status(500).send('Erro ao carregar os dados.');
  //     }

  //     const items = JSON.parse(data); // Parse JSON
  //     res.render('partials/tarefas', { items }); // Renderiza somente o conteúdo
  // });
  res.send('Página do Tico - Projeto 1');
});

app.listen(port, () => {
console.log(`Servidor rodando em http://localhost:${port}`);
});