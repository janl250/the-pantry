

# Premium Features mit Stripe Abo

## Ubersicht

Einführung eines Freemium-Modells mit Stripe-Monatsabo. Kostenlose Nutzer haben eingeschränkten Zugang, Premium-Nutzer erhalten alle Features unbegrenzt.

## Limits (Gratis vs. Premium)

| Feature | Gratis | Premium |
|---------|--------|---------|
| Eigene Gerichte | Max. 10 | Unbegrenzt |
| Gruppen beitreten | Max. 3 | Unbegrenzt |
| Mitglieder pro Gruppe | Max. 5 | Unbegrenzt |
| KI-Wochenplan-Generator | Gesperrt | Verfügbar |
| KI-Zutaten-Rezeptgenerator | Gesperrt | Verfügbar |
| KI-Foto-Erkennung | Gesperrt | Verfügbar |

## Technischer Ablauf

### 1. Stripe aktivieren und Abo-Produkt anlegen
- Stripe-Integration über Lovable aktivieren (Tool)
- Monatliches Abo-Produkt + Preis erstellen (z.B. 2.99 EUR/Monat)

### 2. Datenbank: Subscriptions-Tabelle
Neue Tabelle `subscriptions` um den Abo-Status zu tracken:

```text
subscriptions
- id (uuid, PK)
- user_id (uuid, NOT NULL, references auth.users)
- stripe_customer_id (text)
- stripe_subscription_id (text)
- status (text: active, canceled, past_due, etc.)
- current_period_end (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

RLS: Nutzer können nur ihren eigenen Eintrag lesen. Schreiben nur via Edge Function (service_role).

Security Definer Funktion `is_premium(user_id)` die prüft ob ein aktives Abo besteht -- wird in RLS und Frontend genutzt.

### 3. Edge Functions

**`create-checkout`**: Erstellt eine Stripe Checkout Session für das Monatsabo. Leitet den Nutzer zur Stripe-Zahlungsseite.

**`stripe-webhook`**: Empfängt Stripe-Events (subscription created, updated, deleted, payment failed) und aktualisiert die `subscriptions`-Tabelle.

**`customer-portal`**: Erstellt eine Stripe Billing Portal Session, damit Nutzer ihr Abo selbst verwalten/kündigen können.

### 4. Frontend: Premium Hook

Neuer Hook `usePremium()`:
- Prüft den `subscriptions`-Eintrag des eingeloggten Nutzers
- Gibt zurück: `isPremium`, `isLoading`, `subscription`
- Cached das Ergebnis mit React Query

### 5. Frontend: Limits durchsetzen

**DishLibrary.tsx**: Beim Hinzufügen eines neuen Gerichts prüfen ob < 10 eigene Gerichte. Falls Limit erreicht, Premium-Upgrade-Dialog anzeigen statt "Gericht hinzufügen".

**Groups.tsx**: Beim Erstellen/Beitreten prüfen ob < 3 Gruppen. Falls Limit erreicht, Upgrade-Dialog.

**GroupDetail.tsx**: Beim Beitreten prüfen ob < 5 Mitglieder (für Gratis-Gruppen-Ersteller).

**WeeklyCalendar.tsx**: KI-Wochenplan-Generator-Button zeigt Upgrade-Dialog für Gratis-Nutzer.

**IngredientFinder.tsx**: KI-Rezeptgenerator und Foto-Erkennung zeigen Upgrade-Dialog für Gratis-Nutzer.

### 6. Premium Upgrade Dialog (Neue Komponente)

`PremiumUpgradeDialog` -- wiederverwendbare Komponente die:
- Die Vorteile von Premium auflistet
- Den Preis zeigt (z.B. 2.99 EUR/Monat)
- Button "Jetzt upgraden" der zur Stripe Checkout weiterleitet
- Zweisprachig (DE/EN)

### 7. Premium-Status in Navigation/Profil

- Badge "Premium" neben dem Nutzernamen in der Navigation
- Abo-Verwaltung auf der Profilseite (Status, nächste Zahlung, Kündigen-Button via Stripe Portal)

## Reihenfolge der Umsetzung

1. Stripe aktivieren (Tool)
2. DB-Migration: `subscriptions` Tabelle + `is_premium()` Funktion
3. Edge Functions: `create-checkout`, `stripe-webhook`, `customer-portal`
4. `usePremium()` Hook
5. `PremiumUpgradeDialog` Komponente
6. Limits in allen betroffenen Seiten einbauen
7. Premium-Badge und Profil-Abo-Verwaltung

