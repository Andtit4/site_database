# Guide d'utilisation - Champs Personnalisés pour Sites

## Vue d'ensemble

Le système de champs personnalisés vous permet d'ajouter des colonnes dynamiques à vos sites sans modifier le code. Ces champs sont configurables via l'interface d'administration et apparaissent automatiquement dans les formulaires de création/modification de sites.

## ✨ Fonctionnalités

- **6 types de champs supportés** : Texte, Texte long, Nombre, Oui/Non, Date, Liste déroulante
- **Validation personnalisée** : Champs requis, valeurs min/max, longueur de texte
- **Interface d'administration** : Création, modification, réorganisation des champs
- **Intégration automatique** : Les champs apparaissent dans tous les formulaires de sites
- **Performance optimisée** : Stockage JSONB PostgreSQL avec index

## 🎯 Comment ajouter des champs personnalisés

### 1. Accéder à l'interface d'administration

Rendez-vous dans la section **"Configuration des Champs Personnalisés"** de votre application (généralement dans le menu d'administration).

### 2. Créer un nouveau champ

Cliquez sur **"Ajouter un champ"** et remplissez :

#### Informations de base
- **Nom technique** : Identifiant unique du champ (ex: `hauteur_tour`, `surface_totale`)
  - Doit commencer par une lettre
  - Peut contenir lettres, chiffres et underscores
  - Ne peut pas être modifié après création
- **Libellé d'affichage** : Texte affiché à l'utilisateur (ex: "Hauteur de la tour", "Surface totale")
- **Type de champ** : Sélectionnez le type approprié
- **Champ requis** : Cochez si le champ est obligatoire

#### Configuration avancée
- **Valeur par défaut** : Valeur pré-remplie lors de la création
- **Description** : Texte d'aide affiché sous le champ

### 3. Configuration par type de champ

#### 📝 Texte / Texte long
- **Longueur minimale/maximale** : Contraintes de caractères
- **Pattern** : Expression régulière pour validation

#### 🔢 Nombre
- **Valeur minimale/maximale** : Limites numériques
- **Décimales** : Automatiquement gérées

#### ✅ Oui/Non
- Affichage sous forme d'interrupteur
- Valeurs `true`/`false` stockées

#### 📅 Date
- Sélecteur de date intégré
- Format français automatique

#### 📋 Liste déroulante
- **Options** : Ajoutez autant d'options que nécessaire
- Possibilité de réorganiser les options

## 🔧 Exemples d'utilisation

### Exemple 1: Site Tour de télécommunication
```
- hauteur_tour (Nombre) : "Hauteur de la tour (m)"
  * Min: 5, Max: 200
  * Requis: Oui
  
- type_fondation (Liste) : "Type de fondation"
  * Options: ["Béton", "Acier", "Mixte"]
  * Requis: Oui
  
- date_installation (Date) : "Date d'installation"
  * Requis: Non
  
- acces_securise (Oui/Non) : "Accès sécurisé"
  * Défaut: true
```

### Exemple 2: Site Bâtiment
```
- surface_totale (Nombre) : "Surface totale (m²)"
  * Min: 1
  * Requis: Oui
  
- nb_etages (Nombre) : "Nombre d'étages"
  * Min: 1, Max: 50
  * Requis: Oui
  
- type_chauffage (Liste) : "Type de chauffage"
  * Options: ["Électrique", "Gaz", "Fioul", "Autre"]
  
- observations (Texte long) : "Observations particulières"
  * Max: 500 caractères
```

## 🎨 Interface utilisateur

### Dans les formulaires de sites
Les champs personnalisés apparaissent automatiquement dans une section dédiée :
- Validation en temps réel
- Messages d'erreur clairs
- Aide contextuelle
- Interface responsive

### En lecture seule
Les champs s'affichent proprement formatés :
- Nombres avec séparateurs
- Dates au format français
- Oui/Non lisibles
- Valeurs vides affichées comme "-"

## ⚡ Gestion et maintenance

### Réorganiser les champs
- Utilisez le drag & drop dans l'interface d'administration
- L'ordre est conservé dans les formulaires

### Activer/Désactiver
- Basculez le statut sans supprimer le champ
- Les champs inactifs n'apparaissent plus dans les formulaires
- Les données existantes sont conservées

### Modifier un champ
- Le nom technique ne peut pas être changé
- Toutes les autres propriétés sont modifiables
- Les modifications s'appliquent immédiatement

### Supprimer un champ
⚠️ **Attention** : La suppression efface définitivement :
- La définition du champ
- Toutes les valeurs de ce champ dans tous les sites

## 🔒 Validation et sécurité

### Validation automatique
- Champs requis vérifiés
- Contraintes numériques appliquées
- Longueur de texte contrôlée
- Options de liste validées

### API endpoints
```
GET    /sites/custom-fields          # Liste tous les champs
GET    /sites/custom-fields/active   # Champs actifs seulement
POST   /sites/custom-fields          # Créer un champ
PUT    /sites/custom-fields/:id      # Modifier un champ
DELETE /sites/custom-fields/:id      # Supprimer un champ
```

## 📊 Performance

### Stockage optimisé
- **JSONB PostgreSQL** : Recherche et indexation efficaces
- **Index GIN** : Requêtes rapides sur les valeurs
- **Validation côté serveur** : Intégrité des données

### Recommandations
- Limitez à 20-30 champs personnalisés maximum
- Utilisez des noms courts pour les identifiants techniques
- Préférez les listes déroulantes aux champs texte quand possible

## 🚀 Migration depuis l'ancien système

Si vous migrez depuis le système de spécifications par type :

1. **Identifiez vos champs actuels** par type de site
2. **Créez les champs personnalisés** équivalents
3. **Migrez les données** existantes si nécessaire
4. **Testez** sur quelques sites avant déploiement complet

## 🆘 Dépannage

### Problèmes courants

**Le champ n'apparaît pas dans le formulaire**
- Vérifiez que le champ est **actif**
- Rechargez la page du formulaire

**Erreur de validation**
- Vérifiez les contraintes du champ
- Consultez le message d'erreur spécifique

**Performance lente**
- Trop de champs personnalisés ?
- Index PostgreSQL correctement configurés ?

### Support technique
Pour toute question technique, consultez les logs serveur ou contactez l'équipe de développement.

---

🎉 **Le système est maintenant opérationnel !** Vous pouvez créer vos premiers champs personnalisés via l'interface d'administration. 
