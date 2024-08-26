import React, { useEffect, useState } from 'react'
import { truncate } from '../utils';
import CreateModal from './CreateModal';
import { Token } from '@/types';
import { toast } from "sonner"
import { ConnectButton } from 'web3uikit';
import { Button } from './ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from './ui/input';
import { ethers } from 'ethers'
import useDEXStore from '@/store/dex';
import useWalletStore from '@/store/wallet';
import { useDEXHook } from '@/hooks/useDEXHook';

const LiquidityPools = () => {
    // State variables
    const [open, setOpen] = useState<boolean>(false);
    const [pools, setPools] = useState<string[]>([]);
    const [selectedPool, setSelectedPool] = useState<string>("");
    const [liquidityAmount, setLiquidityAmount] = useState<number>(0);
    const [liquidityAmountToken1, setLiquidityAmountToken1] = useState<number>(0);
    const [liquidityAmountToken2, setLiquidityAmountToken2] = useState<number>(0);
    const [liquidityToRemove, setLiquidityToRemove] = useState<number>(0);

    // Moralis hooks
    const { isWeb3Enabled, account } = useWalletStore();
    const { contractAddress: qiteContractAddress } = useDEXStore();

    const {
        createLiquidityPool,
        getPairs,
        addLiquidity,
        removeLiquidity,
        getLiquidityToken,
        getToken1,
        getToken2,
        getAllowance,
        approve,
        getBalanceOf,
    } = useDEXHook();

    const handleConfirm = async (token1: Token, token2: Token) => {
        try {
            await createLiquidityPool({
                params: {
                    params: {
                        token1: token1.address,
                        token2: token2.address,
                        token1Name: token1.name,
                        token2Name: token2.name,
                    }
                },
                onSuccess: (tx) => {
                    toast.success("Liquidity pool created successfuly");
                    setOpen(false);
                },
                onError: (tx) => {
                    toast.error("Error when creating liquidity pool");
                },
            });

        } catch (error) {
            console.log("Error when creating liquidity pool: ", error);
            toast.error("Error when creating liquidity pool");
        }
    }

    const handleAddLiquidity = async () => {
        if (selectedPool === "" || liquidityAmountToken1 === 0 || liquidityAmountToken2 === 0) {
            toast.error("Please select a pool and provide liquidity amounts");
            return;
        }
        try {
            const token1Address = await getToken1({ params: { contractAddress: selectedPool } });
            const token2Address = await getToken2({ params: { contractAddress: selectedPool } });
            const isToken1Approved = await checkAllowance(
                token1Address as string,
                account as string,
                selectedPool as string,
                ethers.utils.parseEther(String(liquidityAmountToken1))
            );
            const isToken2Approved = await checkAllowance(
                token2Address as string,
                account as string,
                selectedPool as string,
                ethers.utils.parseEther(String(liquidityAmountToken2))
            );

            const parsedAmount1 = ethers.utils.parseEther(String(liquidityAmountToken1));
            const parsedAmount2 = ethers.utils.parseEther(String(liquidityAmountToken2));

            if (!isToken1Approved || !isToken2Approved) {
                await requestApprovals(
                    isToken1Approved,
                    token1Address as string,
                    isToken2Approved,
                    token2Address as string,
                    selectedPool as string,
                    parsedAmount1,
                    parsedAmount2,
                );
            } else {
                await triggerLiquidityAdd(parsedAmount1, parsedAmount2);
            }
        } catch (error) {

        }
    }

    const handleRemoveLiquidity = async () => {
        if (selectedPool === "" || liquidityToRemove === 0) {
            toast.error("Please select a pool and provide liquidity amounts");
            return;
        }
        try {
            await removeLiquidity({
                params: {
                    contractAddress: selectedPool,
                    params: {
                        amountOfLiquidity: ethers.utils.parseEther(String(liquidityToRemove))
                    }
                },
                onSuccess: (tx) => {
                    toast.success("Liquidity removed successfuly");
                },
                onError: (tx) => {
                    toast.error("Error when removing liquidity");
                },
            });
        } catch (error) {
            toast.error("Error when removing liquidity");
        }
    }

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
        isToken2Approved: boolean,
        token2Address: string,
        spender: string,
        amountToken1: ethers.BigNumberish,
        amountToken2: ethers.BigNumberish
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
            if (!isToken2Approved) {
                await approve({
                    params: {
                        contractAddress: token2Address,
                        params: {
                            spender: spender,
                            value: amountToken2
                            // value: ethers.utils.parseEther(String(amountToken1))
                        }
                    }
                });
            }
            await triggerLiquidityAdd(amountToken1, amountToken2);
        } catch (error) {
            toast.error("Error when requesting approvals");
        }
    }

    const triggerLiquidityAdd = async (amount1: ethers.BigNumberish, amount2: ethers.BigNumberish) => {
        try {
            await addLiquidity({
                params: {
                    contractAddress: selectedPool,
                    params: {
                        amountToken1: amount1,
                        amountToken2: amount2
                    }
                },
                onSuccess: (tx) => {
                    toast.success("Liquidity added successfuly");
                },
                onError: (tx) => {
                    toast.error("Error when adding liquidity");
                },
            });
        } catch (error) {

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
            const fetchLiquidityAmount = async () => {
                const liquidityToken = await getLiquidityToken({ params: { contractAddress: selectedPool } });
                if (liquidityToken) {
                    const balance = await getBalanceOf({ params: { contractAddress: liquidityToken as string, params: { account: account } } }) as ethers.BigNumberish;
                    setLiquidityAmount(Number(ethers.utils.formatEther(balance)));
                    console.log("Liquidity token balance: ", balance);
                }
            }
            fetchLiquidityAmount();
        }
    }, [selectedPool])

    return (
        <div className='mt-8 p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto text-black'>
            <h2 className='text-2xl font-bold text-center'>LiquidityPools</h2>
            {
                isWeb3Enabled && qiteContractAddress !== "" ? (
                    <>
                        <div className='flex flex-col gap-4 mt-2'>
                            <div className="flex justify-between mt-4">
                                <p>Welcome, <span className='font-bold'>{account ? truncate({ text: account, startChars: 4, endChars: 4, maxLength: 11 }) : ""}</span></p>
                                <p className=''>Your Liquidity Amount : <span className='font-bold'>{liquidityAmount}</span></p>
                            </div>
                            <Button
                                onClick={() => setOpen(true)}
                            >Create Liquidity Pool</Button>
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
                            {selectedPool ? (
                                <>
                                    <div>
                                        <label htmlFor="liquidityAmountToken1" className='text-sm font-bold'>Liquidity Token1 Amount</label>
                                        <Input
                                            id='liquidityAmountToken1'
                                            name='liquidityAmountToken1'
                                            type='number'
                                            value={liquidityAmountToken1}
                                            onChange={(e) => setLiquidityAmountToken1(Number(e.target.value))}
                                        />

                                    </div>
                                    <div>
                                        <label htmlFor="liquidityAmountToken2" className='text-sm font-bold'>Liquidity Token2 Amount</label>
                                        <Input
                                            id='liquidityAmountToken2'
                                            name='liquidityAmountToken2'
                                            type='number'
                                            value={liquidityAmountToken2}
                                            onChange={(e) => setLiquidityAmountToken2(Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="liquidityAmountToken2" className='text-sm font-bold'>Liquidity Amount To Remove</label>
                                        <Input
                                            id='liquidityAmountToken2'
                                            name='liquidityAmountToken2'
                                            type='number'
                                            value={liquidityToRemove}
                                            onChange={(e) => setLiquidityToRemove(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex gap-4 w-full">
                                        {liquidityAmount > 0 ? <Button className='flex-1' onClick={handleRemoveLiquidity}>Remove Liquidity</Button> : null}
                                        <Button className='flex-1' onClick={handleAddLiquidity}>Add Liquidity</Button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                        {/* <div className='flex justify-start'>
                            <p className='font-bold mt-2'>Your Liquidity Amount : {liquidityAmount}</p>
                            </div> */}
                        <CreateModal
                            open={open}
                            setOpen={setOpen}
                            handleConfirm={handleConfirm} />
                    </>
                ) : <div className='mt-2 flex justify-center'>
                    <ConnectButton />
                </div>
            }
        </div >
    )
}

export default LiquidityPools