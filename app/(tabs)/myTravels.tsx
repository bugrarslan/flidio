import { View, Text, Button } from 'react-native'
import React from 'react'
import { fetchFoursquareCafesNearby, fetchFoursquarePlaces, fetchMapboxDirections, fetchMapboxMatrix, testFoursquareGateway } from '@/services/supabase/edge-functions/test';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyTravels = () => {
  const handleFetchFoursquarePlaces = async () => {
      await fetchFoursquarePlaces();
  };

  const handleFetchFoursquareCafesNearby = async () => {
     await fetchFoursquareCafesNearby();
  };

  const handleTestFoursquareGateway = async () => {
      await testFoursquareGateway();
  };

  const handleFetchMapboxMatrix = async () => {
     await fetchMapboxMatrix();
  };
  
    const handleFetchMapboxDirections = async () => {
      await fetchMapboxDirections();
  };
  return (
    <SafeAreaView>
      <Button title="Foursquare Places" onPress={handleFetchFoursquarePlaces} />
      <Button title="Foursquare Cafes Nearby" onPress={handleFetchFoursquareCafesNearby} />
      <Button title="Test Foursquare Gateway" onPress={()=>handleTestFoursquareGateway()} />
      <Button title="Mapbox Matrix" onPress={handleFetchMapboxMatrix} />
      <Button title="Mapbox Directions" onPress={handleFetchMapboxDirections} />
    </SafeAreaView>
  )
}

export default MyTravels