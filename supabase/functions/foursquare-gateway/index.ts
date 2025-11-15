// Supabase/Deno kütüphanelerini içe aktar
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// CORS başlıklarını tanımla (Tarayıcıdan doğrudan çağrı yapılırsa gerekir)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Prodüksiyonda bunu kendi alan adınızla kısıtlayın
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1. GİRDİ DOĞRULAMA (VALIDATION) ŞEMASI (Zod ile)
// Mobil uygulamadan gelen isteğin gövdesinin (body) nasıl görünmesi gerektiğini tanımlar.
// Bu, hatalı veri gönderimini ve basit saldırıları engeller.
const FoursquareSearchSchema = z.object({
  query: z.string().min(1, { message: "Query boş olamaz" }),
  ll: z.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, {
    message: "Geçersiz 'enlem,boylam' formatı"
  }),
  // 'radius', 'categories' gibi diğer Foursquare parametrelerini buraya ekleyebilirsiniz
  radius: z.number().optional().default(5000), 
});

console.log("foursquare-gateway fonksiyonu başlatıldı.");

serve(async (req: Request) => {
  // 2. CORS PREFLIGHT İSTEĞİNİ YÖNETME
  // Tarayıcılar, asıl POST/GET isteğinden önce bir OPTIONS isteği gönderir.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 3. KİMLİK DOĞRULAMA (AUTHENTICATION)
    // Sadece giriş yapmış Supabase kullanıcılarının bu fonksiyonu çağırmasına izin ver.
    
    // a. Supabase istemcisini oluştur
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // b. Kullanıcının JWT'sini (Auth Token) doğrula
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError ||!user) {
      console.error("Auth hatası:", authError?.message);
      return new Response(JSON.stringify({ error: "Geçersiz veya süresi dolmuş token" }), {
        status: 401,
        headers: {...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth başarılıysa, konsola hangi kullanıcının istek yaptığını yazdırabiliriz
    console.log(`İstek yapan kullanıcı: ${user.email}`);

    // 4. İSTEK GÖVDESİNİ (BODY) ALMA VE DOĞRULAMA
    const body = await req.json();
    const validation = FoursquareSearchSchema.safeParse(body);

    if (!validation.success) {
      // Eğer Zod şemasıyla eşleşmezse, 400 Bad Request hatası döndür
      return new Response(JSON.stringify({ error: "Geçersiz istek verisi", details: validation.error.format() }), {
        status: 400,
        headers: {...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Doğrulanmış veriyi al
    const { query, ll, radius } = validation.data;

    // 5. GİZLİ API ANAHTARINI ALMA
    const FOURSQUARE_API_KEY = Deno.env.get("FOURSQUARE_API_KEY");
    if (!FOURSQUARE_API_KEY) {
      throw new Error("FOURSQUARE_API_KEY sunucuda ayarlanmamış!");
    }

    // 6. HARİCİ API'Yİ (FOURSQUARE) GÜVENLİ BİR ŞEKİLDE ÇAĞIRMA
    console.log(`Foursquare'e istek gönderiliyor: query=${query}, ll=${ll}`);
    
    const fsqUrl = new URL("https://api.foursquare.com/v3/places/search");
    fsqUrl.searchParams.set("query", query);
    fsqUrl.searchParams.set("ll", ll);
    fsqUrl.searchParams.set("radius", radius.toString());
    // Diğer parametreleri (categories, fields, vb.) buradan ekleyin

    const fsqResponse = await fetch(fsqUrl.toString(), {
      method: "GET",
      headers: {
        "Authorization": FOURSQUARE_API_KEY,
        "Accept": "application/json",
      },
    });

    if (!fsqResponse.ok) {
      throw new Error(`Foursquare API hatası: ${fsqResponse.statusText}`);
    }

    const data = await fsqResponse.json();

    // 7. SONUCU MOBİL UYGULAMAYA DÖNDÜRME
    return new Response(JSON.stringify(data.results), {
      headers: {...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // 8. GENEL HATA YÖNETİMİ
    console.error("Beklenmedik hata:", error.message);
    return new Response(JSON.stringify({ error: "Sunucu hatası", message: error.message }), {
      headers: {...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});