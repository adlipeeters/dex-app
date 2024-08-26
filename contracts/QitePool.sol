//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./QiteLiquidityToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QitePool is Ownable {
    using SafeMath for uint256;
    using Math for uint256;

    address public token1;
    address public token2;

    uint256 public reserve1;
    uint256 public reserve2;

    // x * y = k
    uint256 public constantK;

    QiteLiquidityToken public liquidityToken;
    uint256 public feeBasisPoints = 25; // 0.25% fee
    mapping(address => uint256) public accumulatedFees;

    event Swap(
        address indexed sender,
        uint256 amountIn,
        uint256 amountOut,
        address tokenIn,
        address tokenOut
    );

    constructor(
        address _token1,
        address _token2,
        string memory _liquidityTokenName,
        string memory _liquidityTokenSymbol
    ) Ownable(msg.sender) {
        token1 = _token1;
        token2 = _token2;
        liquidityToken = new QiteLiquidityToken(
            _liquidityTokenName,
            _liquidityTokenSymbol
        );
    }

    function addLiquidity(uint256 amountToken1, uint256 amountToken2) external {
        // Create and send some liquidity token to the liquidity provider
        uint256 liquidity;
        uint256 totalSupplyOfToken = liquidityToken.totalSupply();
        if (totalSupplyOfToken == 0) {
            // amount of liquidity at initialization
            // liquidity = amountToken1.mul(amountToken2).sqrt();
            liquidity = sqrt(amountToken1.mul(amountToken2));
        } else {
            // amountToken1 * totalSupplyLiquidityToken / Reserve1, amountToken2 * totalSupplyLiquidityToken / Reserve2
            liquidity = amountToken1.mul(totalSupplyOfToken).div(reserve1).min(
                amountToken2.mul(totalSupplyOfToken).div(reserve2)
            );
        }
        liquidityToken.mint(msg.sender, liquidity);
        // Transfer amountToken1 and amountToken2 inside this liquidity Pool
        require(
            IERC20(token1).transferFrom(
                msg.sender,
                address(this),
                amountToken1
            ),
            "Transfer of token1 is failed"
        );
        require(
            IERC20(token2).transferFrom(
                msg.sender,
                address(this),
                amountToken2
            ),
            "Transfer of token2 is failed"
        );
        // Update reserve1 and the reserve2
        reserve1 += amountToken1;
        reserve2 += amountToken2;
        // Update the constant formula
        _updateConstantFormula();
        // add events
    }

    function removeLiquidity(uint256 amountOfLiquidity) external {
        uint256 totalSupply = liquidityToken.totalSupply();
        require(
            amountOfLiquidity <= totalSupply,
            "Liquidity is more than total supply"
        );
        // Burn the liquidity amount
        liquidityToken.burn(msg.sender, amountOfLiquidity);
        // Transfer token1 and token2 to liquidity provider or msg.sender
        uint256 amount1 = (reserve1 * amountOfLiquidity) / totalSupply;
        uint256 amount2 = (reserve2 * amountOfLiquidity) / totalSupply;
        require(
            IERC20(token1).transfer(msg.sender, amount1),
            "Transfer of token1 failed"
        );
        require(
            IERC20(token2).transfer(msg.sender, amount2),
            "Transfer of token1 failed"
        );
        // Update reserve 1 and reserve 2
        reserve1 -= amount1;
        reserve2 -= amount2;
        // Update the constant formula
        _updateConstantFormula();
        // add events
    }

    // function swapTokens(
    //     address fromToken,
    //     address toToken,
    //     uint256 amountIn,
    //     uint256 amountOut
    // ) external {
    //     // Make some checks
    //     require(amountIn > 0 && amountOut > 0, "Amount must be greater than 0");
    //     require(
    //         (fromToken == token1 && toToken == token2) ||
    //             (fromToken == token2 && toToken == token1),
    //         "Tokens need to be pairs of this liquidity pool"
    //     );
    //     IERC20 fromTokenContract = IERC20(fromToken);
    //     IERC20 toTokenContract = IERC20(toToken);
    //     require(
    //         fromTokenContract.balanceOf(msg.sender) > amountIn,
    //         "Insufficient balance of tokenFrom"
    //     );
    //     require(
    //         toTokenContract.balanceOf(address(this)) > amountOut,
    //         "Insufficient balance of tokenTo"
    //     );
    //     // Verify that amountOut is less or equal to expectedAmount after calculation
    //     uint256 expectedAmountOut;
    //     // 10 * 10 = 100
    //     // reserve1 * reserve2 = constantK
    //     // (reserve1 + amountIn)*(reserve2 - expectedAmountOut) = constantK
    //     // reserve2-expectedAmountOut = constantK/ (reserve1+amountIn)
    //     // expecteAmountOut = reserve2 - constantK / (reserve1+amountIn)
    //     if (fromToken == token1) {
    //         uint256 newReserve1 = reserve1 + amountIn;
    //         expectedAmountOut = reserve2 - (constantK / newReserve1);
    //     } else {
    //         uint256 newReserve2 = reserve2 + amountIn;
    //         expectedAmountOut = reserve1 - (constantK / newReserve2);
    //     }
    //     require(
    //         amountOut <= expectedAmountOut,
    //         "Swap does not preserve constant formula"
    //     );
    //     // Perform the swap, to transfer amountIn into the liquidity poll and to transfer to the swap initiator the amountOut
    //     require(
    //         fromTokenContract.transferFrom(msg.sender, address(this), amountIn),
    //         "Transfer of token from failed"
    //     );
    //     require(
    //         toTokenContract.transfer(msg.sender, expectedAmountOut),
    //         "Transfer of token to failed"
    //     );
    //     // Update the reserve1 and reserve2
    //     if (fromToken == token1 && toToken == token2) {
    //         reserve1 = reserve1.add(amountIn);
    //         reserve2 = reserve2.sub(expectedAmountOut);
    //     } else {
    //         reserve1 = reserve1.sub(expectedAmountOut);
    //         reserve2 = reserve2.add(amountIn);
    //     }
    //     // Check that the result is maintaining the constant formula x*y = k
    //     require(
    //         reserve1.mul(reserve2) <= constantK,
    //         "Swap does not preserve constant formula"
    //     );
    //     _updateConstantFormula();
    //     // add events
    //     emit Swap(msg.sender, amountIn, expectedAmountOut, fromToken, toToken);
    // }

    function swapTokens(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) external {
        require(amountIn > 0, "Amount must be greater than 0");
        require(
            (fromToken == token1 && toToken == token2) ||
                (fromToken == token2 && toToken == token1),
            "Tokens need to be pairs of this liquidity pool"
        );

        // Calculate fee
        uint256 fee = amountIn.mul(feeBasisPoints).div(10000);
        uint256 amountInAfterFee = amountIn.sub(fee);

        // Ensure balances and allowances are sufficient
        IERC20 fromTokenContract = IERC20(fromToken);
        IERC20 toTokenContract = IERC20(toToken);
        require(
            fromTokenContract.balanceOf(msg.sender) >= amountIn,
            "Insufficient balance of tokenFrom"
        );

        // Calculate expected output amount
        uint256 expectedAmountOut = estimateOutputAmount(
            amountInAfterFee,
            fromToken
        );
        require(
            toTokenContract.balanceOf(address(this)) >= expectedAmountOut,
            "Insufficient liquidity"
        );

        // Transfer the input tokens and collect the fee
        require(
            fromTokenContract.transferFrom(msg.sender, address(this), amountIn),
            "Transfer of token from failed"
        );

        // Accumulate the fees
        accumulatedFees[fromToken] = accumulatedFees[fromToken].add(fee);

        // Execute the swap
        require(
            toTokenContract.transfer(msg.sender, expectedAmountOut),
            "Transfer of token to failed"
        );

        // Update reserves post-swap
        updateReserves(fromToken, toToken, amountInAfterFee, expectedAmountOut);

        emit Swap(msg.sender, amountIn, expectedAmountOut, fromToken, toToken);
    }

    function updateReserves(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOut
    ) internal {
        if (fromToken == token1 && toToken == token2) {
            reserve1 = reserve1.add(amountIn);
            reserve2 = reserve2.sub(amountOut);
        } else {
            reserve1 = reserve1.sub(amountOut);
            reserve2 = reserve2.add(amountIn);
        }
        _updateConstantFormula();
    }

    function withdrawFees(address token, address to) external onlyOwner {
        uint256 amount = accumulatedFees[token];
        require(amount > 0, "No fees available");
        IERC20(token).transfer(to, amount);
        accumulatedFees[token] = 0;
    }

    function _updateConstantFormula() internal {
        constantK = reserve1.mul(reserve2);
        require(constantK > 0, "Constant formula not updated");
    }

    function estimateOutputAmount(uint256 amountIn, address fromToken)
        public
        view
        returns (uint256 expectedAmountOut)
    {
        require(amountIn > 0, "Amount must be greater than 0");
        require(
            fromToken == token1 || fromToken == token2,
            "Need to be a token in this pair"
        );
        uint256 newReserve; // This will be the reserve of the token being bought
        if (fromToken == token1) {
            newReserve = constantK / (reserve1 + amountIn);
            expectedAmountOut = reserve2 > newReserve
                ? reserve2 - newReserve
                : 0;
        } else {
            newReserve = constantK / (reserve2 + amountIn);
            expectedAmountOut = reserve1 > newReserve
                ? reserve1 - newReserve
                : 0;
        }
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = (y.div(2)).add(1);
            while (x < z) {
                z = x;
                x = ((y.div(x)).add(x)).div(2);
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
