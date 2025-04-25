# Page d'accueil - Générateur de Factures

## Structure

### Header
- Logo (à gauche)
- Titre : `Générateur de Factures`
- Bouton principal : `Nouvelle facture`

---

### Section principale

> `Card` PrimeNG, dark mode, design épuré

#### 📄 Mes factures
- Liste des factures existantes (tableau)
- Colonnes :
  - Numéro de facture
  - Nom du client
  - Date de création
  - Montant total TTC
  - Statut (Brouillon / Envoyé)
  - Actions (Voir | Modifier | Supprimer)

---

### Sidebar (facultatif en responsive)

> `Menu` vertical collé à gauche

- Créer une facture
- Mes brouillons
- Historique
- Paramètres

---

### Footer

- Mention : `WTZ SRL - Générateur de Factures`
- Petite police, centrée, ton sur ton (gris clair sur fond gris foncé)

---

## Comportement dynamique

- Lors du clic sur "Nouvelle facture", redirection vers la page de création.
- Le tableau de "Mes factures" est paginé (paginator PrimeNG).
- Si aucune facture n'est présente, afficher un message vide "Aucune facture disponible" avec un bouton "Créer votre première facture".

---

## Style Tailwind / PrimeFlex

- `bg-gray-900 text-gray-100`
- `p-4` sur les cards
- `rounded-2xl shadow-lg`
- `text-xl font-bold` pour les titres
- `table-auto w-full`
- `hover:bg-gray-800` sur les lignes de tableau
- Responsive à partir de `md:`

---

## Actions principales

- Voir facture (lecture seule)
- Modifier facture (réédition)
- Supprimer facture (confirmation avant)
- Télécharger facture (PDF)
- Envoyer facture par email

---

## Bonus (optionnel)

- Indicateur de brouillon avec badge "Brouillon" en bleu.
- Indicateur de facture envoyée avec badge "Envoyé" en vert.
- Animation douce sur les hover (éléments montent légèrement en `scale-105`).




# Règles de Gestion - Générateur de Factures

## 1. Informations Société

- **RG001** : Les champs *Nom de la société*, *Adresse*, *Téléphone*, *Email*, *Numéro TVA* sont obligatoires pour générer une facture.
- **RG002** : Le champ *Email* doit respecter un format valide (`@` et domaine).
- **RG003** : Le champ *Téléphone* doit contenir uniquement des chiffres, espaces, `+` ou `-`.

## 2. Informations Client

- **RG004** : Les champs *Nom du client* et *Adresse du client* sont obligatoires.
- **RG005** : Le champ *Email du client* est optionnel mais doit respecter un format valide s'il est renseigné.
- **RG006** : Le champ *Téléphone du client* est optionnel.

## 3. Facture

- **RG007** : Le *Numéro de facture* est obligatoire et doit être unique.
- **RG008** : La *Date de facture* est obligatoire et doit être antérieure ou égale à la date du jour.
- **RG009** : La *Date d'échéance* est obligatoire et doit être postérieure ou égale à la *Date de facture*.
- **RG010** : Les *Conditions de paiement* sont facultatives.

## 4. Produits / Services

- **RG011** : Chaque ligne produit doit contenir obligatoirement une *Description*, une *Quantité* et un *Prix unitaire*.
- **RG012** : La *Quantité* doit être un nombre positif (> 0).
- **RG013** : Le *Prix unitaire* doit être supérieur ou égal à 0.
- **RG014** : La *TVA* est optionnelle ; si non renseignée, elle est considérée à 0%.
- **RG015** : Le *Total* d'une ligne est automatiquement calculé :

  ```
  Total = Quantité × Prix unitaire × (1 + (TVA / 100))
  ```

- **RG016** : La suppression d’un produit est possible uniquement avant la génération du PDF.

## 5. Résumé

- **RG017** : Le *Sous-total* est la somme des montants HT de tous les produits.
- **RG018** : La *TVA totale* est la somme de toutes les TVA ligne par ligne.
- **RG019** : Le *Total TTC* est la somme : Sous-total + TVA totale.
- **RG020** : Le *Total TTC* est affiché avec 2 décimales et séparateur de milliers si applicable.

## 6. Actions

- **RG021** : Le bouton `Générer PDF` est activé uniquement si tous les champs obligatoires sont valides et qu'au moins une ligne produit existe.
- **RG022** : Le bouton `Envoyer par Email` est activé uniquement si l'email du client est renseigné et valide.
- **RG023** : Le bouton `Enregistrer en brouillon` permet de sauvegarder même en présence d'erreurs.

## 7. Génération de la facture (PDF)

- **RG024** : La facture générée doit contenir toutes les informations saisies, formatées proprement.
- **RG025** : Le PDF doit mentionner clairement :
  - Coordonnées de la société
  - Coordonnées du client
  - Numéro de facture et dates
  - Détail des produits
  - Totaux HT, TVA, TTC
  - Conditions de paiement
  - Mention "TVA non applicable" si TVA = 0%

## 8. Accessibilité & Responsive

- **RG026** : Interface adaptée aux mobiles (responsive design).
- **RG027** : Ratio de contraste texte/fond ≥ 4.5:1.
- **RG028** : Navigation clavier-only possible (tabindex correct).

