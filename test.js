(async function () {
    let kmd = require('./index');
    let axios = require('axios');
    let to = "RNTv4xTLLm26p3SvsQCBy9qNK7s1RgGYSB";
    let token = "baby suffocate green crazy cool flower sure torture mess knee beside recall";
    let privKey = kmd.mkPrivKey(token);
    let pubKey = kmd.privKeyToPubKey(privKey, true);
    let addr = kmd.pubKeyToAddr(pubKey);
    let balance = (await axios.get("https://rick.kmd.dev/insight-api-komodo/addr/" + addr)).data.balance;
    let blocks = (await axios.get("https://rick.kmd.dev/insight-api-komodo//status?q=getinfo")).data.info.blocks;

    console.log(addr, "addr");
    console.log(balance, "balance");
    console.log(blocks, "blocks");

    let txs = (await axios.post("https://rick.kmd.dev/insight-api-komodo/addrs/utxo", {
        "addrs": addr
    })).data;

    let rawtx = kmd.transaction(0.01, 0.0001, to, txs, blocks, privKey);

    let txid = (await axios.post("https://rick.kmd.dev/insight-api-komodo/tx/send", {
        "rawtx": rawtx
    })).data.txid;

    console.log(txid);

})();
