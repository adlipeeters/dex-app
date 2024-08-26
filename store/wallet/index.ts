import { WalletState } from '@/types';
import { create } from 'zustand';

const useWalletStore = create<WalletState>((set) => ({
    account: "",
    chainIdHex: "",
    isWeb3Enabled: false,
    setAccountData: (account: string, chainIdHex: string, isWeb3Enabled) => set({ account: account, chainIdHex: chainIdHex, isWeb3Enabled: isWeb3Enabled }),
}));

export default useWalletStore;
