#pragma once

#include <string>

#include <QJsonArray>
#include <QJsonObject>

#include "BigInt.hpp"
#include "ScanCriterion.hpp"
#include "TransactionCategory.hpp"

namespace Xeth{

class AccountScanCriterion : public ScanCriterion
{
    public:
        AccountScanCriterion(const char *);

        void processHeader
        (
            size_t index,
            const std::string &hash,
            const std::string &miner,
            const BigInt &amount,
            time_t timestamp,
            QJsonArray &result
        );

        void processTransaction
        (
            const std::string &hash,
            const std::string &from,
            const std::string &to,
            const BigInt &amount,
            const std::string &data,
            time_t timestamp,
            QJsonArray &result
        );

    private:
        void saveTransaction
        (
            const TransactionCategory &category,
            const std::string &hash,
            const std::string &from,
            const std::string &to,
            const BigInt &amount,
            time_t timestamp,
            QJsonArray &result
        );
};


}
