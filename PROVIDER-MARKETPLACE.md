# Hardware Provider Marketplace

## 🎯 Genel Bakış

HitForget artık **freelancer benzeri bir donanım marketplace**! Kullanıcılar kendi eval board'larını platforma ekleyip başkalarına kiralayabilir ve gelir elde edebilir.

## 💡 Konsept

### Kullanım Senaryoları

**Scenario 1: TechLab Istanbul**
```
Elimde 15 adet farklı eval board var (Raspberry Pi, STM32, FPGA)
→ HitForget'e provider olarak kaydoldum
→ Cihazlarımı ekledim, saat başı $1-5 fiyat belirledim
→ Network'e takıp 24/7 erişilebilir yaptım
→ Her ay ~$1200 pasif gelir elde ediyorum
→ Platform %30 komisyon alıyor, ben %70 alıyorum
```

**Scenario 2: Üniversite Laboratuvarı**
```
100+ öğrencimiz var, 30 adet development board
→ Öğrenciler remote erişimle 7/24 çalışabiliyor
→ Laboratuvar maliyetlerini telafi ediyoruz
→ Fiziksel erişim problemi yok
```

**Scenario 3: Hobi Kullanıcısı**
```
Bir Raspberry Pi 5 aldım, günde sadece 2 saat kullanıyorum
→ Geri kalan 22 saati başkalarına kirala
→ Aylık ~$60-100 arası gelir
→ Cihazın maliyeti 3 ayda çıkıyor
```

---

## 🗄️ Database Schema

### 1. `hardware_providers` - Provider Profilleri

