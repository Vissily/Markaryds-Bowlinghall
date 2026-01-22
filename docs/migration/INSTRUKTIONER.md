# Migrationsguide till Lovable Cloud

## Steg 1: Skapa nytt projekt
1. Gå till [lovable.dev](https://lovable.dev)
2. Klicka **"New Project"**
3. Ge projektet ett namn (t.ex. "Markaryds Bowling")
4. Vänta tills projektet skapats

## Steg 2: Aktivera Lovable Cloud
1. I det nya projektet, skriv i chatten:
   ```
   Aktivera Lovable Cloud
   ```
2. Klicka på godkänn-knappen som dyker upp
3. Vänta tills Cloud är aktiverat (några sekunder)

## Steg 3: Kör databasen
1. Öppna filen `docs/migration/00-FULL-MIGRATION.sql` i detta projekt
2. Kopiera **HELA** innehållet (Ctrl+A, Ctrl+C)
3. I det nya projektet, skriv i chatten:
   ```
   Kör denna SQL-migration:
   ```
4. Klistra in SQL-koden (Ctrl+V)
5. Skicka meddelandet
6. AI:n kommer visa en godkänn-knapp - klicka på den
7. Vänta tills migrationen är klar

## Steg 4: Ladda ner bilder från gamla projektet
1. Gå till Supabase Dashboard: https://supabase.com/dashboard/project/suoffsrethbczunoanmn/storage/buckets
2. Klicka på **gallery-images**
3. Ladda ner alla bilder (högerklicka → Download)
4. Gör samma sak för **event-images**

## Steg 5: Ladda upp bilder till nya projektet
1. I det nya projektet, skriv i chatten:
   ```
   Skapa storage buckets för gallery-images och event-images
   ```
2. Gå till det nya projektets Supabase Storage (länk visas i chatten)
3. Ladda upp alla bilder du laddade ner

## Steg 6: Kopiera koden
1. I det gamla projektet (detta), gå till GitHub-länken (finns i projektinställningarna)
2. Ladda ner hela repot som ZIP
3. I det nya projektet, dra och släpp filerna eller kopiera dem en i taget

**Alternativ (enklare):**
Skriv i chatten i nya projektet:
```
Kopiera all kod från GitHub: [din-github-länk]
```

## Steg 7: Skapa admin-användare
1. I det nya projektet, gå till appen och registrera dig med:
   - Email: `info@markarydsbowling.se`
   - Valfritt lösenord
2. Du blir automatiskt admin (det finns en trigger för detta)

## Steg 8: Testa
1. Logga in som admin
2. Kontrollera att admin-panelen fungerar
3. Kontrollera att bilder visas
4. Kontrollera att menyn visas

## Steg 9: Publicera
1. Klicka på **Publish** i Lovable
2. Uppdatera DNS om du har egen domän

---

## Frågor?
Om något inte fungerar, skriv i chatten vad som händer så hjälper AI:n dig.
