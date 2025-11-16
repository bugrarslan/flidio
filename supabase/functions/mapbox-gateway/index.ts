// Supabase/Deno kütüphanelerini içe aktar
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// CORS başlıklarını tanımla
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// 1. GİRDİ DOĞRULAMA (VALIDATION) ŞEMASI (Zod ile)
// Mobil uygulamadan gelen isteğin gövdesinin (body) nasıl görünmesi gerektiğini tanımlar.
const MapboxRequestSchema = z.object({
  // 'directions' (rota çizme) veya 'matrix' (süre/mesafe matrisi)
  api: z.enum(["directions", "matrix"], {
    required_error: "API tipi ('directions' veya 'matrix') zorunludur"
  }),
  // Mapbox profil tipi
  profile: z.enum(["walking", "driving", "cycling"]).default("walking"),
  // Mapbox formatında koordinatlar: 'lon,lat;lon,lat;...'
  coordinates: z.string().min(10, {
    message: "Geçersiz veya eksik koordinat dizisi"
  }),
  // Mapbox'a gönderilecek ekstra parametreler
  // örn: { annotations: 'duration,distance' }
  params: z.record(z.string()).optional().default({})
});

console.log("mapbox-gateway fonksiyonu başlatıldı.");

serve(async (req)=>{
  // 2. CORS PREFLIGHT İSTEĞİNİ YÖNETME
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // 3. KİMLİK DOĞRULAMA (AUTHENTICATION)
    // Sadece giriş yapmış Supabase kullanıcılarının (anonim dahil) bu fonksiyonu çağırmasına izin ver.
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"), {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization")
        }
      }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Auth hatası:", authError?.message);
      return new Response(JSON.stringify({
        error: "Geçersiz veya süresi dolmuş token"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // 4. İSTEK GÖVDESİNİ (BODY) ALMA VE DOĞRULAMA
    const body = await req.json();
    const validation = MapboxRequestSchema.safeParse(body);

    if (!validation.success) {
      // Eğer Zod şemasıyla eşleşmezse, 400 Bad Request hatası döndür
      return new Response(JSON.stringify({
        error: "Geçersiz istek verisi",
        details: validation.error.format()
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Doğrulanmış veriyi al
    const { api, profile, coordinates, params } = validation.data;

    // 5. GİZLİ API ANAHTARINI ALMA
    const MAPBOX_API_KEY = Deno.env.get("MAPBOX_API_KEY");
    if (!MAPBOX_API_KEY) {
      throw new Error("MAPBOX_API_KEY sunucuda ayarlanmamış!");
    }

    // 6. HARİCİ API'Yİ (MAPBOX) GÜVENLİ BİR ŞEKİLDE ÇAĞIRMA
    // İsteğe göre 'directions' veya 'matrix' endpoint'ini dinamik olarak seç
    const apiPath = api === "directions" ? "directions/v5/mapbox" : "directions-matrix/v1";
    const baseUrl = `https://api.mapbox.com/${apiPath}`;

    // URL'yi oluştur
    const mapboxUrl = new URL(`${baseUrl}/${profile}/${encodeURIComponent(coordinates)}`);
    // Gerekli 'access_token' parametresini ekle
    mapboxUrl.searchParams.set("access_token", MAPBOX_API_KEY);

    // İstemciden gelen diğer tüm ekstra parametreleri ekle
    // (örn. 'annotations', 'geometries', vb.)
    Object.entries(params).forEach(([key, value]) => {
      mapboxUrl.searchParams.set(key, value);
    });

    console.log(`Mapbox'a istek gönderiliyor: ${apiPath}/${profile}`);

    const mapboxResponse = await fetch(mapboxUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!mapboxResponse.ok) {
      const errorBody = await mapboxResponse.text();
      console.error("Mapbox API hatası:", errorBody);
      throw new Error(`Mapbox API hatası: ${mapboxResponse.statusText} | ${errorBody}`);
    }

    const data = await mapboxResponse.json();

    // 7. SONUCU MOBİL UYGULAMAYA DÖNDÜRME
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });

  } catch (error) {
    // 8. GENEL HATA YÖNETİMİ
    console.error("Beklenmedik hata:", error.message);
    return new Response(JSON.stringify({
      error: "Sunucu hatası",
      message: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});