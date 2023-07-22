"use client"
import { v4 as uuidv4 } from 'uuid';
import NotConnected from '../components/NotConnected/NotConnected'
import { SimpleGrid, Box,isOpen,onClose,PopoverTrigger,PopoverContent,PopoverHeader, Badge, FormLabel, 
         Popover,MdCheckCircle,Divider,Center,PopoverArrow,PopoverCloseButton,PopoverBody,PopoverFooter,ButtonGroup,
         Button,Card,CardBody,Text,Flex, List, ListItem, ListIcon } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { hardhat } from 'wagmi/chains';
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { readContract,prepareWriteContract, writeContract } from '@wagmi/core'
import Contract from '../../public/Blopol.json'
import { ethers, BigNumber } from 'ethers'
 
const MesAnnonces = () => {
    const { isConnected, address : addressAccount } = useAccount()
    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

    // Create client for Viem
    const client = createPublicClient({
        chain: hardhat,
        transport: http(),
    })
    const toast = useToast()
    const [CreateAdsRegisteredLogs, setCreateAdsRegisteredLogs] = useState([])
    const [detailAnnonce, setDetailAnnonce] = useState([])
    const [dateDepot,setdateDepot] = useState("")
    const [stakedamount, setstakedamount] = useState(0)
    const [timestampAd,settimestampAd] = useState(null)
    const [witdrawPossible,setwithdrawPossible] = useState(0)
    const [balanceBlopol,setbalanceBlopol] = useState(0)
    const [comment,setcomment] = useState([])
    const [reward,setreward] = useState(0)

    // Fonction de formatage de la date
    function timestampToDate(timestamp){
        const date = new Date(timestamp * 1000);
        const day = date.getDate();
        const month = date.toLocaleString('fr-FR', { month: 'long' });
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = "0" + date.getMinutes();
        const seconds = "0" + date.getSeconds();
        return `${day} ${month} ${year} à ${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
    }

    // Récupération des logs pour charger les Annonces
    const getEvents = async() => {
        // get all the deposit events 
        const CreateAdsRegisteredLogs = await client.getLogs({
            event: parseAbiItem('event CreateAds(address indexed ownerAds, uint idAds, uint depositAds, string titleAds, string geolocAds)'),
            fromBlock: 0n,
            toBlock: 'latest' // Pas besoin valeur par défaut
        })
        setCreateAdsRegisteredLogs(CreateAdsRegisteredLogs.map(
            log => ({address: log.args.ownerAds,idAds: log.args.idAds,depositAds: log.args.depositAds,titleAds: log.args.titleAds,geolocAds: log.args.geolocAds})
        ))
    }
    
    const DeleteMyAds = async(idAds) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "cancelMyAds",
                account: addressAccount,
                args: [Number(idAds)],
            });
            await writeContract(request)
            ShowAds(Number(idAds))

            toast({
                title: 'Annonce supprimée',
                description: `Votre annonce à bien été supprimée, vos fonds bloqués ont été remboursés`,
                status: 'success',
                duration: 3000,
                position: 'top',
                isClosable: true,
            })
        }  catch(err) {
                toast({
                    title: 'Error!',
                    description: 'Error system, Delete Ads problem',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
        }
    }

    // Show ads details
    const ShowAds = async(idAds) => {
        // Details de l'annonce
        try {
            const data = await readContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getAdsById",
                args: [Number(idAds)]
            });
            const formattedDate = timestampToDate(Number(data[2]))
            setdateDepot(formattedDate)
            settimestampAd(Number(data[2]))
            setDetailAnnonce(data)
            console.log(Number(idAds))
        }
        catch(err) {
            toast({
                title: 'Error!',
                description: 'Problème pour afficher les détails',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
        // Montant de récompense staké
        try {
            const data2 = await readContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getBalanceStakingTokenByAds",
                account: addressAccount,
                args: [Number(idAds)]
            });
            setstakedamount(ethers.utils.formatEther(data2))
        }
        catch(err) {
            toast({
                title: 'Error',
                description: 'Probleme pour afficher la balance',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
        // Possibilité de retrait si conditions true (Jour / SoftCap / Deja retiré)
        try {
            const data3 = await readContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "CanWithdrawNow",
                account: addressAccount,
                args: [Number(idAds)]
            });
            setwithdrawPossible(ethers.utils.formatEther(data3))
        }
        catch(err) {
            toast({
                title: 'Error',
                description: 'Problème sur la possibilité de retrait',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
        // Show earned TokenBlopol
        try {
            const data4 = await readContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getBalanceRewardBlopolByAds",
                account: addressAccount,
                args: [Number(idAds)]
            });
            setbalanceBlopol(ethers.utils.formatEther(data4))
        }
        catch(err) {

            toast({
                title: 'Error',
                description: 'Problème sur la possibilité de retrait',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }

        GetCommentByAd(Number(idAds))
    }

    // Ask for rewards Blopol
    const AskForRewards = async(idAds) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getReward",
                account: addressAccount,
                args: [Number(idAds)],
            });
            await writeContract(request)
            ShowAds(Number(idAds))

            toast({
                title: 'VOTRE RECOMPENSE',
                description: `Vos Tokens BLOPOL de récompense vous ont été envoyés`,
                status: 'success',
                duration: 3000,
                position: 'top',
                isClosable: true,
            })
        }  catch(err) {
          
                toast({
                    title: 'Error!',
                    description: 'Error system, Reward Blopol Panic',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
        }
    }

    // Withdraw unstake
    const Unstake = async(idAds) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "withdraw",
                account: addressAccount,
                args: [Number(idAds)],
            });
            await writeContract(request)
            ShowAds(Number(idAds))

            toast({
                title: 'Remboursement',
                description: `Votre compte vient d'être crédité de voter montant à débloquer`,
                status: 'success',
                duration: 3000,
                position: 'top',
                isClosable: true,
            })
        }  catch(err) {
           
                toast({
                    title: 'Error!',
                    description: 'Error system, Withdraw function panic',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
        }
    }

    // Get Comment by Ads
    const GetCommentByAd = async(idAds) => {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getCommentbyAd",
                args: [Number(idAds)]
            });
       
            setcomment(data)
        }
        catch(err) {
            toast({
                title: 'Error!',
                description: 'Problème pour afficher les détails',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }  
        // Montant de la récompense
        try {
            const data2 = await readContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getRewardForAd",
                args: [Number(idAds)]
            });
            setreward(ethers.utils.formatEther(data2))
        }
        catch(err) {
            toast({
                title: 'Error!',
                description: 'Problème pour afficher le montant des rewards',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }        
    }   

    const SendRewardsToHelpers = async(idAds,index) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "giveRewardComment",
                account: addressAccount,
                args: [Number(idAds),Number(index)],
            });
            await writeContract(request)
            ShowAds(Number(idAds))

            toast({
                title: 'Récompense envoyée',
                description: `La récompense à bien été envoyée avec succés`,
                status: 'success',
                duration: 3000,
                position: 'top',
                isClosable: true,
            })
        }  catch(err) {
           
                toast({
                    title: 'Erreur',
                    description: 'Reward already send',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
        }
    }

    useEffect(() => {
        const LoadDataInPage = async() => {
            await getEvents()
        }
        LoadDataInPage()
    }, [])
  return (
    <Flex width="80%" direction={["column", "column", "row", "row"]} alignItems={["center", "center", "flex-start", "flex-start"]} flexWrap="wrap">

    {isConnected ? (
        <SimpleGrid columns={3} spacing={30}>

            <Box  w='100%'>
           
                <Card>
                    <CardBody>
                        <Center><FormLabel>VOS ANNONCES</FormLabel></Center>
                        <Divider m={5}orientation='horizontal' />
                        <List spacing={3}>
                            {CreateAdsRegisteredLogs.length > 0 ? CreateAdsRegisteredLogs.map((event) => {
                                    if(event.address === addressAccount)
                                      return <ListItem><ListIcon as={MdCheckCircle} key={uuidv4()} color='green.500' />
                                                {event.titleAds} <a cursor="help" onClick={() => ShowAds(Number(event.idAds))}><Badge variant='subtle' colorScheme='green'>
                                                    voir</Badge></a>
                                            </ListItem>
                                  }) : (
                                        <ListItem>Aucune annonce déposée pour le moment</ListItem>  
                                  )}
                        </List>
                    </CardBody>
                </Card>
            </Box>

            <Box w='100%'>
               
                <Card>
                    <CardBody>
                    {detailAnnonce.length > 0 ? (
                        <>
                        <FormLabel>

                            <Center><Badge colorScheme='purple'>Staked {stakedamount} MATIC</Badge></Center>
                            <Divider m={3}orientation='horizontal' />
                            <Center><Badge colorScheme='yellow'>{balanceBlopol} BLOPOL</Badge></Center>
                            {balanceBlopol > 0 ? (<Center><Text><Button onClick={() => AskForRewards(Number(detailAnnonce[0]))} 
                                    colorScheme='yellow' size='xs'>Réclamer</Button></Text>
                            </Center>
                            ):(
                                <Center><Text>...</Text></Center>)}
                            
                        </FormLabel>
                        <Divider m={5}orientation='horizontal' />

                            {timestampAd != 0 ? (
                                <>
                                <Text>
                                <Popover returnFocusOnClose={false} isOpen={isOpen}  onClose={onClose} placement='right' closeOnBlur={false}>
                                    <PopoverTrigger>
                                        <Button size="xs" colorScheme='pink'>SUPPRIMER</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                    <PopoverHeader fontWeight='semibold'>Confirmation suppression annonce</PopoverHeader>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody>
                                        Cette action est irreversible, etês vous sur de vouloir supprimer votre annonce de la plateforme ?
                                    </PopoverBody>
                                    <PopoverFooter display='flex' justifyContent='flex-end'>
                                        <ButtonGroup size='sm'>
                                        <Button colorScheme='red' variant='outline' size='xs'
                                                onClick={() => DeleteMyAds(Number(detailAnnonce[0]))}>DELETE</Button>
                                        </ButtonGroup>
                                    </PopoverFooter>
                                    </PopoverContent>
                                </Popover>
                                </Text>
                                <Text as='b'>Postée le {dateDepot}</Text>
                                <Text>{detailAnnonce[3]}</Text>
                                <Text>Géolocalisation : {detailAnnonce[5]}</Text></>
                            ):(
                            <>
                            <Text>Annonce supprimée de la plateforme Blopol</Text></>
                            )}         

                            <Divider m={4}orientation='horizontal' />
                            {witdrawPossible != 0 ? (
                                <><Center><Text><Badge colorScheme='green'>{Number(witdrawPossible)} MATIC</Badge></Text></Center><Center><Text>
                                    <Button colorScheme='green' variant='outline' size='xs'
                                                onClick={() => Unstake(Number(detailAnnonce[0]))}>Retirer</Button></Text></Center></>
                            ):(
                                <Center><Button disabled colorScheme='red' variant='outline' size='sm'>Unstaking non possible</Button></Center>
                            )}


                        </>
                          
                    ) 
                        
                    : (
                        <Text>Selectionner au moins une annonce</Text>
                    )}

                    </CardBody>
                </Card>
            </Box>
            
            <Box  w='100%'>
                <Card>
                    <CardBody>
                        <Center><FormLabel>COMMENTAIRES</FormLabel></Center>
                      
                        <Center><Badge colorScheme='purple'>Reward {reward} MATIC</Badge></Center>
                        <Divider m={5}orientation='horizontal' />
                        {comment.length > 0 ? comment.map((event, index) => {
                                let datec = timestampToDate(Number(event.commentDate))
                                return <><Text><Badge colorScheme='purple'>{event.helpers}</Badge></Text>
                                         <Text fontSize='sm'>Posté le {datec}</Text>
                                         <Text fontSize='sm'>{event.information}</Text>
                                         {event.flag ? (
                                            <Center><Badge colorScheme='orange'>Payé</Badge></Center>
                                            ):(
                                            <Center><Button onClick={() => SendRewardsToHelpers(Number(detailAnnonce[0]),index)} colorScheme='purple' size='xs'>Récompenser</Button></Center>
                                         )}
                                         
                                         <Divider m={2}orientation='horizontal' />
                                        </>
                            }) : (
                                <Text>Aucun commentaire pour le moment...</Text> 
                            )}
                    </CardBody>
                </Card>
            </Box>

        </SimpleGrid>
        ) : (
            <NotConnected />
        )}
    
    </Flex>
  )
}

export default MesAnnonces