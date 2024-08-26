import { ConnectButton } from 'web3uikit';
import Link from 'next/link';
import { adminAddress } from '@/constants/qite-dex-constants';
import useWalletStore from '@/store/wallet';
import { useEffect, useState } from 'react';

export const Header = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const { isWeb3Enabled, account } = useWalletStore();

    useEffect(() => {
        if (isWeb3Enabled && account) {
            setIsAdmin(account.toLowerCase() === adminAddress.toLowerCase());
        }
    }, [account]);

    return (
        <nav className="p-5 flex">
            <div className="w-full grid grid-cols-6 py-3 border-[1px border-gray-600 rounded-2xl custom-backdrop shadow-lg">
                <div className='flex justify-center md:justify-start col-span-3 md:col-span-2'>
                    <Link href={"/"}>
                        <h1 className="py-2 px-8 font-bold text-3xl text-white">
                            Infinity DEX
                        </h1>
                    </Link>
                </div>
                <div className='flex-1 flex justify-center col-span-3 md:col-span-2'>
                    <ul className='text-white font-semibold flex justify-center md:justify-center gap-4 items-center text-xl w-full'>
                        <Link href={"/pools"}>
                            <li>Pools</li>
                        </Link>
                        <Link href={"/swap"}>
                            <li>Swap</li>
                        </Link>
                        {isAdmin ? (
                            <Link href={"/admin"}>
                                <li>Admin</li>
                            </Link>
                        ) : null}
                    </ul>
                </div>
                <div className="py-2 px-4 flex justify-center col-span-6 md:justify-end md:col-span-2">
                    <ConnectButton />
                </div>
            </div>
        </nav >
    )
}
