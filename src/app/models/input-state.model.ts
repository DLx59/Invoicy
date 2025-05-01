export interface IssuerInputStateModel {
  email: boolean;
  phone: boolean;
  website: boolean;
}

export const defaultIssuerInputState: IssuerInputStateModel = {
  email: false,
  phone: false,
  website: false,
}

export interface ClientInputStateModel {
  id: boolean;
  vat: boolean;
}

export const defaultClientInputState: ClientInputStateModel = {
  id: false,
  vat: false
}

