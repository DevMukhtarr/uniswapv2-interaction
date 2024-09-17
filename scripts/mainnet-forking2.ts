import { ethers, network } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountIn = ethers.parseUnits("50", 6)
    const amountOutMin = ethers.parseUnits("10", 18)

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    const approveTx = await USDC_Contract.approve(ROUTER_ADDRESS, amountIn);
    approveTx.wait()

    const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner)
    const daiBal = await DAI_Contract.balanceOf(impersonatedSigner)

    console.log("USDC Balance before swap", Number(usdcBal))
    console.log("DAI Balance before swap", Number(daiBal))

    const txReceipt = await ROUTER.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        [USDC_Contract.getAddress(), DAI_Contract.getAddress()],
        impersonatedSigner,
        deadline
    )

    txReceipt.wait()

    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner)
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner)

    console.log("===============================================")

    console.log("USDC Balance after swap", Number(usdcBalAfter))
    console.log("DAI Balance after swap", Number(daiBalAfter))

    console.log(txReceipt)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
