const { Client } = require("pg");
const transaction = require("./src/transaction");
const productsQuery = require("./src/productsQuery");

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "123",
  database: "asignacion1_mdd",
});

const query =
  "select receipt.idreceipt, product.p_name from receipt, sale, product where receipt.idreceipt = sale.idreceipt and sale.idproduct = product.idproduct order by receipt.idreceipt";

// Obtener lista de facturas con productos
const queryExec = async () => {
  await client.connect();
  const res = await client.query(query);
  const transactions = transaction.insertTransactions(res.rows);
  productsQuery.queryExec(transactions);
  await client.end();
};

queryExec().catch((e) => {
  console.log(e);
});
