# Lovable Cloud Migration Checklist

## Migreringsöversikt
- **Källa**: suoffsrethbczunoanmn.supabase.co (extern Supabase)
- **Mål**: Lovable Cloud (ny projektinstans)
- **Uppskattad tid**: 8-10 timmar
- **Data**: ~35 MB gallery-bilder + ~280 KB event-bilder

---

## Fas 1: Förberedelse ⏱️ ~1 timme

### 1.1 Exportera data
- [ ] Kör SQL-export från nuvarande databas
- [ ] Spara bildfiler lokalt från Storage
- [ ] Dokumentera alla secrets som används

### 1.2 Skapa nytt Lovable-projekt
- [ ] Skapa nytt projekt i Lovable
- [ ] Aktivera Lovable Cloud backend
- [ ] Notera nya projekt-URL:er

---

## Fas 2: Databas Setup ⏱️ ~2-3 timmar

### 2.1 Skapa schema
- [ ] Kör `01-schema.sql` för tabellstruktur
- [ ] Kör `02-functions.sql` för databasfunktioner
- [ ] Kör `03-triggers.sql` för triggers
- [ ] Kör `04-rls-policies.sql` för säkerhetspolicies

### 2.2 Verifiera schema
- [ ] Kontrollera att alla tabeller skapats
- [ ] Verifiera att RLS är aktiverat på alla tabeller
- [ ] Testa has_role-funktionen

---

## Fas 3: Storage Migration ⏱️ ~1-2 timmar

### 3.1 Skapa buckets
- [ ] Kör `05-storage.sql` för att skapa buckets
- [ ] Verifiera att storage policies är korrekta

### 3.2 Migrera filer
- [ ] Ladda upp bilder till gallery-images bucket
- [ ] Ladda upp bilder till event-images bucket
- [ ] Uppdatera file_path i gallery_images-tabellen

**Filer att migrera:**
```
gallery-images/
├── a305a6b1.../1754490410713.jpg (baren)
├── a305a6b1.../1754490421152.jpg (dart)
├── a305a6b1.../1754490437167.jpg (mb-photo-bild-4)
├── a305a6b1.../1754490395983.jpg (mb-photo-bild-12)
├── 423a698d.../1754510022516.jpeg (IMG_8679)
├── 423a698d.../1754510058389.jpeg (IMG_4564)
├── 423a698d.../1754510125563.jpeg (IMG_8678)
├── 423a698d.../1754510112065.jpeg (IMG_8682)
└── ... (totalt ~15 filer)

event-images/
├── 423a698d.../events/1768128182747.jpg
└── ... 
```

---

## Fas 4: Data Import ⏱️ ~1 timme

### 4.1 Importera seed data
- [ ] Kör `06-seed-data.sql`
- [ ] Verifiera öppettider (7 rader)
- [ ] Verifiera prislistan (14 rader)
- [ ] Verifiera menykategorier (6 rader)
- [ ] Verifiera menyrätter (~20 rader)
- [ ] Verifiera site content (5 rader)
- [ ] Verifiera livestreams (2 rader)
- [ ] Verifiera markarydsligan (7 serier)

### 4.2 Manuella justeringar
- [ ] Uppdatera image_url i events till nya storage-URL:er
- [ ] Uppdatera file_path i gallery_images till nya sökvägar

---

## Fas 5: Authentication ⏱️ ~1-2 timmar

### 5.1 Användarkonton
**Befintliga användare att återskapa:**

| Email | Roll | 
|-------|------|
| philipwendel@hotmail.com | admin |
| info@markarydsbowling.se | admin |

- [ ] Bjud in användare via Supabase Auth
- [ ] Verifiera att auto-admin för info@markarydsbowling.se fungerar
- [ ] Testa inloggning för båda användare

### 5.2 Testa rollsystem
- [ ] Verifiera admin-åtkomst till /admin
- [ ] Testa RLS-policies för olika roller

---

## Fas 6: Edge Functions ⏱️ ~1 timme

### 6.1 Kopiera edge functions
- [ ] Kopiera `register-interest` function
- [ ] Kopiera `compress-video` function (om behövs)

### 6.2 Konfigurera secrets
- [ ] Sätt VIDEO_COMPRESSION_API_KEY (om behövs)
- [ ] Verifiera SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

---

## Fas 7: Kod-uppdateringar ⏱️ ~1-2 timmar

### 7.1 Uppdatera Supabase-konfiguration
- [ ] Uppdatera VITE_SUPABASE_URL
- [ ] Uppdatera VITE_SUPABASE_PUBLISHABLE_KEY
- [ ] Uppdatera VITE_SUPABASE_PROJECT_ID

### 7.2 Uppdatera hårdkodade URL:er
- [ ] Sök efter `suoffsrethbczunoanmn` i koden
- [ ] Ersätt med nya projekt-ID
- [ ] Uppdatera storage-URL:er i event image_url

---

## Fas 8: Testning ⏱️ ~1 timme

### 8.1 Funktionstester
- [ ] Testa startsidan (hero, aktiviteter, öppettider)
- [ ] Testa bildgalleriet
- [ ] Testa menysidan
- [ ] Testa prislistan
- [ ] Testa evenemangssidan
- [ ] Testa livestream-sidan
- [ ] Testa Markarydsligan
- [ ] Testa admin-panelen

### 8.2 Autentiseringstester
- [ ] Testa inloggning
- [ ] Testa admin-funktioner
- [ ] Verifiera RLS fungerar korrekt

---

## Fas 9: Go-Live ⏱️ ~30 min

### 9.1 DNS/Publicering
- [ ] Publicera nya projektet
- [ ] Uppdatera DNS om custom domain
- [ ] Verifiera att allt fungerar på production URL

### 9.2 Städning
- [ ] Ta backup av gamla Supabase-projektet
- [ ] Inaktivera gamla projektet (efter verifierad funktion)

---

## Rollback Plan

Om något går fel:
1. Det gamla Supabase-projektet är fortfarande aktivt
2. Byt tillbaka URL:er i .env
3. Återgå till tidigare Lovable-deployment

---

## Uppskattade kostnadsbesparingar

| Kostnad | Före (Supabase Pro) | Efter (Lovable Cloud) |
|---------|---------------------|----------------------|
| Prenumeration | ~$25/mån | $0 (ingår i Lovable) |
| Egress | Varierar ($0.09/GB) | $0 (inkluderat) |
| **Total besparing** | | ~$25-50/mån |

---

## Kontakt vid problem

- Lovable Support: support@lovable.dev
- Dokumentation: docs.lovable.dev
