# Wordle-FR 🏩

Un clone de Wordle/Motus en français, jouable directement dans le navigateur — sans dépendances, sans build.

## Comment jouer

Devinez le mot mystère de 5 lettres en 6 essais. Après chaque tentative, chaque lettre change de couleur :

- 🟩 **Vert** : la lettre est bonne et bien placée
- 🟨 **Jaune** : la lettre est dans le mot mais mal placée
- ⬜ **Gris** : la lettre n'est pas dans le mot

Utilisez le clavier virtuel AZERTY affiché à l'écran, ou votre clavier physique.

## Lancer le jeu en local

Aucune installation n'est nécessaire : ouvrez simplement `index.html` dans votre navigateur.

Vous pouvez aussi servir le dossier avec un petit serveur local, par exemple :

```bash
npx serve .
```

## Structure du projet

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure de la page |
| `style.css` | Thème sombre et mise en page de la grille/clavier |
| `script.js` | Logique du jeu (validation des essais, clavier, animations) |
| `words.js` | Liste des mots français utilisés pour le tirage |
