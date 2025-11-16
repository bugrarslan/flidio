import { supabase } from "@/lib/supabase";

export const fetchFoursquarePlaces = async () => {
  const { data, error } = await supabase.functions.invoke(
    "foursquare-gateway",
    {
      body: {
        query: "kahve",
        ll: "41.0082,28.9784",
      },
    }
  );

  if (error) {
    console.error("Fonksiyon hatası:", error.message);
    // Kullanıcıya hata göster
  } else {
    // 'data' artık Foursquare'den gelen 'results' dizisidir.
    console.log("Mekanlar:", data);
  }
};

export const fetchMapboxDirections = async () => {
  // Örnek: İstanbul'da iki nokta arası sürüş rotası
  // Format: 'boylam1,enlem1;boylam2,enlem2'
  const startCoords = "28.9784,41.0082"; // Ayasofya civarı
  const endCoords = "29.0546,41.0744";   // Maslak civarı

  const { data, error } = await supabase.functions.invoke(
    "mapbox-gateway",
    {
      body: {
        api: "directions",       // Zod şemasındaki 'api'
        profile: "driving",      // 'driving', 'walking' veya 'cycling'
        coordinates: `${startCoords};${endCoords}`,
        params: {
          geometries: "geojson", // Haritada çizmek için gerekli format
          steps: "true",         // Adım adım yol tarifi
          overview: "full"
        },
      },
    }
  );

  if (error) {
    console.error("Fonksiyon hatası:", error.message);
    // Kullanıcıya hata göster
  } else {
    // 'data' artık Mapbox Directions yanıtıdır (routes, waypoints vb.)
    console.log("Rota Verisi:", data);
    // Örneğin rotayı çizmek için: data.routes[0].geometry
  }
};
