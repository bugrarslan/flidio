import { Image } from 'expo-image'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  return (
    <SafeAreaView className='items-center justify-center flex-1 bg-white'>
      <Image source={require('@/assets/images/icon.png')} className='w-32 h-32' />
    </SafeAreaView>
  )
}

export default index