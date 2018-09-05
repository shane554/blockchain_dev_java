const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');

const port = process.argv[2];

const rp = require('request-promise');


// we use a unique string and remove the - out of it
const nodeAddress = uuid().split('-').join('');

//we want to make an instance of our vlockchain
const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

 
app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
  
})
// to create new transaction
app.post('/transaction', function(req, res) {
    const blockIndex = bitcoin.createNewTransaction(
                        req.body.amount,
                        req.body.sender, 
                        req.body.recipient);

    res.json({note: `Transaction will be added in block ${blockIndex}.` });
                
            });

app.get('/mine', function(req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    // we want to reward the miner for mining a block
bitcoin.createNewTransaction(12.5, "00", nodeAddress);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    // we want to send response to whoever mined the block
    res.json({
        note: "New block mined successfully!!",
        block: newBlock
    })

});
// will register a node and broadcast to network
app.post('/register-and-broadcast-node', function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    // if newnodeUrl is not present in network node  arry then add it to array
    if (bitcoin.networkNodes.indexOf(newNodeUrl) ==-1) bitcoin.networkNodes.push(newNodeUrl);


    const regNodesPromises =[];
    // we want to broadcast and register the  node to network
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        regNodesPromises.push(rp(requestOptions));
    });
    // we now use the data given back form nodes connected
    Promise.all(regNodesPromises)
    .then  (data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl ]},
            json: true

            
        };
        catch(error => {

            console.error('/register-and-broadcast-node Promise error ' + error);
        
        })
        
        
        
        return rp(bulkRegisterOptions);
        
        
    })

    
    
    
    .then(data => {
        res.json({ note: 'New node registered with network successfully' });

    })   
});

//register a node with the network
app.post('/register-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAllReadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAllReadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    res.json({ note: 'New node registered successfully ' });

});
// is only used whene a node registers
app.post('/register-nodes-bulk', function(req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        // we now register by pushing new node to networkNodeUrl
        // on;y if it does not exist
        const nodeNotAllReadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl)
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
       if(nodeNotAllReadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
    });

    res.json({ note: 'Bulk registration successful!' });

});
 
app.listen(port, function() {
    console.log(`Listening on port ${port}... `);
});


