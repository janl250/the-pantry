
# Premium Features (Manuelles System)

## Übersicht

Freemium-Modell mit manuellem Premium-System. Admin schaltet Nutzer über die Supabase-Datenbank frei.

## Limits (Gratis vs. Premium)

| Feature | Gratis | Premium |
|---------|--------|---------|
| Eigene Gerichte | Max. 10 | Unbegrenzt |
| Gruppen beitreten | Max. 3 | Unbegrenzt |
| KI-Wochenplan-Generator | Gesperrt | Verfügbar |
| KI-Zutaten-Rezeptgenerator | Gesperrt | Verfügbar |
| KI-Foto-Erkennung | Gesperrt | Verfügbar |

## Implementiert

- ✅ `subscriptions` Tabelle mit RLS
- ✅ `is_premium(user_id)` Security Definer Funktion
- ✅ `usePremium()` Hook mit React Query
- ✅ `PremiumUpgradeDialog` Komponente (zweisprachig)
- ✅ Limits in DishLibrary, Groups, WeeklyCalendar, IngredientFinder
- ✅ Premium-Badge in Navigation
- ✅ Premium-Status auf Profilseite

## Admin: Nutzer freischalten

In Supabase SQL Editor:
```sql
INSERT INTO public.subscriptions (user_id, status)
VALUES ('USER_UUID_HERE', 'active');
```

Zum Deaktivieren:
```sql
UPDATE public.subscriptions SET status = 'canceled' WHERE user_id = 'USER_UUID_HERE';
```
