const _ = require("lodash");
let minsup = 3;
let minconf = 0.5;
/**
 * Ejecutar el algoritmo Apriori
 * @param {Array[Object]} c1 Primera lista de candidatos
 * @param {Array[Object]} transactions
 */
let exec = (c1, transactions) => {
  // Esto va a poder permitir obtener de manera rápida los soportes
  let allFrecuents = [];

  let f1 = getF1(c1);
  console.log(
    `Obtención de reglas de asociación minsup=${minsup} minconf=${minconf}`
  );
  console.log("Itemsets Frecuentes 1");
  console.table(f1);

  // f1 x f1 para obtener los candidatos c2
  let c2 = itemsetFrecuency(getCandidates(f1, f1), transactions);
  let f2 = frecuents(pruning(c2, f1));
  console.log("Itemsets Frecuentes 2");
  console.table(f2);

  // f2 x f1 para obtener c3
  let c3 = itemsetFrecuency(getCandidates(f2, f1), transactions);
  let f3 = frecuents(pruning(c3, f2));
  console.log("Itemsets Frecuentes 3");
  console.table(f3);

  // f3 x f1 para obtener c4
  let c4 = itemsetFrecuency(getCandidates(f3, f1), transactions);
  console.log("Itemsets Frecuentes 4");
  console.table(pruning(c4, f3));

  allFrecuents = allFrecuents.concat(f1, f2, f3);

  let allRules = [];
  f3.forEach((frecuents) => {
    allRules.push(rules(frecuents, frecuents.itemset.length, allFrecuents));
  });
  console.log("Reglas de asociación");
  console.table(
    allRules.flat().sort((a, b) => {
      return b.confidence - a.confidence;
    })
  );
};

/**
 * Función que permitirá obtener los subsets candidatos
 * @param {Array[Object]} fk Itemsets frecuentes de k
 * @param {Array[Object]} fkm1 Itemsets frecuentes de k-1
 * @returns Candidatos siguientes
 */
const getCandidates = (fk, fkm1) => {
  // Obtener combinaciones de itemsets
  let candidates = [];
  fk.forEach((frecuent) => {
    fkm1.forEach((frecuentm1) => {
      let temp = combineArray(frecuent.itemset, frecuentm1.itemset);
      if (hasDuplicates(temp)) {
        return;
      }
      candidates.push({ itemset: temp.sort() });
    });
  });
  candidates.forEach((c1) => {
    let i = 0;
    candidates.forEach((c2) => {
      // Se itera dos veces el objeto pora poder observar si se repite algun itemset
      if (_.isEqual(c1, c2)) {
        i++;
      }
    });
    // Para saber la cantidad de veces que se repite un itemset luego de hacer la combinación
    c1.repeat = i;
  });
  // Se verifica si hay valores repetidos al hacer la permutación
  candidates = candidates.filter((c) => c.repeat < 2);
  return candidates;
};

/**
 * Función que compara los candidatos actuales con los itemsets frecuentes anteriores
 * con el fin de eliminar los que no se encuentren en el ultimo
 * @param {Array[Object]} ck Candidatos en k
 * @param {Array[Object]} fkm1 Frecuentes de k - 1
 * @returns Candidatos luego de prunning
 */
const pruning = (ck, fkm1) => {
  let tempCandidates = [];
  ck.forEach((can) => {
    let ocurrencyCount = 0;
    fkm1.forEach((fre) => {
      if (typeof fre.itemset === "string") {
        fre.itemset = [fre.itemset];
      }
      let indexArray = can.itemset.map((item) => {
        return fre.itemset.indexOf(item);
      });
      let m1Count = 0;
      // Verificar si existen los valores en el array
      indexArray.forEach((val) => {
        if (val !== -1) {
          m1Count++;
        }
      });
      // Esto es para verificar de que todos los elementos de `fre` se encontraron
      if (m1Count === fre.itemset.length) {
        ocurrencyCount++;
      }
    });
    if (ocurrencyCount === can.itemset.length) {
      tempCandidates.push(can);
    }
  });
  return tempCandidates;
};

/**
 *
 * @param {Array[Object]} candidates Candidatos a evaluar
 * @param {Array[Object]} transactions transacciones totales
 * @returns Candidatos con el campo agregado de soporte
 */
const itemsetFrecuency = (candidates, transactions) => {
  candidates.forEach((candidate) => {
    i = 0;
    transactions.forEach((transaction) => {
      let indexArray = candidate.itemset.map((item) => {
        return transaction.items.indexOf(item);
      });
      if (indexArray.indexOf(-1) === -1) {
        i++;
      }
    });
    candidate.support = i;
  });
  return candidates;
};

/**
 * @param {Array} antecedent
 * @param {Array[Object]} frecuentItemset Ultimos itemsets frecuentes
 * @param {Array[Object]} allFrecuents Todos los itemsets frecuentes
 * @returns
 */
const getConfidence = (antecedent, frecuentItemset, allFrecuents) => {
  confidence = 0;
  allFrecuents.forEach((allFrecuent) => {
    if (antecedent.length === allFrecuent.itemset.length) {
      let indexArray = antecedent.map((antItem) => {
        return allFrecuent.itemset.indexOf(antItem);
      });
      if (indexArray.indexOf(-1) === -1) {
        confidence = frecuentItemset.support / allFrecuent.support;
      }
    }
  });
  return confidence;
};

// Obtener las reglas de asociación
const rules = (frecuent, length, allFrecuents) => {
  let rules = [];
  let consequent = frecuent.itemset.slice(length - 1);
  let antecedent = frecuent.itemset.slice(0, length - 1);
  for (let i = 0; i < length; i++) {
    let [antTemp, conTemp] = cicleArray(antecedent, consequent);
    let confidence = getConfidence(antecedent, frecuent, allFrecuents);
    // Obtener siempre las reglas de asociación fuertes
    if (confidence >= minconf) {
      rules.push({
        rule: `{${antTemp}} => ${conTemp}`,
        confidence: confidence,
      });
    }
  }
  return rules;
};

/**
 * Cambiar los valores del array en posición por ejemplo: [a, b] [c] => [b, c] [a] => [c, a]
 * @param {Array} antecent
 * @param {Array} consecuent
 * @returns
 */
const cicleArray = (antecent, consecuent) => {
  let temp = antecent[0];
  antecent[0] = antecent[1];
  antecent[1] = consecuent[0];
  consecuent[0] = temp;
  return [antecent, consecuent];
};

// Obtener valores frecuencias eliminando aquellos datos que no superen el *minsup*
const frecuents = (arr) => {
  return arr.filter((el) => el.support >= minsup);
};

const combineArray = (arr1, arr2) => {
  return [].concat(arr1, arr2);
};

// Chequear si un array tiene valores duplicados
const hasDuplicates = (arr) => {
  const noDups = new Set(arr);
  return arr.length !== noDups.size ? true : false;
};

/**
 * Obtener la lista de itemsets frecuentes para F1
 * @param {Array[Object]} c1 Lista de candidatos antes del pruning
 * @returns Resultado luego de hacer prune
 */
const getF1 = (c1) => {
  c1.forEach((cand) => {
    delete Object.assign(cand, {
      ["itemset"]: cand["p_name"],
    })["p_name"];
  });
  return frecuents(c1);
};

module.exports = {
  exec,
};
