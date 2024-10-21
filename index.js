const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('usuario.db');

app.use(express.json());

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS cliente (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT)");
  // Inserindo os 5 clientes iniciais
const initialClients = [
  'Fabio',
  'Camilo',
  'Adailton',
  'Wellington',
  'Ronaldo'
];

initialClients.forEach(cliente => {
  db.run('INSERT INTO cliente (nome) VALUES (?)', cliente, function(err) {
    if (err) {
      console.error('Erro ao inserir cliente inicial:', err.message);
    } else {
      console.log(`Cliente "${cliente}" adicionado com sucesso!`);
    }
  });
});

  //Tabela que adiciona estoque.
  db.run("CREATE TABLE IF NOT EXISTS estoque (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT)");

  //Tabela que adiciona produto dentro do estoque.
  db.run('CREATE TABLE IF NOT EXISTS produto (id INTEGER PRIMARY KEY, nome TEXT, estoque_id INTEGER)');
  

// Função para inserir produtos iniciais
const insertInitialProducts = (products, estoqueId) => {
  products.forEach(nomeProduto => {
    db.run('INSERT INTO produto (nome, estoque_id) VALUES (?, ?)', [nomeProduto, estoqueId], function(err) {
      if (err) {
        console.error('Erro ao inserir produto inicial:', err.message);
      } else {
        console.log(`Produto "${nomeProduto}" adicionado com sucesso!`);
      }
    });
  });
};

// Inserindo os 10 produtos iniciais para um estoque.
const initialProducts = [
  'Calça jeans',
  'Calça moleton',
  'Cmaisa',
  'Camisa social',
  'Bermuda',
  'Cueca',
  'Jaqueta',
  'Cueca',
  'Gorro',
  'Sapato'
];

// Chamando a função para inserir os produtos iniciais
insertInitialProducts(initialProducts, 1); // Aqui, o número 1 representa o ID do estoque onde os produtos serão adicionados



// Tabela para registrar as vendas (pedidos)
db.run(`
  CREATE TABLE IF NOT EXISTS venda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    produto_id INTEGER,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (produto_id) REFERENCES produto(id)
  );
`);


  //Adicionar cliente na loja "Vende Mais".
  app.post('/cliente', (req, res) => {
    const { nome } = req.body;
    db.run('INSERT INTO cliente (nome) VALUES (?)', nome, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, nome });
    });
  });

  //Remover cliente da loja "Vende Mais".
  app.delete('/cliente/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM cliente WHERE id = ?', id, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Cliente removido com sucesso!', changes: this.changes });
    });
  });

  //Verificar se existe estoque.
  app.get('/estoque', (req, res) => {
    db.all('SELECT * FROM estoque', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  //Adicionar novo estoque.
  app.post('/estoque', (req, res) => {
    const { nome } = req.body;
    db.run('INSERT INTO estoque (nome) VALUES (?)', nome, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, nome });
    });
  });

  //Deletar estoque.
  app.delete('/estoque/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM estoque WHERE id = ?', id, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Estoque removido com sucesso!', changes: this.changes });
    });
  });

  //Verificando produto no estoque.
  app.get('/estoque/:id/produto', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM produto WHERE estoque_id = ?', id, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  //Adicionando produto no estoque.
  app.post('/estoque/:id/produto', (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    db.run('INSERT INTO produto (nome, estoque_id) VALUES (?, ?)', [nome, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, nome });
    });
  });

  //Deletando produto do estoque.
  app.delete('/estoque/:estoque_id/produto/:produto_id', (req, res) => {
    const { estoque_id, produto_id } = req.params;
    db.run('DELETE FROM produto WHERE estoque_id = ? AND id = ?', [estoque_id, produto_id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Produto removido com sucesso!', changes: this.changes });
    });
  });
});

// Rota para registrar a venda de um produto para o cliente
app.post('/cliente/:cliente_id/venda', (req, res) => {
  const { cliente_id } = req.params;
  const { produto_id } = req.body;

  db.run('INSERT INTO venda (cliente_id, produto_id) VALUES (?, ?)', [cliente_id, produto_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, cliente_id, produto_id, message: 'Venda registrada com sucesso!' });
  });
});

// Rota para obter as vendas de um cliente específico
app.get('/cliente/:cliente_id/vendas', (req, res) => {
  const { cliente_id } = req.params;

  db.all('SELECT * FROM venda WHERE cliente_id = ?', cliente_id, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

  app.get('/cliente', (req, res) => {
    db.all('SELECT * FROM cliente', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  
  // Rota para obter o relatório de vendas gerais dos produtos
app.get('/relatorio/vendas-gerais', (req, res) => {
  db.all(`
    SELECT p.id as produto_id, p.nome as nome_produto, COUNT(v.produto_id) as total_vendas
    FROM produto p
    LEFT JOIN venda v ON p.id = v.produto_id
    GROUP BY p.id
    ORDER BY total_vendas DESC;
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor da plataforma da loja Vende Mais rodando na porta ${PORT}`);
});




