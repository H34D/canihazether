const atlas = require('@ethereum-navigator/atlas');
const Web3 = require('web3');
const chalkAnimation = require('chalk-animation');
const argv = require('yargs')
    .parserConfiguration({
        "parse-numbers": false
    })
    .argv;

const timeout = 5;

async function getBalance(
    network,
    addr
) {
    const web3 = new Web3(new Web3.providers.HttpProvider(network.rpcUrl, {timeout: timeout * 1000}));

    let balance = await web3.eth.getBalance(addr)
        .catch((e) => {
            // console.log(e)
        });

    if (!balance) {
        balance = "0";
    }

    // console.log(web3.utils.fromWei(balance, "ether"), network.name);

    return {
        balance,
        network
    };
}

(async () => {
    const arg = argv._[0] || "";
    const addr = arg ? arg.toString() : "";
    let err = false;

    if (!addr) {
        console.error('Ethereum address missing!');
        err = true;
    }

    if (addr && (!addr.startsWith('0x') || addr.length !== 42)) {
        console.error(`'${addr}' is not a valid Ethereum address!`);
        err = true
    }

    if (err) {
        console.log();
        console.log('use: canihazether [address]');
        return;
    }

    const getBalancePromises = atlas
        .filter((network) => network.rpcUrl)
        .map((network) => {
            return getBalance(network, addr)
        });

    chalkAnimation.rainbow('Searching ...');

    const results = (await Promise.all(getBalancePromises));
    const filteredResults = results
        .filter((result) => result.balance !== "0");

    console.log(`Address ${addr} haz:\n`);

    if (filteredResults.length > 0) {
        for (const result of filteredResults) {
            console.log(
                `${Web3.utils.fromWei(result.balance, 'ether')} Ether on the ${result.network.name} network (${result.network.networkId}).`
            )
        }
    } else {
        console.log(`no Ether!`)
    }

    console.log();
    console.log(`searched on ${results.length} networks from the atlas`)

})();