export const getNextDocumentNumberQuery = `
  INSERT INTO document_numbers (type, year, lastNumber)
  VALUES (?, ?, 1)
  ON CONFLICT(type, year) DO UPDATE SET lastNumber = lastNumber + 1;

  SELECT lastNumber FROM document_numbers
  WHERE type = ? AND year = ?;
`;
