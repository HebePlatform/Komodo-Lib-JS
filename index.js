const address = require('./src/address')
const bitgotx = require('bitgo-utxo-lib')


function transaction(amount, fee, recipientAddress, utxo, blocks, privKey) {
    let satoshisSoFar = 0;
    let expiryHeight = blocks + 30; //one hour
    amount = Math.round(amount * 100000000);
    fee = Math.round(fee * 100000000);
    let recipients = [{address: recipientAddress, satoshis: amount}];

    let history = []

    for (let i = 0; i < utxo.length; i++) {
        if (utxo[i].confirmations === 0) {
            continue;
        }

        history = history.concat({
            txid: utxo[i].txid,
            vout: utxo[i].vout,
            scriptPubKey: utxo[i].scriptPubKey,
            satoshis: utxo[i].satoshis
        });

        // How many satoshis do we have so far
        satoshisSoFar = satoshisSoFar + utxo[i].satoshis;
        if (satoshisSoFar >= amount + fee) {
            break;
        }
    }
    if (satoshisSoFar !== amount + fee) {
        let refundSatoshis = satoshisSoFar - amount - fee
        let pubKey = address.privKeyToPubKey(privKey, true);
        let addr = address.pubKeyToAddr(pubKey)
        recipients = recipients.concat({address: addr, satoshis: refundSatoshis})
    }

    let network = bitgotx.networks.komodo

    const txb = new bitgotx.TransactionBuilder(network, fee);

    txb.setVersion(4);
    txb.setVersionGroupId(0x892F2085);
    txb.setExpiryHeight(expiryHeight);

    // Add Inputs/Outputs
    history.forEach(x => txb.addInput(x.txid, x.vout));
    recipients.forEach(x => txb.addOutput(x.address, x.satoshis));

    let pass=address.privKeyToWIF(privKey,true,'bc')
    // Sign

    var keyPair = bitgotx.ECPair.fromWIF(pass, network)
    const hashType = bitgotx.Transaction.SIGHASH_ALL
    for (let i = 0; i < txb.inputs.length; i++) {
        txb.sign(i, keyPair, null, hashType, history[i].satoshis);
    }
    const result = txb.build();
    const txHexString = result.toHex();
    return txHexString;
}

module.exports = {
    transaction: transaction,
    mkPrivKey: address.mkPrivKey,
    privKeyToWIF: address.privKeyToWIF,
    privKeyToPubKey: address.privKeyToPubKey,
    pubKeyToAddr: address.pubKeyToAddr,
    WIFToPrivKey: address.WIFToPrivKey,
    bitgotx: bitgotx
};
