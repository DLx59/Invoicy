import {Injectable} from '@angular/core';
import {Invoice} from '../../features/invoice/models/invoice.model';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {wtz_logo} from './base64-logo';
import {TDocumentDefinitions} from 'pdfmake/interfaces';

pdfMake.vfs = pdfFonts.vfs;

@Injectable({providedIn: 'root'})
export class PdfGeneratorService {
  public open(invoice: Invoice): void {
    const docDefinition = this.createDocumentDefinition(invoice);
    pdfMake.createPdf(docDefinition).open();
  }

  public download(invoice: Invoice): void {
    const docDefinition = this.createDocumentDefinition(invoice);
    pdfMake.createPdf(docDefinition).download(`facture-${invoice.invoiceNumber}.pdf`);
  }

  public async getBlob(invoice: Invoice): Promise<Blob> {
    const docDefinition = this.createDocumentDefinition(invoice);
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    return new Promise((resolve) => pdfDocGenerator.getBlob((blob) => resolve(blob)));
  }

  private createDocumentDefinition(invoice: Invoice): TDocumentDefinitions {
    const items = invoice.items.map((item) => [
      item.type,
      item.description,
      item.period,
      item.quantity,
      this.safe(item.unitPrice),
      this.safe(item.totalPriceHt || 0)
    ]);

    const subtotal = invoice.items.reduce((sum, item) => sum + (item.totalPriceHt || 0), 0);
    const taxDetails = this.calculateTaxDetails(invoice);
    const total = subtotal + taxDetails.totalTax;

    return {
      content: [
        {
          columns: [
            {
              image: wtz_logo,
              width: 100,
              margin: [0, 0, 0, 10]
            },
            {
              width: '80%',
              text: 'FACTURE N° ' + invoice.invoiceNumber,
              alignment: 'right',
              style: 'strong',
              fontSize: 12,
              margin: [0, 0, 0, 10]
            }
          ]
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                {text: invoice.issuer.name, style: 'strong'},
                {text: invoice.issuer.address.street},
                {text: invoice.issuer.address.zipCode + ' ' + invoice.issuer.address.city},
                {text: invoice.issuer.address.country},
                invoice.issuer.phone ? {text: [{text: 'Tel : '}, {text: invoice.issuer.phone}]} : '',
                invoice.issuer.website
                  ? {
                    text: [
                      {text: 'Site web : '},
                      {text: invoice.issuer.website, link: invoice.issuer.website, color: 'blue'}
                    ]
                  }
                  : '',
                invoice.issuer.email ? {text: [{text: 'Email : '}, {text: invoice.issuer.email}]} : ''
              ]
            },
            {
              width: '50%',
              stack: [
                {text: invoice.client.name, alignment: 'right', style: 'strong'},
                {text: invoice.client.address.street, alignment: 'right'},
                {text: invoice.client.address.zipCode + ' ' + invoice.client.address.city, alignment: 'right'},
                {text: invoice.client.address.country, alignment: 'right'}
              ],
              margin: [0, 0, 0, 0]
            }
          ]
        },
        {text: ' ', margin: [0, 15]},
        {
          table: {
            widths: [100, 150],
            body: [
              [
                {
                  text: "Date d’émission :", fillColor: '#f5f5f5', style: 'strong'
                },
                invoice.issueDate || ''
              ],
              [
                {
                  text: 'Délai de règlement :', fillColor: '#f5f5f5', style: 'strong'
                },
                `${invoice.deadline} jours${invoice.isEndOfMonth ? ' fin de mois' : ''}`,
              ],
              [
                {
                  text: 'Échéance :', fillColor: '#f5f5f5', style: 'strong'
                },
                invoice.dueDate || ''],
              [
                {text: 'Votre référence :', fillColor: '#f5f5f5', style: 'strong'},
                invoice.client.reference || ''
              ],
              [
                {text: 'Notre référence :', fillColor: '#f5f5f5', style: 'strong'},
                invoice.issuer.reference || ''
              ],
              [
                {text: 'N° Contrat :', fillColor: '#f5f5f5', style: 'strong'},
                invoice.contractNumber || ''
              ]
            ]
          },
          layout: this.tableLayout(),
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            widths: ['auto', '*'],
            body: [[{text: 'Intervention de :', fillColor: '#f5f5f5', style: 'strong'}, invoice.interventionBy]]
          },
          layout: this.tableLayout()
        },
        {text: ' ', margin: [0, 5]},
        {text: invoice.note || '', style: 'italic'},
        {text: ' ', margin: [0, 5]},
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                {text: 'Type', fillColor: '#f5f5f5', style: 'strong'},
                {text: 'Descriptif', fillColor: '#f5f5f5', style: 'strong'},
                {text: 'Période', fillColor: '#f5f5f5', style: 'strong'},
                {text: 'Quantité', fillColor: '#f5f5f5', style: 'strong'},
                {text: 'Prix Unit. HT', fillColor: '#f5f5f5', style: 'strong'},
                {text: 'Montant HT', fillColor: '#f5f5f5', style: 'strong'}
              ],
              ...items
            ]
          },
          layout: this.tableLayout()
        },
        {text: ' ', margin: [0, 10]},
        {
          columns: [
            {width: '*', text: ''},
            {
              width: 'auto',
              table: {
                body: [
                  [
                    'Montant total HT', {text: this.safe(subtotal), alignment: 'right'}
                  ],
                  ...(invoice.isIntracommunity
                    ? []
                    : [
                      [
                        `Montant total TVA ${this.formatTaxRates(taxDetails)}`,
                        {text: this.safe(taxDetails.totalTax), alignment: 'right'},
                      ]
                    ]),
                  [
                    {
                      text: `Montant total ${invoice.isIntracommunity ? 'de la facture' : 'TTC'}`,
                      style: 'strong'
                    },
                    {
                      text: this.safe(total),
                      style: 'strong',
                      alignment: 'right'
                    }
                  ],
                  [
                    'Solde dû',
                    {
                      text: this.safe(invoice.dueAmount),
                      alignment: 'right'
                    }
                  ]
                ]
              },
              layout: this.tableLayout()
            }
          ]
        },
        {text: ' ', margin: [0, 10]},
        {
          table: {
            widths: ['auto', '*', 'auto', '*'],
            body: [
              [
                {text: 'BANQUE :', fillColor: '#f5f5f5', style: 'strong'},
                'Belfius',
                {text: 'N° TVA Fournisseur :', fillColor: '#f5f5f5', style: 'strong'},
                invoice.issuer.vat
              ],
              [
                {text: 'IBAN :', fillColor: '#f5f5f5', style: 'strong'},
                'BE46 0689 5580 9836',
                {text: 'N° SIREN Client :', fillColor: '#f5f5f5', style: 'strong'},
                invoice.client.id
              ],
              [
                {text: 'BIC :', fillColor: '#f5f5f5', style: 'strong'},
                'GKCCBEBB',
                {text: 'N° TVA Client :', fillColor: '#f5f5f5', style: 'strong'},
                invoice.client.vat ? invoice.client.vat : ''
              ]
            ]
          },
          layout: this.tableLayout()
        },
        {text: ' ', margin: [0, 10]},
        {text: invoice.terms || ''}
      ],
      footer: {
        margin: [40, 10],
        style: 'footer',
        stack: [
          {
            text: `Siège Social : ${invoice.issuer.address.street} - ${invoice.issuer.address.zipCode} ${invoice.issuer.address.city} - ${invoice.issuer.address.country}`
          },
          {
            text: `SRL au capital de 3 500 € • BCE : ${invoice.issuer.id}`
          }
        ]
      },
      defaultStyle: {
        fontSize: 10
      },
      styles: {
        footer: { fontSize: 8, alignment: 'center' },
        italic: {
          italics: true
        },
        strong: {
          bold: true
        }
      }
    };
  }

  private calculateTaxDetails(invoice: Invoice): { totalTax: number; rates: Record<number, number> } {
    return invoice.items.reduce(
      (acc, item) => {
        const rate = item.taxRate || 0;
        const tax = (item.totalPriceHt || 0) * rate;
        acc.rates[rate] = (acc.rates[rate] || 0) + tax;
        acc.totalTax += tax;
        return acc;
      },
      {totalTax: 0, rates: {} as Record<number, number>}
    );
  }

  private formatTaxRates(taxDetails: { rates: Record<number, number> }): string {
    return Object.keys(taxDetails.rates)
      .map((rate) => `${(parseFloat(rate) * 100).toFixed(2)}%`)
      .join(' + ');
  }

  private safe(value: number): string {
    return (isNaN(value) ? 0 : value).toFixed(2) + ' €';
  }

  private tableLayout() {
    return {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cccccc',
      vLineColor: () => '#cccccc'
    };
  }
}
