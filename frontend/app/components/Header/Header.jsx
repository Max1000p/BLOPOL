"use client"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Flex, Text } from "@chakra-ui/react";
import { Link } from '@chakra-ui/react';
import { HStack, Center } from '@chakra-ui/react';
import Head from 'next/head'

const Header = () => {
    return (
        <>
        <Head>
            <title>BLOPOL</title>
            <meta name="description" content="Blopol - Plateforme décentralisée pour la déclaration d'objets perdus ou volés" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Flex p="2rem" justifyContent="space-between" alignItems="Center">
            <Text fontSize={24} fontWeight={"bold"}>
                <a href="/">B</a>
            </Text>
            <Center mt='1rem'>
                <HStack spacing='24px'>
                    <Link href="/CreateAd">Créer une annonce</Link>
                    <Link href="/MesAnnonces">Mes annonces</Link>
                    <Link>Mes commentaires</Link>
                    <Link>Rewards</Link>
                </HStack>
            </Center>
           
            <ConnectButton  label="Se connecter" showBalance={false} />
        </Flex>
        </>
    )
}
export default Header