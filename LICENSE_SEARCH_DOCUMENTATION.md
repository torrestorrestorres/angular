# Lizenz-Suche Frontend - Dokumentation

Komplette Dokumentation für die Lizenz-Suche mit Datenbankschema, Datenstrukturen und praktischen Beispielen.

---

## 📊 Datenbankschema

### Haupttabelle: `licenses`

```sql
CREATE TABLE licenses (
    id                  INTEGER PRIMARY KEY,
    product_id          UUID NULLABLE REFERENCES products(id),
    product_family_id   UUID NULLABLE REFERENCES product_families(id),
    license_type        INTEGER NOT NULL,              -- LicenseType enum
    signature_format    VARCHAR(10) NOT NULL,          -- "JWS" oder "JSF"
    signed_content      TEXT NOT NULL,                 -- Signierte Lizenz
    status              INTEGER NOT NULL DEFAULT 0,    -- StoredLicenseStatus enum
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at          TIMESTAMP NULLABLE,
    file_size           BIGINT NOT NULL,
    created_by          VARCHAR(255) NULLABLE,
    tier                VARCHAR(100) NULLABLE,
    
    -- Indizes für Performance
    INDEX idx_licenses_created_at (created_at),
    INDEX idx_licenses_status (status)
);
```

### Verwandte Tabellen

#### `products`
```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT NULLABLE,
    family_id       UUID NULLABLE REFERENCES product_families(id),
    status          INTEGER NOT NULL                   -- ProductStatus enum
);
```

