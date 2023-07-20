"use client"
import { Container } from '@chakra-ui/react'
import { SimpleGrid, Box, Input, Select, FormLabel, FormControl,Button,Card,CardBody,Text } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { hardhat } from 'viem/chains'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { readContract,prepareWriteContract, writeContract } from '@wagmi/core'
import Contract from '../../public/Blopol.json'


const createad = () => {

    const { isConnected, address : addressAccount } = useAccount()
    //const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    
    // Create client for Viem
    const client = createPublicClient({
        chain: hardhat,
        transport: http(),
    })
    const toast = useToast()
    const [titleAds, settitleAds] = useState("")
    const [geolocAds, setgeolocAds] = useState("")
    const [idcatAds, setidcatAds] = useState("")



  return (
    <div>
        <h1>Création de votre annonce</h1>
        <SimpleGrid columns={2} spacing={30}>
                <Box  w='100%'>
                    <FormLabel>Merci de renseigner les champs ci-dessous</FormLabel>
                        <FormControl>
                            <Box m={[2, 3]}>
                                <Input placeholder="Titre de votre annonce" value={titleAds} 
                                    onChange={(e) => settitleAds(e.target.value)}
                                />
                            </Box>
                            <Box m={[2, 3]}>
                                <Select placeholder='Choisissez une catégorie'  value={idcatAds} onChange={(e) => setidcatAds(e.target.value)}>    
                                    <option value='0'>MONTRES</option>
                                    <option value='1'>TELEPHONES</option>
                                </Select>
                            </Box>
                            <Box m={[2, 3]}>
                                <Input placeholder="Géolocalisation" value={geolocAds} 
                                    onChange={(e) => setgeolocAds(e.target.value)}
                                />
                            </Box>
                        </FormControl>
                            <Box m={[2, 3]}>
                                <Button onClick={() => addNewProposal()} colorScheme="blue">
                                    Enregistrer
                                </Button>
                            </Box>
                    </Box>
                    <Box  w='100%'><h2>INFORMATION SUR L'ANNONCE</h2>
                    <Card>
                        <CardBody>
                          <Text>
                                Montant minimum pour déposer une Annonce
                          </Text>

                        </CardBody>
                      </Card>
                </Box>
        </SimpleGrid>
    </div>
  )
}

export default createad