// Supabase/Deno kütüphanelerini içe aktar
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// CORS başlıklarını tanımla
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1. GİRDİ DOĞRULAMA (VALIDATION) ŞEMASI (Genişletildi)
// Sprint 5'e hazırlık olarak 'categories' ve 'fields' gibi opsiyonel
// Foursquare parametrelerini de kabul edecek şekilde güncellendi.
const FoursquareSearchSchema = z.object({
  query: z.string().min(1, { message: "Query boş olamaz" }),
  ll: z.string().regex(
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
    { message: "Geçersiz 'enlem,boylam' formatı" }
  ),
  radius: z.number().optional().default(5000),
  categories: z.string().optional(), // Örn: "13031,13065" (Cafe, Restaurant)
  fields: z.string().optional(), // Örn: "fsq_id,name,geocodes,location,categories,hours"
});

/**
 * SPRINT 5 YENİ GÖREVİ: Foursquare sonuçlarını 'locations' tablosuna yaz.
 * Bu fonksiyon, ana akışı engellememek için 'fire-and-forget' olarak çağrılır.
 * Foursquare'den gelen veriyi, 'locations' tablomuzun şemasına uyarlar
 * ve veritabanına 'upsert' (INSERT veya UPDATE) yapar.
 */
async function cacheFoursquareResults(
  results: any[],
  query: string,
  supabaseAdmin: any // Service Role istemcisi
) {
  if (!results || results.length === 0) {
    console.log("Sprint 5: Önbelleğe yazılacak sonuç bulunamadı.");
    return;
  }

  // Gelen Foursquare verisini 'locations' tablo şemamıza map'liyoruz.
  const locationsToUpsert = results.map((result) => {
    // PostGIS formatı: POINT(Longitude Latitude)
    const coordinates = result.geocodes?.main
      ? `POINT(${result.geocodes.main.longitude} ${result.geocodes.main.latitude})`
      : null;

    // Sprint 5'in 'yazma' mantığı: 'vibes' dizisini mevcut arama sorgusuyla doldur.
    // Sprint 6'da (okuma eklenince) bu mantık, mevcut 'vibes' dizisiyle birleştirme
    // yapacak şekilde güncellenecektir.
    const vibes = [query.toLowerCase().trim()];

    return {
      fsq_id: result.fsq_id,
      name: result.name,
      address: result.location?.formatted_address,
      coordinates: coordinates,
      category: result.categories?.[0]?.name, // İlk kategoriyi al
      vibes: vibes,
      opening_hours: result.hours, // Foursquare 'hours' objesi (JSONB)
      fsq_data: result, // Foursquare'den gelen ham verinin tamamı
    };
  });

  console.log(`Sprint 5: ${locationsToUpsert.length} mekan önbelleğe yazılıyor...`);

  // Service Role istemcisini kullanarak RLS'yi atlar ve 'locations'a yazma yaparız.
  // 'onConflict' kullanarak fsq_id varsa UPDATE, yoksa INSERT (UPSERT) yaparız.
  const { error: upsertError } = await supabaseAdmin
    .from("locations")
    .upsert(locationsToUpsert, { onConflict: "fsq_id" });

  if (upsertError) {
    // Bu hata sadece sunucu loglarına düşer, kullanıcıya dönmez.
    console.error("Sprint 5: Önbelleğe yazma hatası:", upsertError.message);
  } else {
    console.log(`Sprint 5: Başarıyla ${locationsToUpsert.length} mekan 'locations' tablosuna yazıldı/güncellendi.`);
  }
}

console.log("foursquare-gateway fonksiyonu başlatıldı (Sprint 5 sürümü).");