#### `product_families`
```sql
CREATE TABLE product_families (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT NULLABLE,
    status          INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `license_features`
```sql
CREATE TABLE license_features (
    id              UUID PRIMARY KEY,
    license_id      INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    feature_id      UUID NOT NULL REFERENCES features(id),
    value           VARCHAR NOT NULL                   -- Konkreter Wert für diese Lizenz
);
```

#### `features`
```sql
CREATE TABLE features (
    id              UUID PRIMARY KEY,
    product_id      UUID NOT NULL REFERENCES products(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT NULLABLE,
    data_type       VARCHAR(50) NOT NULL              -- "string", "int", "bool", etc.
);
```

---

## 🔑 Enums

### `LicenseType` (für `license_type` Feld)

| Wert | Name | Beschreibung |
|------|------|-------------|
| 0 | **Perpetual** | Läuft nie ab. Typisch für One-Time-Purchase Software |
| 1 | **Fallback** | Fallback auf spezifische Version bei Ablauf |
| 2 | **Timed** | Läuft an einem bestimmten Datum ab. Für Trials |
| 3 | **Subscription** | Erneuerbare Lizenz (monatlich/jährlich) |
| 4 | **Tiered** | Feature-Tiers (Free, Basic, Plus, Premium) |
| 5 | **Freemium** | Kostenlos mit eingeschränkten Features |

### `StoredLicenseStatus` (für `status` Feld)

| Wert | Name | Beschreibung | CSS-Klasse |
|------|------|-------------|------------|
| 0 | **Active** | Lizenz ist gültig und aktiv | `.license-status.active` (grün) |
| 1 | **Expired** | Lizenz ist abgelaufen | `.license-status.expired` (rot) |
| 2 | **Revoked** | Lizenz wurde widerrufen | `.license-status.revoked` (rot) |
| 3 | **Suspended** | Lizenz ist ausgesetzt | `.license-status.suspended` (gelb) |

### `ProductStatus` (für `products.status`)

| Wert | Name | Beschreibung |
|------|------|-------------|
| 0 | **Active** | Aktiv entwickelt und unterstützt |
| 1 | **Deprecated** | Veraltet, nur kritische Fixes |
| 2 | **EndOfLife** | Keine Support oder Updates |

---

## 📋 Lizenz-Response Beispiel

### API Response von `/api/storedlicenses`

```json
{
  "id": 42,
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "productName": "Infodas ERP System",
  "productFamilyId": null,
  "productFamilyName": "",
  "type": 3,
  "signatureFormat": "JWS",
  "status": 0,
  "createdAt": "2025-11-15T09:30:45.000Z",
  "expiresAt": "2026-11-15T23:59:59.000Z",
  "fileSize": 2048,
  "tier": "Professional",
  "features": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "value": "10",
      "feature": {
        "name": "Max Users",
        "dataType": "int",
        "description": "Maximale Anzahl von Benutzern"
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "value": "true",
      "feature": {
        "name": "Advanced Reports",
        "dataType": "bool",
        "description": "Aktiviert erweiterte Berichtsfunktionen"
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440003",
      "value": "Enterprise",
      "feature": {
        "name": "Support Level",
        "dataType": "string",
        "description": "Art des technischen Supports"
      }
    }
  ]
}
```

---

## 🔍 Such-Filter Parameter

### Suchendpunkt: `GET /api/storedlicenses/search`

**Query Parameter:**

| Parameter | Typ | Beschreibung | Beispiel |
|-----------|-----|-------------|---------|
| `productId` | UUID | Nach Produkt filtern | `?productId=550e8400-e29b-41d4-a716-446655440000` |
| `productFamilyId` | UUID | Nach Produktfamilie filtern | `?productFamilyId=550e8400-e29b-41d4-a716-446655440001` |
| `status` | int | Nach Status filtern (0-3) | `?status=0` (Active) |
| `signatureFormat` | string | Nach Signaturformat filtern | `?signatureFormat=JWS` |

**Kombinierte Such-URL:**

```
/api/storedlicenses/search?productId=550e8400-e29b-41d4-a716-446655440000&status=0&signatureFormat=JWS
```

---

## 📊 Frontend Filter-Datenstrukturen

### Filter-Objekt für die Suche

```javascript
const searchFilters = {
  // Produktfilter
  productId: null,          // UUID oder null
  productFamilyId: null,    // UUID oder null
  
  // Lizenzfilter
  status: null,             // 0, 1, 2, 3 oder null
  licenseType: null,        // 0-5 oder null
  signatureFormat: null,    // "JWS", "JSF" oder null
  
  // Datum-Filter
  createdAfter: null,       // ISO Date String oder null
  createdBefore: null,      // ISO Date String oder null
  
  // Sonstiges
  searchText: ""            // Freie Textsuche
};
```

### Status-Namen und Farben (JavaScript)

```javascript
const STATUS_MAP = {
  0: { name: 'Active', class: 'active', color: '#d4edda', textColor: '#155724' },
  1: { name: 'Expired', class: 'expired', color: '#f8d7da', textColor: '#721c24' },
  2: { name: 'Revoked', class: 'revoked', color: '#f5c6cb', textColor: '#721c24' },
  3: { name: 'Suspended', class: 'suspended', color: '#fff3cd', textColor: '#856404' }
};

const LICENSE_TYPE_MAP = {
  0: 'Perpetual',
  1: 'Fallback',
  2: 'Timed',
  3: 'Subscription',
  4: 'Tiered',
  5: 'Freemium'
};
```

---

## 💾 Vollständige Beispieldaten

### Beispiel 1: Perpetual License (Active)

```json
{
  "id": 1,
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "productName": "AutoCAD 2025",
  "productFamilyId": null,
  "productFamilyName": "",
  "type": 0,
  "signatureFormat": "JWS",
  "status": 0,
  "createdAt": "2020-01-15T10:00:00Z",
  "expiresAt": null,
  "fileSize": 1024,
  "tier": "Enterprise",
  "features": [
    {
      "id": "f1",
      "value": "unlimited",
      "feature": {
        "name": "Max Projects",
        "dataType": "string",
        "description": "Anzahl der Projekte"
      }
    }
  ]
}
```

### Beispiel 2: Subscription License (Expired)

```json
{
  "id": 2,
  "productId": "550e8400-e29b-41d4-a716-446655440001",
  "productName": "Microsoft 365",
  "productFamilyId": "550e8400-e29b-41d4-a716-446655440002",
  "productFamilyName": "Microsoft Office Suite",
  "type": 3,
  "signatureFormat": "JWS",
  "status": 1,
  "createdAt": "2024-11-01T08:00:00Z",
  "expiresAt": "2025-10-31T23:59:59Z",
  "fileSize": 512,
  "tier": "Professional",
  "features": [
    {
      "id": "f2",
      "value": "5",
      "feature": {
        "name": "Seat Count",
        "dataType": "int",
        "description": "Anzahl der Benutzer"
      }
    },
    {
      "id": "f3",
      "value": "true",
      "feature": {
        "name": "Advanced Security",
        "dataType": "bool",
        "description": "Erweiterte Sicherheitsfeatures"
      }
    }
  ]
}
```

### Beispiel 3: Timed License (Suspended)

```json
{
  "id": 3,
  "productId": "550e8400-e29b-41d4-a716-446655440003",
  "productName": "JetBrains IntelliJ IDEA",
  "productFamilyId": null,
  "productFamilyName": "",
  "type": 2,
  "signatureFormat": "JSF",
  "status": 3,
  "createdAt": "2025-12-01T14:30:00Z",
  "expiresAt": "2026-12-01T23:59:59Z",
  "fileSize": 2048,
  "tier": "Individual",
  "features": [
    {
      "id": "f4",
      "value": "30",
      "feature": {
        "name": "Trial Days",
        "dataType": "int",
        "description": "Tage für Trial-Phase"
      }
    }
  ]
}
```

### Beispiel 4: Tiered License (Revoked)

```json
{
  "id": 4,
  "productId": "550e8400-e29b-41d4-a716-446655440004",
  "productName": "SaaS Application",
  "productFamilyId": "550e8400-e29b-41d4-a716-446655440005",
  "productFamilyName": "Cloud Services",
  "type": 4,
  "signatureFormat": "JWS",
  "status": 2,
  "createdAt": "2025-01-10T11:20:00Z",
  "expiresAt": "2026-01-10T23:59:59Z",
  "fileSize": 4096,
  "tier": "Enterprise",
  "features": [
    {
      "id": "f5",
      "value": "1000",
      "feature": {
        "name": "API Calls Per Month",
        "dataType": "int",
        "description": "Limit für API-Aufrufe"
      }
    },
    {
      "id": "f6",
      "value": "Premium",
      "feature": {
        "name": "Feature Tier",
        "dataType": "string",
        "description": "Aktueller Feature-Tier"
      }
    },
    {
      "id": "f7",
      "value": "true",
      "feature": {
        "name": "Custom Integrations",
        "dataType": "bool",
        "description": "Benutzerdefinierte Integrationen erlaubt"
      }
    }
  ]
}
```

---

## 🎨 Filter-UI Komponenten

### Select-Optionen für Status

```javascript
const STATUS_OPTIONS = [
  { value: null, label: 'Alle Status' },
  { value: 0, label: 'Active' },
  { value: 1, label: 'Expired' },
  { value: 2, label: 'Revoked' },
  { value: 3, label: 'Suspended' }
];
```

### Select-Optionen für License Type

```javascript
const LICENSE_TYPE_OPTIONS = [
  { value: null, label: 'Alle Typen' },
  { value: 0, label: 'Perpetual' },
  { value: 1, label: 'Fallback' },
  { value: 2, label: 'Timed' },
  { value: 3, label: 'Subscription' },
  { value: 4, label: 'Tiered' },
  { value: 5, label: 'Freemium' }
];
```

### Select-Optionen für Signature Format

```javascript
const SIGNATURE_FORMAT_OPTIONS = [
  { value: null, label: 'Alle Formate' },
  { value: 'JWS', label: 'JWS (JSON Web Signature)' },
  { value: 'JSF', label: 'JSF (JSON Signature Format)' }
];
```

---

## 🔗 API Endpoints Übersicht

### Lizenz-Operationen

| Methode | Endpoint | Beschreibung |
|---------|----------|-------------|
| GET | `/api/storedlicenses` | Alle Lizenzen abrufen |
| GET | `/api/storedlicenses/{id}` | Lizenz nach ID abrufen |
| GET | `/api/storedlicenses/search` | Lizenzen mit Filtern suchen |
| PUT | `/api/storedlicenses/{id}/status` | Status aktualisieren |
| DELETE | `/api/storedlicenses/{id}` | Lizenz löschen |
| GET | `/api/storedlicenses/stats` | Statistiken abrufen |

### Produktverwandte Endpoints

| Methode | Endpoint | Beschreibung |
|---------|----------|-------------|
| GET | `/api/products` | Alle Produkte abrufen |
| GET | `/api/productfamilies` | Alle Produktfamilien abrufen |

---

## 📐 CSS Klassen für Styling

```css
/* Status-Badges */
.license-status.active {
    background-color: #d4edda;
    color: #155724;
}

.license-status.expired {
    background-color: #f8d7da;
    color: #721c24;
}

.license-status.revoked {
    background-color: #f5c6cb;
    color: #721c24;
}

.license-status.suspended {
    background-color: #fff3cd;
    color: #856404;
}
```

---

## 🔄 Typische Such-Szenarien

### Szenario 1: Alle aktiven Lizenzen für ein Produkt

```
GET /api/storedlicenses/search?productId=550e8400-e29b-41d4-a716-446655440000&status=0
```

**Ergebnis:** Alle Lizenzen für das Produkt "Infodas ERP System", die den Status "Active" haben.

### Szenario 2: Alle abgelaufenen Subscriptions

```
GET /api/storedlicenses/search?status=1&licenseType=3
```

**Ergebnis:** Alle Subscription-Lizenzen, die abgelaufen sind.

### Szenario 3: Alle von einer Produktfamilie

```
GET /api/storedlicenses/search?productFamilyId=550e8400-e29b-41d4-a716-446655440002
```

**Ergebnis:** Alle Lizenzen, die zur Produktfamilie "Microsoft Office Suite" gehören.

---

## 📝 Hinweise für die Frontend-Implementierung

1. **Status-Mapping:** Die Zahlenwerte (0-3) müssen immer auf aussagekräftige Namen gemappt werden
2. **Datum-Formate:** Verwende ISO 8601 Format für Datumsangaben
3. **Features:** Features sind dynamisch pro Lizenz - die Liste kann unterschiedlich sein
4. **Pagination:** Für große Datenmengen sollte Pagination implementiert werden
5. **Echtzeit-Filtering:** Filter können kombiniert werden für präzisere Suche
6. **Performance:** Nutze die Indizes auf `created_at` und `status` für schnelle Abfragen

