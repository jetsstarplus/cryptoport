const fs = require('node:fs');
const csv = require('fast-csv')
const readlineSync = require('readline-sync');
import axios, {AxiosResponse} from 'axios';

const CSVPath = "C://transactions.csv";
let apiUrl = 'https://min-api.cryptocompare.com/data/price'
let exchangeCurrency = 'USD'
let tokens = {
    /*
        ETH: 200,
        BTH: 10
    */
}

type tokenType = {
    timestamp: string,
    transaction_type: string,
    token: string,
    amount: string
}

type optionsType  = {
    inputToken?: string,
    inputDate?: string
}


const InitializeApp = () => {
    console.log('Welcome To Your Portfolio Value Calculator,\nYou can add the filters below')
    let inputToken = readlineSync.question('Filter Token: ').toUpperCase()
    let inputDate = readlineSync.question('Filter Date: ')

    ProcessCSV({inputToken, inputDate})
}

const ProcessCSV = (options:optionsType) => {
    const stream = fs.createReadStream(CSVPath);
    
    stream.pipe(csv.parse({headers: true}))
    .on('error', (error:Error) => console.error(error))
    .on('data', (token:tokenType) => {
        if (tokens[token.token] === undefined)
            tokens[token.token] = 0;

        if(options.inputDate !== undefined && options.inputDate !== ''){
            const transDate = new Date(parseInt(token['timestamp'])*1000).toLocaleDateString()
            const inputDate = new Date(options.inputDate).toLocaleDateString()
            if(transDate === inputDate)
                CalculateDebitCreditValue(token)
        } else
        CalculateDebitCreditValue(token)
    })
    .on('end', () => {        
        SetAmountToExchanged(options)
    })
}

const CalculateDebitCreditValue = (token:tokenType) => {
    if(token['transaction_type'] === 'DEPOSIT')
        tokens[token.token] += parseFloat(token.amount)
    else
        tokens[token.token] -+ parseFloat(token.amount)
}

const SetAmountToExchanged = (options:optionsType) => {
    let tokenKeys = ''
    
    Object.entries(tokens).forEach(([key]) => {
        tokenKeys += ','+key
    })        

    axios.get(apiUrl, {
        params:{
            fsym:exchangeCurrency,
            tsyms: tokenKeys
        }
    }).then(({data}:AxiosResponse) => {

        Object.entries(tokens).forEach(([key]) => {            
            if(key in data)
                tokens[key] = tokens[key] / data[key]
        })

        PrintPortfolioValues(options)

    }).catch((error:Error) =>{
        console.error(error)
    })
}

const PrintPortfolioValues = (options:optionsType) => {
    console.log(`Printing Portfolio Values In ${exchangeCurrency}`)
    if(options.inputToken !== undefined && options.inputToken !== '')
        console.log(options.inputToken, tokens[options.inputToken])
    else
        console.log(tokens)
}

InitializeApp()