serve(async (req) => {
  // 2. CORS PREFLIGHT İSTEĞİNİ YÖNETME
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 3. KİMLİK DOĞRULAMA (AUTHENTICATION)
    // a. Kullanıcıya-özel istemci (User-scoped client)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") },
        },
      }
    );

    // b. Kullanıcının JWT'sini doğrula
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth hatası:", authError?.message);
      return new Response(JSON.stringify({ error: "Geçersiz veya süresi dolmuş token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`İstek yapan kullanıcı: ${user.email}`);

    // c. Service Role İstemcisi (SPRINT 5 İÇİN YENİ)
    // Bu istemci, RLS'yi atlayarak 'locations' tablosuna yazmak için kullanılır.
    // Sadece sunucu tarafında (edge function) güvenle kullanılır.
    const supabaseServiceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // 4. İSTEK GÖVDESİNİ (BODY) ALMA VE DOĞRULAMA
    const body = await req.json();
    const validation = FoursquareSearchSchema.safeParse(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: "Geçersiz istek verisi", details: validation.error.format() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Doğrulanmış veriyi al (genişletilmiş şema ile)
    const { query, ll, radius, categories, fields } = validation.data;

    // 5. GİZLİ API ANAHTARINI ALMA
    const FOURSQUARE_API_KEY = Deno.env.get("FOURSQUARE_API_KEY");
    if (!FOURSQUARE_API_KEY) {
      throw new Error("FOURSQUARE_API_KEY sunucuda ayarlanmamış!");
    }

    // 6. HARİCİ API'Yİ (FOURSQUARE) GÜVENLİ BİR ŞEKİLDE ÇAĞIRMA
    console.log(`Foursquare'e istek gönderiliyor: query=${query}, ll=${ll}`);
    const fsqUrl = new URL("https://places-api.foursquare.com/places/search");
    fsqUrl.searchParams.set("query", query);
    fsqUrl.searchParams.set("ll", ll);
    fsqUrl.searchParams.set("radius", radius.toString());

    // Opsiyonel Foursquare parametrelerini ekle
    if (categories) fsqUrl.searchParams.set("categories", categories);
    // 'fields' parametresi, 'locations' tablosunu doldurmak için gereken
    // tüm alanları içermelidir (fsq_id, name, geocodes, location, categories, hours).
    // İyi bir varsayılan belirleyebiliriz:
    const defaultFields = "fsq_id,name,geocodes,location,categories,hours,distance";
    fsqUrl.searchParams.set("fields", fields || defaultFields);

    const fsqResponse = await fetch(fsqUrl.toString(), {
      method: "GET",
      headers: {
        'X-Places-Api-Version': '2025-06-17', // API versiyonunu sabit tutmak iyi bir pratik
        "authorization": `Bearer ${FOURSQUARE_API_KEY}`,
        "accept": "application/json",
      },
    });

    if (!fsqResponse.ok) {
      throw new Error(`Foursquare API hatası: ${fsqResponse.statusText}`);
    }

    const data = await fsqResponse.json();

    // 7. [YENİ - SPRINT 5] ÖNBELLEĞE YAZMA İŞLEMİNİ TETİKLEME
    // Bu işlemi 'await' ETMİYORUZ. Bu bir "fire-and-forget" çağrısıdır.
    // Kullanıcının, veritabanı yazma işlemini beklemesini istemiyoruz.
    // Hata olursa, sadece sunucu loglarına yazılacak.
    cacheFoursquareResults(data.results, query, supabaseServiceRoleClient)
      .catch((err) => {
        // Bu hata sadece sunucu loglarına gider, kullanıcıyı etkilemez.
        console.error("Önbelleğe yazma (async) hatası:", err.message);
      });

    // 8. SONUCU MOBİL UYGULAMAYA DÖNDÜRME (Eski 7. adım)
    // Foursquare'den gelen taze veriyi, DB'ye yazılmasını beklemeden
    // doğrudan kullanıcıya döndürüyoruz.
    return new Response(JSON.stringify(data.results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // 9. GENEL HATA YÖNETİMİ (Eski 8. adım)
    console.error("Beklenmedik hata:", error.message);
    return new Response(JSON.stringify({ error: "Sunucu hatası", message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});