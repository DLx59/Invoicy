import {Injectable} from '@angular/core';
import {Invoice} from '../../models/invoice.model';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {wtz_logo} from './base64-logo';

pdfMake.vfs = pdfFonts.vfs;

@Injectable({providedIn: 'root'})
export class PdfGeneratorService {
  generate(invoice: Invoice) {
    const items = invoice.items.map(item => [
      item.type,
      item.description,
      item.period,
      item.quantity,
      item.unitPrice.toFixed(2),
      item.totalPriceHt + ' €'
    ]);

    const subtotal = invoice.items.reduce((sum, item) => sum + item.totalPriceHt!, 0);
    const tax = subtotal * invoice.items[0].taxRate;
    const total = subtotal + tax;

    const docDefinition: any = {
      content: [
        {
          text: 'FACTURE N° ' + invoice.invoiceNumber,
          alignment: 'right',
          bold: true,
          fontSize: 12,
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            [
              {
                image: wtz_logo,
                width: 100,
                margin: [0, 0, 0, 10]
              },
              {text: invoice.issuer.name, bold: true},
              {text: invoice.issuer.address},
              {text: 'Tel : ' + invoice.issuer.phone},
              {text: 'Email : ' + invoice.issuer.email}
            ],
            [
              {
                stack: [
                  {text: invoice.client.name, alignment: 'right', bold: true},
                  ...invoice.client.address
                    .split('\n')
                    .map(line => ({text: line, alignment: 'right'}))
                ],
                margin: [0, 20, 0, 0]
              }
            ]

          ]
        },
        {text: ' ', margin: [0, 15]},
        {
          table: {
            widths: [100, 150],
            body: [
              [
                {text: 'Date d’émission :', fillColor: '#f5f5f5', bold: true},
                invoice.issueDate
              ],
              [
                {text: 'Délai de règlement :', fillColor: '#f5f5f5', bold: true},
                `${invoice.deadline} jours fin de mois`
              ],
              [
                {text: 'Échéance :', fillColor: '#f5f5f5', bold: true},
                invoice.dueDate
              ],
              [
                {text: 'Votre référence :', fillColor: '#f5f5f5', bold: true},
                invoice.client.reference
              ],
              [
                {text: 'Notre référence :', fillColor: '#f5f5f5', bold: true},
                invoice.issuer.reference
              ],
              [
                {text: 'N° Contrat :', fillColor: '#f5f5f5', bold: true},
                invoice.contractNumber
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              [
                {text: 'Intervention de :', fillColor: '#f5f5f5', bold: true},
                'Denis Wojtowicz'
              ],
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
        },
        {text: ' ', margin: [0, 5]},
        {text: invoice.note, italics: true},
        {text: ' ', margin: [0, 5]},
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                {text: 'Type', fillColor: '#f5f5f5', bold: true},
                {text: 'Descriptif', fillColor: '#f5f5f5', bold: true},
                {text: 'Période', fillColor: '#f5f5f5', bold: true},
                {text: 'Quantité', fillColor: '#f5f5f5', bold: true},
                {text: 'Prix Unit. HT', fillColor: '#f5f5f5', bold: true},
                {text: 'Montant HT', fillColor: '#f5f5f5', bold: true}
              ],
              ...items
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
        },
        {text: ' ', margin: [0, 10]},
        {
          columns: [
            {width: '*', text: ''},
            {
              width: 'auto',
              table: {
                body: [
                  ['Montant total HT',
                    {
                      text: subtotal.toFixed(2) + ' €',
                      alignment: 'right'
                    }
                  ],
                  [`Montant total TVA ${((invoice.items[0].taxRate * 100).toFixed(2))} %`,
                    {
                      text: tax.toFixed(2) + ' €',
                      alignment: 'right'
                    }
                  ],
                  [
                    {text: 'Montant total TTC', bold: true},
                    {text: total.toFixed(2) + ' €', bold: true, alignment: 'right'}],
                  ['Solde dû', '0.00 €']
                ]
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#cccccc',
                vLineColor: () => '#cccccc'
              },
            }
          ]
        },
        {text: ' ', margin: [0, 20]},
        {
          table: {
            widths: ['auto', '*', 'auto', '*'],
            body: [
              [
                {text: 'BANQUE :', fillColor: '#f5f5f5', bold: true},
                'Belfius',
                {text: 'N° TVA Fournisseur :', fillColor: '#f5f5f5', bold: true},
                'FR31903463503'
              ],
              [
                {text: 'IBAN :', fillColor: '#f5f5f5', bold: true},
                'BE46 0689 5580 9836',
                {text: 'N° SIREN Client :', fillColor: '#f5f5f5', bold: true},
                '534996695'
              ],
              [
                {text: 'BIC :', fillColor: '#f5f5f5', bold: true},
                'GKCCBEBB',
                {text: 'N° TVA Client :', fillColor: '#f5f5f5', bold: true},
                ''
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
        },
        {text: ' ', margin: [0, 10]},
        {text: 'Nos factures sont réglables sans escompte'},
        {text: 'Tout retard de paiement entraînerait la facturation de 40 € pour poursuite judiciaire'},
        {text: 'ainsi que des intérêts de retard : Taux de base x 3'}
      ],
      defaultStyle: {
        fontSize: 10
      }
    };

    pdfMake.createPdf(docDefinition).download(`facture-${invoice.invoiceNumber}.pdf`);
  }
}
