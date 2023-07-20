"use client"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Flex, Text } from "@chakra-ui/react";
import { Link } from '@chakra-ui/react';
import { HStack, Center } from '@chakra-ui/react';

const Header = () => {
    return (
        <Flex p="2rem" justifyContent="space-between" alignItems="Center">
            <Text fontSize={24} fontWeight={"bold"}>
                B
            </Text>
            <Center mt='1rem'>
                <HStack spacing='24px'>
                    <Link href="/CreateAd">Créer une annonce</Link>
                    <Link>Mes annonces</Link>
                    <Link>Mes commentaires</Link>
                    <Link>Rewards</Link>
                </HStack>
            </Center>
           
            <ConnectButton  label="Se connecter" showBalance={true} />
        </Flex>
    )
}
export default Header