```sql
CREATE TABLE hardware_providers (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,           -- Hangi kullanıcı
  business_name VARCHAR(255),    -- İş/Lab adı
  description TEXT,              -- Açıklama
  website TEXT,
  location VARCHAR(255),         -- Konum (Istanbul, Turkey)
  is_verified BOOLEAN,           -- Doğrulanmış provider
  rating DECIMAL(3,2),           -- 0.00 - 5.00
  total_reviews INTEGER,
  total_devices INTEGER,
  total_bookings INTEGER,
  revenue_share_percentage INT,  -- Default 70%
  status VARCHAR(50),            -- pending, active, suspended
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. `devices` - Güncellenmiş Cihazlar

```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  provider_id UUID,              -- NULL = platform owned
  device_type VARCHAR(100),      -- raspberry_pi_5
  device_name VARCHAR(255),      -- "My Raspberry Pi 5"
  description TEXT,              -- Özel açıklama
  image_url TEXT,                -- Cihaz fotoğrafı
  slot_number INTEGER,
  rack_id VARCHAR(50),
  status VARCHAR(50),            -- available, in_use, maintenance
  is_public BOOLEAN,             -- Marketplace'de görünsün mü?
  hourly_rate_usd DECIMAL(10,2), -- $2.00/saat
  health_status JSONB,
  specifications JSONB,          -- {cpu, ram, storage, ports, etc.}
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. `favorites` - Favori Sistem

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID,
  favorite_type VARCHAR(50),     -- 'provider' veya 'user'
  favorite_provider_id UUID,
  favorite_user_id UUID,
  created_at TIMESTAMP
);
```

### 4. `ratings` - Rating ve Review

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY,
  user_id UUID,
  provider_id UUID,
  device_id UUID,
  session_id UUID,
  rating INTEGER,                -- 1-5 yıldız
  review TEXT,
  response TEXT,                 -- Provider'ın cevabı
  is_verified BOOLEAN,           -- Doğrulanmış alım
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. `bookings` - Rezervasyon

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID,
  device_id UUID,
  provider_id UUID,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_hours INTEGER,
  hourly_rate DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  status VARCHAR(50),            -- pending, confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 6. `provider_earnings` - Gelir Takibi

```sql
CREATE TABLE provider_earnings (
  id UUID PRIMARY KEY,
  provider_id UUID,
  session_id UUID,
  booking_id UUID,
  device_id UUID,
  gross_amount DECIMAL(10,2),    -- Toplam
  platform_fee DECIMAL(10,2),    -- %30 platform
  net_amount DECIMAL(10,2),      -- %70 provider
  status VARCHAR(50),            -- pending, processing, paid
  paid_at TIMESTAMP,
  created_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Provider Management

```typescript
// Provider olarak kaydol
POST /api/providers
{
  "businessName": "TechLab Istanbul",
  "description": "Professional hardware testing lab",
  "website": "https://techlab.ist",
  "location": "Istanbul, Turkey"
}
→ Response: { provider: {...}, status: "pending" }

// Tüm provider'ları listele (marketplace)
GET /api/providers
GET /api/providers?verified=true
→ Response: { providers: [...] }

// Provider detayları
GET /api/providers/:id
→ Response: { provider: {...}, devices: [...] }

// Provider profilini güncelle
PUT /api/providers/:id
{
  "businessName": "Updated Name",
  "description": "New description"
}
```

### Device Management

```typescript
// Provider'ın cihazlarını listele
GET /api/providers/:providerId/devices

// Cihaz ekle
POST /api/providers/:providerId/devices
{
  "deviceType": "raspberry_pi_5",
  "deviceName": "My Pi 5 with Camera",
  "description": "8GB RAM, with camera module",
  "hourlyRateUsd": "2.50",
  "isPublic": true,
  "specifications": {
    "cpu": "Broadcom BCM2712",
    "ram": "8GB",
    "storage": "64GB SD",
    "peripherals": ["camera", "usb-c"]
  }
}
```

### Favorites

```typescript
// Favorilere ekle
POST /api/favorites
{
  "favoriteType": "provider",
  "favoriteProviderId": "uuid"
}

// Favorileri listele
GET /api/favorites
GET /api/favorites?type=provider
```

### Ratings & Reviews

```typescript
// Rating ekle
POST /api/ratings
{
  "providerId": "uuid",
  "deviceId": "uuid",
  "rating": 5,
  "review": "Excellent hardware, fast connection!"
}

// Provider'ın rating'lerini gör
GET /api/ratings?providerId=uuid
```

---

## 🎨 UI Sayfaları

### 1. Marketplace (`/marketplace`)

**Özellikler**:
- Tüm provider'ları grid layout'ta göster
- Her card'da:
  - Business name + verified badge
  - Rating (yıldız) + review sayısı
  - Konum
  - Toplam cihaz sayısı
  - Örnek 3 cihaz + fiyatları
  - Favori butonu (kalp ikonu)
- Filtreler:
  - All Providers
  - Verified Only
  - Top Rated
  - Near Me

**Görsel**:
```
┌────────────────────────────────────────┐
│ TechLab Istanbul  [✓] [♥]              │
│ ⭐ 4.8 (127)  📍 Istanbul              │
│                                        │
│ Professional hardware testing lab...   │
│                                        │
│ Available Devices: 15 boards           │
│ • Raspberry Pi 5 [3x]     $2.00/hr    │
│ • STM32 Nucleo [5x]       $1.50/hr    │
│ • Intel FPGA [2x]         $5.00/hr    │
│                                        │
│          [View Provider]               │
└────────────────────────────────────────┘
```

### 2. Provider Dashboard (`/provider/dashboard`)

**Tabs**:
- **My Devices**: Cihazlarını yönet
- **Bookings**: Rezervasyonları gör
- **Earnings**: Gelir takibi
- **Reviews**: Müşteri yorumları

**Stats**:
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Total       │ │ Active      │ │ Rating      │ │ Bookings    │
│ Earnings    │ │ Devices     │ │             │ │             │
│ $1,245.50   │ │ 6/8         │ │ 4.7 ⭐     │ │ 127 total   │
│ +$387 month │ │             │ │ 43 reviews  │ │ 5 upcoming  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Devices Tab**:
```
┌──────────────────────────────────────────────────┐
│ Raspberry Pi 5              [in_use]             │
│ ARM SBC                                          │
│ $2.00/hr • 45 bookings                          │
│                        [Edit] [Stats]            │
├──────────────────────────────────────────────────┤
│ STM32 Nucleo F401          [available]           │
│ ARM Cortex-M                                     │
│ $1.50/hr • 32 bookings                          │
│                        [Edit] [Stats]            │
└──────────────────────────────────────────────────┘
```

**Earnings Tab**:
```
┌──────────────────────────────────┐
│ Pending Payout                   │
│ $387.20                          │
│           [Request Payout]       │
├──────────────────────────────────┤
│ This Month      All Time         │
│ $387.20        $1,245.50         │
│ +15% ↑         Since 2025        │
└──────────────────────────────────┘
```

### 3. Provider Registration (`/provider/register`)

**Sections**:
- **Benefits**: Neden provider olmalı?
  - 💰 70% revenue
  - 🌍 Global marketplace
  - 🛡️ Fully managed
  - 📊 Analytics

- **Requirements**: Ne gerekli?
  - ✅ Stable internet (10+ Mbps)
  - ✅ 24/7 availability
  - ✅ Quality hardware
  - ✅ Basic setup

- **Application Form**:
  - Business/Lab name
  - Location
  - Description
  - Website (optional)
  - Hardware list
  - Experience level
  - Terms & conditions checkbox

---

## 💰 Revenue Model

### Gelir Paylaşımı

```
Örnek: Raspberry Pi 5 - $2.00/saat
Kullanıcı 5 saat kullandı = $10.00

Platform Fee (30%):  $3.00
Provider Net (70%):  $7.00
```

### Payout Sistemi

```typescript
// Provider earnings calculation
const calculateEarnings = (booking) => {
  const grossAmount = booking.hourlyRate * booking.durationHours;
  const platformFee = grossAmount * 0.30;
  const netAmount = grossAmount * 0.70;

  return {
    grossAmount,   // $10.00
    platformFee,   // $3.00
    netAmount,     // $7.00
  };
};
```

---

## 🌟 Kullanım Örnekleri

### Örnek 1: Lab Sahibi

```bash
# 1. Provider olarak kayıt ol
POST /api/providers
{
  "businessName": "Istanbul Embedded Lab",
  "location": "Istanbul, Turkey",
  "description": "15 years experience in embedded systems"
}

# 2. Cihazlarını ekle
POST /api/providers/{id}/devices
{
  "deviceName": "Raspberry Pi 5 - Lab Station 1",
  "deviceType": "raspberry_pi_5",
  "hourlyRateUsd": "2.50",
  "specifications": {
    "ram": "8GB",
    "storage": "128GB SD",
    "peripherals": ["camera", "touchscreen"]
  }
}

# 3. Dashboard'dan takip et
GET /provider/dashboard
→ Earnings, bookings, ratings göster
```

### Örnek 2: Müşteri

```bash
# 1. Marketplace'de ara
GET /marketplace
→ Provider'ları gör, filtrele

# 2. Provider'a bak
GET /marketplace/{providerId}
→ Cihazları, rating'leri gör

# 3. Favoriye ekle
POST /api/favorites
{ "favoriteType": "provider", "favoriteProviderId": "..." }

# 4. Cihaz rezerve et (gelecek özellik)
POST /api/bookings
{
  "deviceId": "...",
  "startTime": "2025-11-10T14:00:00Z",
  "durationHours": 3
}

# 5. Kullanımdan sonra rating ver
POST /api/ratings
{
  "providerId": "...",
  "rating": 5,
  "review": "Harika bir deneyimdi!"
}
```

---

## 📊 İstatistikler

### Provider Dashboard Stats

```typescript
interface ProviderStats {
  totalEarnings: number;      // $1,245.50
  thisMonth: number;          // $387.20
  totalDevices: number;       // 8
  activeDevices: number;      // 6
  rating: number;             // 4.7
  totalReviews: number;       // 43
  totalBookings: number;      // 127
  upcomingBookings: number;   // 5
}
```

### Marketplace Filters

- **All Providers**: Tüm provider'lar
- **Verified Only**: Sadece doğrulanmış
- **Top Rated**: Rating > 4.5
- **Near Me**: Lokasyon bazlı (gelecek)

---

## 🔮 Gelecek Özellikler

### Phase 2
- [ ] Booking/rezervasyon sistemi implementasyonu
- [ ] Stripe Connect entegrasyonu (automated payouts)
- [ ] Provider verification süreci
- [ ] Device health monitoring (auto-disable unhealthy devices)
- [ ] Advanced search ve filtering
- [ ] Provider analytics (grafik, trendler)

### Phase 3
- [ ] Dynamic pricing (demand-based)
- [ ] Provider tiers (Basic, Pro, Enterprise)
- [ ] Bulk booking discounts
- [ ] Subscription plans (unlimited access)
- [ ] Provider API (programmatic access)
- [ ] Mobile app (iOS/Android)

---

## 🎯 Özetçe

**Artık HitForget bir marketplace!**

✅ Kendi donanımını paylaş
✅ Pasif gelir elde et
✅ Başkalarının cihazlarını kirala
✅ Rating ve review sistemi
✅ Favori provider'ları takip et
✅ %70 provider, %30 platform paylaşımı

**Kullanıma Hazır Sayfalar**:
- `/marketplace` - Provider ve cihazlara gözat
- `/provider/register` - Provider ol
- `/provider/dashboard` - Cihazlarını yönet, gelirini gör

**URL**: https://hitforget.vercel.app/marketplace

🚀 **Deploy edilmeye hazır!**
