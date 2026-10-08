/**
 * Column Mapper
 * Extracts raw field values from CSV rows using a confirmed column mapping dictionary.
 */

/**
 * Extracts raw mapped fields from a CSV row.
 * @param {string[]|Object} row CSV row as array of cells or object keyed by header
 * @param {Object} mapping Map of canonicalKey -> column index or column name
 * @param {string[]} [headers=[]] Array of header strings if row is an array
 * @returns {Object} Mapped raw field values
 */
export function mapRow(row, mapping, headers = []) {
  if (!row || !mapping) {
    return {};
  }

  const getVal = (key) => {
    const target = mapping[key];
    if (target === undefined || target === null) return '';

    // If mapping target is numeric index
    if (typeof target === 'number') {
      if (Array.isArray(row)) {
        return row[target] !== undefined ? String(row[target]).trim() : '';
      }
      if (headers && headers[target]) {
        return row[headers[target]] !== undefined ? String(row[headers[target]]).trim() : '';
      }
    }

    // If mapping target is header string name
    if (typeof target === 'string') {
      if (typeof row === 'object' && !Array.isArray(row) && row[target] !== undefined) {
        return String(row[target]).trim();
      }
      if (Array.isArray(row) && headers) {
        const idx = headers.indexOf(target);
        if (idx !== -1 && row[idx] !== undefined) {
          return String(row[idx]).trim();
        }
      }
    }

    return '';
  };

  return {
    rawDate: getVal('date'),
    rawDescription: getVal('description'),
    rawMerchant: getVal('merchant'),
    rawDebit: getVal('debit'),
    rawCredit: getVal('credit'),
    rawAmount: getVal('amount'),
    rawType: getVal('type'),
    rawBalance: getVal('balance'),
    rawAccount: getVal('account'),
    rawCategory: getVal('category'),
    rawId: getVal('transaction_id')
  };
}
