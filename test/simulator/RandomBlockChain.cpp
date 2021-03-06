#include "RandomBlockChain.hpp"


RandomBlockChain::RandomBlockChain() :
    _height(0),
    _fetched(0)
{}


RandomBlockChain::RandomBlockChain(size_t size) :
    _height(size),
    _fetched(0)
{}


void RandomBlockChain::retrieveBlockDetails(bool)
{}


size_t RandomBlockChain::getHeight()
{
    return _height;
}

void RandomBlockChain::setHeight(size_t heigh)
{
    _height = heigh;
}

size_t RandomBlockChain::getTotalFetched()
{
    return _fetched;
}

void RandomBlockChain::resetCounter()
{
    _fetched = 0;
}

Ethereum::Connector::Block RandomBlockChain::getBlock(size_t number)
{
    return Ethereum::Connector::Block(getBlockData(number));
}


void RandomBlockChain::pushMemPool(const char *from, const char *to, const BigInt &amount, const char *data)
{
    pushMemPool(RandomHexString().c_str(), from, to, amount, data);
}

RandomBlockChain::TransactionCollection RandomBlockChain::getMemPool() const
{
    return TransactionCollection(_mempool);
}



void RandomBlockChain::pushMemPool(const char *txid, const char *from, const char *to, const BigInt &amount, const char *data)
{
    Json::Value tx;
    tx["hash"] = txid;
    tx["from"] = from;
    tx["to"] = to;
    tx["value"] = Hex(amount);
    tx["input"] = data ? data : "";
    tx["time"] = Hex(time(NULL));
    _mempool.append(tx);
}


Json::Value RandomBlockChain::getBlockData(size_t number)
{
    if(number > _height)
    {
        throw std::runtime_error("invalid block offset");
    }

    _fetched ++;
    Json::Value block;
    block["number"] = Hex(number);
    block["hash"] = RandomHexString(65);
    block["miner"] = RandomHexString(65);
    block["timestamp"] =  Hex(time(NULL) - (_height - number)*12);
    block["transactions"] = _mempool.size()?_mempool:Json::arrayValue;
    _mempool = Json::arrayValue;
    return block;
}
