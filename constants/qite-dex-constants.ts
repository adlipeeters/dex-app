import { QiteAddresses } from '@/types';
import qiteDexAbi from './abi/qite-dex-abi.json';
import qitePoolAbi from './abi/qite-pool-abi.json';
import qitePoolTokenAbi from './abi/qite-pool-token-abi.json';


// /token1_address = "0x674cE055435699a6Cea3Dc500847669663f2d1DC"
// /token1_name = "TEST1"
// /token2_address = "0xFe2f4470bd6fE00e6804fC76087c363e5bb400B1"
// /token2_name = "TEST2"

const qiteAddresses: QiteAddresses = {
    "11155111": {
        "qiteSwap": "0x79DfCeb440AFb6B3C5389b4833F7334a194E0A7c"
    }
}

const adminAddress = "0x4be5b8Ef34d844B04260eA72341169546bE0E288";

export {
    qiteDexAbi,
    qitePoolAbi,
    qitePoolTokenAbi,
    qiteAddresses,
    adminAddress
};
