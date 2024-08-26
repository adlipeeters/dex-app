export interface QiteAddresses {
    [key: string]: {
        qiteSwap: string;
    };
}

export interface TruncateParams {
    text: string
    startChars: number
    endChars: number
    maxLength: number
}

export interface Token {
    address: string;
    name: string;
}

export interface Balance {
    token1: number;
    token2: number;
    poolToken1: number;
    poolToken2: number;
}

export interface WalletState {
    account: string;
    chainIdHex: string;
    isWeb3Enabled: boolean;
    setAccountData: (account: string, chainIdHex: string, isWeb3Enabled: boolean) => void;
}

export interface DEXState {
    contractAddress: string | undefined;
    setContractAddress: (address: string | undefined) => void;
}