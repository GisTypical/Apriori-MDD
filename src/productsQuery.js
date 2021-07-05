const { Client } = require("pg");
const apriori = require("./apriori");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "123",
  database: "asignacion1_mdd",
});

const query = "select p_name from product";

// Obtener lista de productos
const queryExec = async (transactions) => {
  await client.connect();
  const res = await client.query(query);
  const candidates1 = res.rows;
  candidates1.forEach((product) => {
    product.support = countFrecuency(transactions, product.p_name);
  });
  apriori.exec(candidates1, transactions);
  await client.end();
};

const countFrecuency = (transactions, value) => {
  let i = 0;
  transactions.forEach((transaction) => {
    if (transaction.items.findIndex((item) => item === value) !== -1) {
      i++;
    }
  });
  return i;
};

module.exports = {
  queryExec,
};
