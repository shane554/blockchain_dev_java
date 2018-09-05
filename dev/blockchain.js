const sha256 = require('sha256');

const currentNodeUrl = process.argv[3];


// creating our constructor
function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];

    this.currentNodeUrl = currentNodeUrl;
    // we want the nodes to be aware of eachother
    this.networkNodes = [];

    // genesis block creation
    this.createNewBlock(100, '0', '0');
}

//  we want to place a method on our chain
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    // properties of each block
    const newBlock = {
        index:this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    // we now want to clear out the array for the new block
    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;

}

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
}


Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient

    };
    // we want to push new Transaction into newtransaction array
    this.pendingTransactions.push(newTransaction);

    // we want to return block with latest transactions
    return this.getLastBlock()['index'] + 1;
}

// hashing fuunction to hash the blocks
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;

}

// prof of work we want hash to contain 0000...
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    //we want to run hashblock over and ovet until it starts with 0000... code will keep running until found
    while (hash.substring(0,4) !== '0000'){
        //if unsussesssful change nonce by 1 and go again
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
        //console.log(hash);
    }

    return nonce;

}

module.exports = Blockchain;