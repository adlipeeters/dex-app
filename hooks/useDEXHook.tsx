// hooks/useWeb3Interactions.js
import { useWeb3Contract } from 'react-moralis';
import { qiteDexAbi, qitePoolAbi, qitePoolTokenAbi } from '@/constants/qite-dex-constants';
import useDEXStore from '@/store/dex';

export function useDEXHook() {
    const { contractAddress: qiteContractAddress } = useDEXStore();

    const { runContractFunction: createLiquidityPool } = useWeb3Contract({
        abi: qiteDexAbi,
        contractAddress: qiteContractAddress,
        functionName: 'createPairs',
    })

    const { runContractFunction: getPairs } = useWeb3Contract({
        abi: qiteDexAbi,
        contractAddress: qiteContractAddress,
        functionName: 'getPairs',
    })

    const { runContractFunction: addLiquidity } = useWeb3Contract({
        abi: qitePoolAbi,
        functionName: 'addLiquidity',
    })

    const { runContractFunction: removeLiquidity } = useWeb3Contract({
        abi: qitePoolAbi,
        functionName: 'removeLiquidity',
    })

    const { runContractFunction: getLiquidityToken } = useWeb3Contract({
        abi: qitePoolAbi,
        functionName: 'liquidityToken',
    })

    const { runContractFunction: getToken1 } = useWeb3Contract({
        abi: qitePoolAbi,
        functionName: 'token1',
    })

    const { runContractFunction: getToken2 } = useWeb3Contract({
        abi: qitePoolAbi,
        functionName: 'token2',
    })

    const { runContractFunction: getAllowance } = useWeb3Contract({
        abi: qitePoolTokenAbi,
        functionName: 'allowance',
    })

    const { runContractFunction: approve } = useWeb3Contract({
        abi: qitePoolTokenAbi,
        functionName: 'approve',
    })

    const { runContractFunction: getBalanceOf } = useWeb3Contract({
        abi: qitePoolTokenAbi,
        functionName: 'balanceOf',
    })

    const { runContractFunction: getExpectedAmountOut } = useWeb3Contract(
        {
            abi: qitePoolAbi,
            // contractAddress: selectedPool,
            functionName: "estimateOutputAmount",
        }
    )

    const { runContractFunction: swapTokens } = useWeb3Contract({
        abi: qitePoolAbi,
        functionName: 'swapTokens',
    })

    // Return all functions so they can be used by the component
    return {
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
        getExpectedAmountOut,
        swapTokens,
    };
}
