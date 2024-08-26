import { DEXState, WalletState } from '@/types';
import { create } from 'zustand';

const useDEXStore = create<DEXState>((set) => ({
    contractAddress: "",
    setContractAddress: (contractAddress: string | undefined) => set({ contractAddress }),
}));

export default useDEXStore;
