export const selectInvoicesQuery = `
  SELECT i.id          as invoiceId,
         i.invoiceNumber,
         i.issueDate,
         i.deadline,
         i.dueDate,
         i.dueAmount,
         i.dueVat,
         i.isEndOfMonth,
         i.isIntracommunity,
         i.isPaid,
         i.contractNumber,
         i.interventionBy,
         i.note,
         i.terms,
         i.status,
         c.id          as clientId,
         c.name        as clientName,
         c.vat         as clientVat,
         c.reference   as clientReference,
         c.street      as clientStreet,
         c.zipCode     as clientZip,
         c.city        as clientCity,
         c.country     as clientCountry,
         iss.id        as issuerId,
         iss.name      as issuerName,
         iss.vat       as issuerVat,
         iss.reference as issuerReference,
         iss.email     as issuerEmail,
         iss.phone     as issuerPhone,
         iss.website   as issuerWebsite,
         iss.street    as issuerStreet,
         iss.zipCode   as issuerZip,
         iss.city      as issuerCity,
         iss.country   as issuerCountry
  FROM invoices i
         JOIN clients c ON i.clientId = c.id
         LEFT JOIN issuers iss ON i.issuerId = iss.id
`;

export const selectDraftInvoicesQuery = `
  SELECT i.id          as invoiceId,
         i.invoiceNumber,
         i.issueDate,
         i.deadline,
         i.dueDate,
         i.dueAmount,
         i.dueVat,
         i.isEndOfMonth,
         i.isIntracommunity,
         i.isPaid,
         i.contractNumber,
         i.interventionBy,
         i.note,
         i.terms,
         i.status,
         c.id          as clientId,
         c.name        as clientName,
         c.vat         as clientVat,
         c.reference   as clientReference,
         c.street      as clientStreet,
         c.zipCode     as clientZip,
         c.city        as clientCity,
         c.country     as clientCountry,
         iss.id        as issuerId,
         iss.name      as issuerName,
         iss.vat       as issuerVat,
         iss.reference as issuerReference,
         iss.email     as issuerEmail,
         iss.phone     as issuerPhone,
         iss.website   as issuerWebsite,
         iss.street    as issuerStreet,
         iss.zipCode   as issuerZip,
         iss.city      as issuerCity,
         iss.country   as issuerCountry
  FROM invoices i
         JOIN clients c ON i.clientId = c.id
         LEFT JOIN issuers iss ON i.issuerId = iss.id
         WHERE i.status = 'DRAFT'
`;

export const selectInvoiceByNumberQuery = `
  SELECT i.id          as invoiceId,
         i.invoiceNumber,
         i.issueDate,
         i.deadline,
         i.dueDate,
         i.dueAmount,
         i.dueVat,
         i.isEndOfMonth,
         i.isIntracommunity,
         i.isPaid,
         i.contractNumber,
         i.interventionBy,
         i.note,
         i.terms,
         i.status,
         c.id          as clientId,
         c.name        as clientName,
         c.vat         as clientVat,
         c.reference   as clientReference,
         c.street      as clientStreet,
         c.zipCode     as clientZip,
         c.city        as clientCity,
         c.country     as clientCountry,
         iss.id        as issuerId,
         iss.name      as issuerName,
         iss.vat       as issuerVat,
         iss.reference as issuerReference,
         iss.email     as issuerEmail,
         iss.phone     as issuerPhone,
         iss.website   as issuerWebsite,
         iss.street    as issuerStreet,
         iss.zipCode   as issuerZip,
         iss.city      as issuerCity,
         iss.country   as issuerCountry
  FROM invoices i
         JOIN clients c ON i.clientId = c.id
         LEFT JOIN issuers iss ON i.issuerId = iss.id
  WHERE i.invoiceNumber = ?
`;

export const selectInvoiceItemsByIdQuery = `
  SELECT * FROM invoice_items WHERE invoiceId = ?;
`;

