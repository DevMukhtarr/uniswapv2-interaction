import { ethers, network } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

    // const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";
    const TOKEN_HOLDER = "0xfe9E452E1A2750825181319A9846a56Ba37f0322";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    
    const amountOut = ethers.parseUnits("1", 18,);
    const amountInMax = ethers.parseUnits("3000", 6);
    
    const USDC_CONTRACT = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const WETH_CONTRACT = await ethers.getContractAt("IERC20", WETH, impersonatedSigner);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);
    
    const approveTx = await USDC_CONTRACT.approve(ROUTER_ADDRESS, amountInMax);
    approveTx.wait()

    const usdcBal = await USDC_CONTRACT.balanceOf(impersonatedSigner)

    const ETHERSBALANCEBEFORESWAP = await ethers.provider.getBalance(TOKEN_HOLDER);
    console.log({
		"ETH Balance before swap": ethers.formatUnits(ETHERSBALANCEBEFORESWAP.toString(),18)
    })
    
    console.log("USDC Balance before swap", Number(usdcBal))
    
    const txReceipt = await ROUTER.swapTokensForExactETH(
        amountOut,
        amountInMax,
        [USDC_CONTRACT.getAddress(), WETH_CONTRACT.getAddress()],
        impersonatedSigner,
        deadline
    )
    
    await txReceipt.wait()
    
    const usdcBalAfter = await USDC_CONTRACT.balanceOf(impersonatedSigner)

    const ETHERSBALANCEAFTERSWAP = await ethers.provider.getBalance(TOKEN_HOLDER);
    
    console.log("===============================================")
    
	console.log({
		"ETH Balance after swap": ethers.formatUnits(ETHERSBALANCEAFTERSWAP.toString(),18)
    })
    console.log("USDC Balance after swap",  Number(usdcBalAfter))

    console.log(txReceipt)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
