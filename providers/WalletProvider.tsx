"use client";

import useDEXStore from '@/store/dex';
import useWalletStore from '@/store/wallet';
import React, { useEffect } from 'react'
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { qiteAddresses } from '@/constants/qite-dex-constants';

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const qiteContractAddress = Number(chainIdHex) in qiteAddresses ? qiteAddresses[Number(chainIdHex)].qiteSwap : undefined;

    const { setAccountData } = useWalletStore();
    const { setContractAddress } = useDEXStore();

    useEffect(() => {
        if (isWeb3Enabled && chainIdHex && account) {
            setAccountData(account, chainIdHex, isWeb3Enabled);
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        if (qiteContractAddress) {
            setContractAddress(qiteContractAddress);
        }
    }, [qiteContractAddress])

    return (
        <>
            {children}
        </>
    )
}

export default WalletProvider