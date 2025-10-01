import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TravelDetails = () => {
  const {id} = useLocalSearchParams<{id: string}>();
  return (
    <SafeAreaView>
      <Text>TravelDetails for {id}</Text>
    </SafeAreaView>
  )
}

export default TravelDetails