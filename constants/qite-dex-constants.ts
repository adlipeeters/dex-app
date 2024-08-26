import { QiteAddresses } from '@/types';
import qiteDexAbi from './abi/qite-dex-abi.json';
import qitePoolAbi from './abi/qite-pool-abi.json';
import qitePoolTokenAbi from './abi/qite-pool-token-abi.json';


// /token1_address = "0x56A0A8524F71c2947434172abFBAF80c1aC6D70e"
// /token1_name = "TOKEN1"
// /token2_address = "0x5A12796B21B3c275e47ECBb4E39F9a114239913a"
// /token2_name = "TOKEN2"

const qiteAddresses: QiteAddresses = {
    "11155111": {
        "qiteSwap": "0xed3a65f32b2f81E95E9eDEB87D792278D381f876"
    }
}

const adminAddress = "fakeAdminAddress";

export {
    qiteDexAbi,
    qitePoolAbi,
    qitePoolTokenAbi,
    qiteAddresses,
    adminAddress
};
