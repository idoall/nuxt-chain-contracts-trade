// run 使用 hardhat 默认的命令来运行，例如：await hre.run("compile");
const { run, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        // 通过脚本以编程方式验证合约 运行 npx hardhat verify 进行验证
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    verify,
}
