import React from 'react'
import { Alert, AlertIcon, Center } from '@chakra-ui/react'

const NotConnected = () => {
  return (
    <Alert status='warning'>
       <AlertIcon />
            Please connect your Wallet.
    </Alert>
  )
}

export default NotConnected