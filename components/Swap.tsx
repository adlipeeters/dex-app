import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { ConnectButton } from 'web3uikit';
import { toast } from "sonner"

import { Button } from './ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from './ui/input';
import { truncate } from '@/utils';
import { ArrowUpDown } from 'lucide-react';
import { Balance } from '@/types';
import useWalletStore from '@/store/wallet';
import useDEXStore from '@/store/dex';
import { useDEXHook } from '@/hooks/useDEXHook';

const Swap = () => {
    // State variables
    const [pools, setPools] = useState<string[]>([]);
    const [selectedPool, setSelectedPool] = useState<string>("");
    const [token1Address, setToken1Address] = useState<string>("");
    const [token2Address, setToken2Address] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [expectedAmountOut, setExpectedAmountOut] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
    const [balance, setBalance] = useState<Balance>({
        token1: 0,
        token2: 0,
        poolToken1: 0,
        poolToken2: 0,
    });

    // Moralis hooks
    const { isWeb3Enabled, account } = useWalletStore();
    const { contractAddress: qiteContractAddress } = useDEXStore();

    const {
        getPairs,
        getToken1,
        getToken2,
        getAllowance,
        approve,
        getBalanceOf,
        getExpectedAmountOut,
        swapTokens
    } = useDEXHook();

    // Check if the owner has approved the spender to spend the amount of tokens
    const checkAllowance = async (tokenAddress: string, owner: string, spender: string, amount: ethers.BigNumberish) => {
        try {
            const allowance = await getAllowance({
                params: {
                    contractAddress: tokenAddress,
                    params: {
                        owner: owner,
                        spender: spender,
                    }
                }
            }) as ethers.BigNumber;

            // Use BigNumber comparison method
            return allowance.gte(amount);  // gte stands for 'greater than or equal to'
        } catch (error) {
            toast.error("Error when checking allowance");
            return false;
        }
    }

    const requestApprovals = async (
        isToken1Approved: boolean,
        token1Address: string,
        spender: string,
        amountToken1: ethers.BigNumberish,
    ) => {
        try {
            if (!isToken1Approved) {
                await approve({
                    params: {
                        contractAddress: token1Address,
                        params: {
                            spender: spender,
                            value: amountToken1
                            // value: ethers.utils.parseEther(String(amountToken1))
                        }
                    }
                });
            }
            await triggerSwap();
        } catch (error) {
            toast.error("Error when requesting approvals");
        }
    }

    const handleExpectedAmount = async () => {
        if (amount <= 0) {
            setExpectedAmountOut(ethers.BigNumber.from(0));
            return;
        }
        try {
            const expectedAmountOut = await getExpectedAmountOut({
                params: {
                    contractAddress: selectedPool,
                    params: { amountIn: ethers.utils.parseEther(String(amount)), fromToken: token1Address, }
                }
            }) as ethers.BigNumber;
            setExpectedAmountOut(expectedAmountOut);
        } catch (error) {
            console.log("Error when getting expected amount out: ", error);
        }
    }

    const handleSwitchTokens = () => {
        const temp = token1Address;
        setToken1Address(token2Address);
        setToken2Address(temp);
        handleExpectedAmount();
    }

    const handleSwap = async () => {
        try {
            const isToken1Approved = await checkAllowance(token1Address, account as string, selectedPool, ethers.utils.parseEther(String(amount)));
            if (!isToken1Approved) {
                await requestApprovals(isToken1Approved, token1Address, selectedPool, ethers.utils.parseEther(String(amount)));
            } else {
                await triggerSwap();
            }
        } catch (error) {

        }
    }

    const triggerSwap = async () => {
        const amountIn = ethers.utils.parseEther(String(amount));
        const amountOut = expectedAmountOut;
        console.log("Amount in: ", amountIn);
        console.log("Amount out: ", amountOut);
        try {
            await swapTokens({
                params: {
                    contractAddress: selectedPool,
                    params: {
                        fromToken: token1Address,
                        toToken: token2Address,
                        amountIn: amountIn,
                        // amountOut: amountOut,
                    }
                },
                onSuccess: (tx) => {
                    toast.success("Swap successful");
                },
                onError: (error) => {
                    console.log("Error when swapping: ", error);
                    toast.error("Error when swapping");
                }
            });
        } catch (error) {
            toast.error("Error when swapping");
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            const fetchPairs = async () => {
                try {
                    const pairs = await getPairs() as string[];
                    if (pairs) {
                        setPools(pairs);
                    }
                } catch (error) {
                    console.log("Error when fetching pairs: ", error);
                }
            }
            fetchPairs();

        }
    }, [isWeb3Enabled])

    useEffect(() => {
        if (selectedPool) {
            const fetchTokens = async () => {
                const token1Address = await getToken1({ params: { contractAddress: selectedPool } }) as string;
                const token2Address = await getToken2({ params: { contractAddress: selectedPool } }) as string;
                setToken1Address(token1Address);
                setToken2Address(token2Address);
            }
            fetchTokens();
        }
    }, [selectedPool])

    useEffect(() => {
        handleExpectedAmount();
    }, [amount]);

    useEffect(() => {
        if (token1Address) {
            const fetchBalance = async () => {
                const balanceOfToken1 = await getBalanceOf({ params: { contractAddress: token1Address, params: { account: account } }, }) as ethers.BigNumber;
                const balanceOfToken2 = await getBalanceOf({ params: { contractAddress: token2Address, params: { account: account } } }) as ethers.BigNumber;
                const balanceOfPoolToken1 = await getBalanceOf({ params: { contractAddress: token1Address, params: { account: selectedPool } } }) as ethers.BigNumber;
                const balanceOfPoolToken2 = await getBalanceOf({ params: { contractAddress: token2Address, params: { account: selectedPool } } }) as ethers.BigNumber;
                setBalance({
                    token1: Number(ethers.utils.formatEther(balanceOfToken1)),
                    token2: Number(ethers.utils.formatEther(balanceOfToken2)),
                    poolToken1: Number(ethers.utils.formatEther(balanceOfPoolToken1)),
                    poolToken2: Number(ethers.utils.formatEther(balanceOfPoolToken2)),
                });
            }
            fetchBalance();
        }
    }, [token1Address && token1Address && selectedPool]);

    return (
        <div className='mt-8 p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto text-black'>
            <h2 className='text-2xl font-bold text-center'>Swap</h2>
            {
                isWeb3Enabled && qiteContractAddress !== "" ? (
                    <>
                        <div className='flex flex-col gap-4 mt-2'>
                            <p>Welcome, <span className='font-bold'>{account ? truncate({ text: account, startChars: 4, endChars: 4, maxLength: 11 }) : ""}</span></p>
                            <div>
                                <label htmlFor="pools" className='text-sm font-bold'>Select Pool</label>
                                <Select
                                    value={selectedPool}
                                    onValueChange={setSelectedPool}
                                >
                                    <SelectTrigger className="">
                                        <SelectValue aria-label={selectedPool} placeholder="Select pool" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            pools.map((pool, index) => (
                                                <SelectItem key={index} value={pool}>{pool}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>

                            </div>
                            {token1Address && token2Address ? (
                                <>
                                    <div>
                                        <label htmlFor="token1Address" className='text-sm font-bold'>Token From Address</label>
                                        <Input
                                            id='token1Address'
                                            name='token1Address'
                                            value={token1Address}
                                            readOnly
                                        />
                                    </div>
                                    <div className='flex justify-center'>
                                        <Button size="icon" type="button" onClick={handleSwitchTokens}>
                                            <ArrowUpDown />
                                        </Button>
                                    </div>
                                    <div>
                                        <label htmlFor="token2Address" className='text-sm font-bold'>Token To Address</label>
                                        <Input
                                            id='token2Address'
                                            name='token2Address'
                                            value={token2Address}
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="amount" className='text-sm font-bold'>Amount</label>
                                        <Input
                                            type='number'
                                            id='amount'
                                            name='amount'
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="expectedAmountOut" className='text-sm font-bold'>Expected Amount</label>
                                        <Input
                                            id='expectedAmountOut'
                                            name='expectedAmountOut'
                                            value={ethers.utils.formatEther(expectedAmountOut)}
                                            readOnly
                                        />
                                    </div>
                                    <div className='flex justify-center'>
                                        <Button className='w-full' onClick={handleSwap}>Swap</Button>
                                    </div>
                                    <div className="text-xs flex justify-between">
                                        <div className='flex flex-col justify-start'>
                                            <p className='font-bold mt-2'>Your Token 1 Balance: <span className='text-gray-500'>{balance.token1}</span></p>
                                            <p className='font-bold mt-2'>Your Token 2 Balance: <span className='text-gray-500'>{balance.token2}</span></p>
                                        </div>
                                        <div className='flex flex-col justify-start'>
                                            <p className='font-bold mt-2'>Liquidity Pool Token 1 Balance: <span className='text-gray-500'>{balance.poolToken1}</span></p>
                                            <p className='font-bold mt-2'>Liquidity Pool Token 2 Balance: <span className='text-gray-500'>{balance.poolToken2}</span></p>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                        <div className='flex justify-start'>
                            <p className='font-bold mt-2'></p>
                        </div>
                    </>
                ) : <div className='mt-2 flex justify-center'>
                    <ConnectButton />
                </div>
            }
        </div >
    )
}

export default Swap