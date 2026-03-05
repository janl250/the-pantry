

## Plan: Ko-fi Spendenlink einbauen

Ko-fi ist die beste Wahl — kostenlos, keine Gebühren, ab 13 nutzbar.

### Änderungen

1. **Footer.tsx** — Social-Media-Buttons um einen Ko-fi-Button ergänzen (Heart/Coffee Icon + Link zu deiner Ko-fi-Seite). Externer Link mit `target="_blank"`.

2. **Profile.tsx** — Im unteren Bereich der Profilseite eine kleine "Unterstütze The Pantry"-Karte mit Ko-fi-Link einfügen.

3. **LanguageContext.tsx** — Übersetzungsschlüssel hinzufügen:
   - `footer.support` → "Unterstütze uns" / "Support us"
   - `profile.supportDescription` → "Wenn dir The Pantry gefällt, unterstütze die Entwicklung mit einem Kaffee!" / "If you enjoy The Pantry, support development with a coffee!"

4. **PremiumUpgradeDialog.tsx** — Den bestehenden "Kontaktiere den Admin"-Text durch einen Ko-fi-Link ersetzen, damit Nutzer direkt spenden können wenn sie auf Premium-Limits stossen.

### Hinweis
Du musst zuerst ein Ko-fi-Konto erstellen (ko-fi.com) und mir dann deinen Ko-fi-Benutzernamen geben, damit ich den richtigen Link einbauen kann. Alternativ verwende ich einen Platzhalter-Link den du später anpasst.

