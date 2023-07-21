"use client"
import NotConnected from '../components/NotConnected/NotConnected'
import { Center } from '@chakra-ui/react'
import { SimpleGrid, Box, Input, Select, FormLabel, FormControl,
         Button,Card,CardBody,Text,Flex, Heading } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { hardhat } from 'wagmi/chains';
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { readContract,prepareWriteContract, writeContract } from '@wagmi/core'
import Contract from '../../public/Blopol.json'
import { ethers, BigNumber } from 'ethers'

const createad = () => {

    const { isConnected, address : addressAccount } = useAccount()
    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

    // Create client for Viem
    const client = createPublicClient({
        chain: hardhat,
        transport: http(),
    })
    const toast = useToast()
    const [titleAds, settitleAds] = useState("")
    const [geolocAds, setgeolocAds] = useState("")
    const [idcatAds, setidcatAds] = useState("")
    const [maticPriceFeed,setmaticPriceFeed] = useState('')
    const [am,setam] = useState(0)
    
    // Check Oracle to give SoftCap minimum Price
    const giveSoftCap = async() => {
        if ( titleAds!= '' && idcatAds != '' && geolocAds !=''){
            
            try {
                const data = await readContract({
                    address: contractAddress,
                    abi: Contract.abi,
                    functionName: "displayAmountForDepositAd",
                });
                console.log(data);
                console.log('SoftCap: ' + ethers.utils.formatEther(data))
                toast({
                    title: 'Prix mise à jour',
                    description: `Oracle Chainlink`,
                    status: 'success',
                    duration: 3000,
                    position: 'top',
                    isClosable: true,
                })
                setam(data)
                setmaticPriceFeed(ethers.utils.formatEther(data))
            }
            catch(err) {
                console.log(err);
                toast({
                    title: 'Error!',
                    description: 'Un erreur est survenue',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
            }
            
        } else {
            toast({
                title: 'Champs Obligatoire',
                description: "Vous devez remplir tous les champs de l'annonce",
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    // Add Ads
    const addNewAds = async() => {
        let timestamp = Math.floor(Date.now() / 1000);
        const ads = { idAds: 0,
            ownerAds: addressAccount,
            depositAds: timestamp,
            titleAds: titleAds,
            idcatAds: idcatAds,
            geolocAds: geolocAds
        }
        let mv = ethers.utils.parseEther(maticPriceFeed)
        const rwd = { idAds: 0,amountReward: mv }

        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "paymentAds",
                args: [ads,rwd],
                value: mv
            });
            await writeContract(request)
            
            toast({
                title: 'Annonce déposée sur BLOPOL',
                description: `Votre annonce à bien été déposée sur la plateforme BLOPOL`,
                status: 'success',
                duration: 3000,
                position: 'top',
                isClosable: true,
            })
        }  catch(err) {
            console.log(err)
                toast({
                    title: 'Error!',
                    description: 'Error system, contact Administrator',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
        }
        
    }

    useEffect(() => {
       
    }, [])

    return (
    <>
        <Center>
         <h1>Création de votre annonce</h1>
        </Center>
        {isConnected ? (
        <SimpleGrid columns={2} spacing={30}>
                <Box  w='100%'>
                    <FormLabel>COMPLETER LES CHAMPS CI-DESSOUS</FormLabel>
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
                                <Button onClick={() => giveSoftCap()} colorScheme="blue">
                                    CALCUL DU MONTANT DE L'ANNONCE
                                </Button>
                            </Box>
                    </Box>
                    <Box  w='100%'><h2>INFORMATION SUR L'ANNONCE</h2>
                    <Card>
                        <CardBody>
                          <Text>
                                <h2>Montant minimum pour déposer une Annonce</h2>
                                <p>Blopol vous propose de fixer le montant de la récompense qui sera donner
                                    à la personne vous ayant aider à retourver votre objet volé ou perdu.
                                </p>
                                <p>Un montant minimum est cepandant requis pour déposer l'annonce.</p>
                                <p>Votre récompense sera bloquée en staking, vous pourrez récupérer l'intégralité
                                    de la récompense si vous n'avez pas pu retrouver votre objet.
                                </p>
                          </Text>
                          <Text>

                            <Input placeholder="Calcul du montant minimal de l'annonce" value={maticPriceFeed} 
                                   onChange={(e) => setmaticPriceFeed(e.target.value)}/>
                            <Box m={[2, 3]}>

                            {maticPriceFeed > 0  ? (
                                <Button onClick={() => addNewAds()} colorScheme="orange">
                                    REGLER MON ANNONCE
                                </Button>
                            ) : (
                                <Button disabled>REGLER MON ANNONCE</Button>
                            )}
                               
                            </Box>
                          </Text>
                        </CardBody>
                      </Card>
                </Box>
        </SimpleGrid>
        ) : (
            <NotConnected />
        )}
        </>
    )
}
export default createad