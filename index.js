"use strict";
exports.__esModule = true;
var fs = require('node:fs');
var csv = require('fast-csv');
var readlineSync = require('readline-sync');
var axios_1 = require("axios");
var CSVPath = "C://transactions.csv";
var apiUrl = 'https://min-api.cryptocompare.com/data/price';
var exchangeCurrency = 'USD';
var tokens = {
/*
    ETH: 200,
    BTH: 10
*/
};
var InitializeApp = function () {
    console.log('Welcome To Your Portfolio Value Calculator,\nYou can add the filters below');
    var inputToken = readlineSync.question('Filter Token: ').toUpperCase();
    var inputDate = readlineSync.question('Filter Date: ');
    ProcessCSV({ inputToken: inputToken, inputDate: inputDate });
};
var ProcessCSV = function (options) {
    var stream = fs.createReadStream(CSVPath);
    stream.pipe(csv.parse({ headers: true }))
        .on('error', function (error) { return console.error(error); })
        .on('data', function (token) {
        if (tokens[token.token] === undefined)
            tokens[token.token] = 0;
        if (options.inputDate !== undefined && options.inputDate !== '') {
            var transDate = new Date(parseInt(token['timestamp']) * 1000).toLocaleDateString();
            var inputDate = new Date(options.inputDate).toLocaleDateString();
            if (transDate === inputDate)
                CalculateDebitCreditValue(token);
        }
        else
            CalculateDebitCreditValue(token);
    })
        .on('end', function () {
        SetAmountToExchanged(options);
    });
};
var CalculateDebitCreditValue = function (token) {
    if (token['transaction_type'] === 'DEPOSIT')
        tokens[token.token] += parseFloat(token.amount);
    else
        tokens[token.token] - +parseFloat(token.amount);
};
var SetAmountToExchanged = function (options) {
    var tokenKeys = '';
    Object.entries(tokens).forEach(function (_a) {
        var key = _a[0];
        tokenKeys += ',' + key;
    });
    axios_1["default"].get(apiUrl, {
        params: {
            fsym: exchangeCurrency,
            tsyms: tokenKeys
        }
    }).then(function (_a) {
        var data = _a.data;
        Object.entries(tokens).forEach(function (_a) {
            var key = _a[0];
            if (key in data)
                tokens[key] = tokens[key] / data[key];
        });
        PrintPortfolioValues(options);
    })["catch"](function (error) {
        console.error(error);
    });
};
var PrintPortfolioValues = function (options) {
    console.log("Printing Portfolio Values In ".concat(exchangeCurrency));
    if (options.inputToken !== undefined && options.inputToken !== '')
        console.log(options.inputToken, tokens[options.inputToken]);
    else
        console.log(tokens);
};
InitializeApp();
