module.exports = {
  /**
   * Iterar por cada factura y venta, para crear un array de objetos
   * el cual contiene el TID y los productos por transacción
   * @param {Array[Object]} sales
   * @returns
   */
  insertTransactions: (sales) => {
    transactions = [];
    sales.map((sale) => {
      sale.idreceipt = sale.idreceipt - 3001;
      if (transactions.length < sale.idreceipt + 1) {
        transactions.push({});
        transactions[sale.idreceipt] = { tid: sale.idreceipt, items: [] };
      }
      transactions.splice(sale.idreceipt, 1, {
        tid: sale.idreceipt,
        items: [...transactions[sale.idreceipt].items, sale.p_name],
      });
    });
    return transactions;
  },
};
