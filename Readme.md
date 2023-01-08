# CRYPTO TOKEN PORTFOLIO VALUE CALCULATOR
## Propine Programming Question
I wrote this program in typescript and had some scripts to compile and build it into a Javascript file that I run.

I also tried to write in a maintanable and to be able to scale regardless of which crypto token is used or added.
### 1. Import Dependencies
I imported the modules that I'm going to use
```
const fs = require('node:fs');
const csv = require('fast-csv')
const readlineSync = require('readline-sync');
import axios, {AxiosResponse} from 'axios';
```
* `fs` is node.js module for manipulating files, It will be used for opening the CSV file.

* `csv` is an installed module that provides a simple API for manipulating csv files.

* `readlineSync` is a command line module that I will use to Get user Input of the filter parameters interactively.

* `axios` is a module that I used for getting the exchange rates from cryptocompare'S API

### 2. Define Constant/Global Variables
```
const CSVPath = "C://transactions.csv";
let apiUrl = 'https://min-api.cryptocompare.com/data/price'
let exchangeCurrency = 'USD'
let tokens = {
/*
    ETH: 200,
    BTH: 10
*/
    }
}
```


### 2. Define Typescript Types
```
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
```
`tokenType` is the type for the tokens that are read from the csv file
`optionsType` represents the parameters that will be passed to the processing function

### 3. Get User Input and Initialize App.
```
const InitializeApp = () => {
    console.log('Welcome To Your Portfolio Value Calculator,\nYou can add the filters below')
    let inputToken = readlineSync.question('Filter Token: ').toUpperCase()
    let inputDate = readlineSync.question('Filter Date: ')

    ProcessCSV({inputToken, inputDate})
}
```
Here take a non mandatory input of the filter token and date from the user.
I then called `ProcessCSV` function.

### 4. Process the CSV file.
```
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
                CalculateValue(token)
        } else
            CalculateValue(token)
    })
    .on('end', () => {        
        SetAmountToExchanged(options)
    })
}
```
In the above function, I first defined a `stream` using `fs.createReadStream` module with the CSV File as the argument.
I the used the Pipe with `csv.parse` which returns a promise that allows me to read each line of the csv file.
I then pass a callback function to  then `on('data')` Event where the read lines are returned from.

I then have a condition to check if the current token is in the `tokens` global variable that I initialized Earlier and add it if the condition passes.
I then check if the `inputDate` parameter is blank or undefined

* if TRUE, I filter out the records whose transaction date(`transDate`) is not equal to the `inputDate` and call the `CalculateDebitCreditValue` function with the token as the parameter for matching transaction date record.

* If FALSE, then I just directly call the `CalculateDebitCreditValue` Function with the token as the parameter whose purpose is explained below.

### 5. Calculate Debit Credit from the amount
```
const CalculateDebitCreditValue = (token:tokenType) => {
    if(token['transaction_type'] === 'DEPOSIT')
        tokens[token.token] += parseFloat(token.amount)
    else
        tokens[token.token] -+ parseFloat(token.amount)
}
```
The `CalculateDebitCreditValue` function which takes the token as a parameter, adds or substracts the amount to the `tokens` value depending on the transaction type.

### 6. Convert the Tokens Values to USD

I had already defined `exchangeCurrency = 'USD'` at the beginning. So this can be changed to any other currency, such can even come from an API on an ENV.

The below function will fetch the exchange rate of all the tokens in our `tokens` object and convert the value to that of the `exchangeCurrency`.
```
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
```
We first create a string of the token keys joined with a comma `,` as shown below.
```
let tokenKeys = ''    
Object.entries(tokens).forEach(([key]) => {
    tokenKeys += ','+key
})        
```
The `tokenKeys` is then passed as a parameter to axios as `tsyms` and `exchangeCurrency` as `fsym`.

The resulting Example URL Would then be
```
https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=BTC,ETH,XTC
```
The response of the api would be an object with the crypto tokens as the keys.
I then just map the `tokens` object and convert the tokens values with the exchange rate received.

After that I call the `PrintPortfolioValues` Function thats responsible for printing the results.
```
Object.entries(tokens).forEach(([key]) => {            
    if(key in data)
        tokens[key] = tokens[key] / data[key]
    })

PrintPortfolioValues(options)
```

### 7. Print the Result.
```
const PrintPortfolioValues = (options:optionsType) => {
    console.log(`Printing Portfolio Values In ${exchangeCurrency}`)
    if(options.inputToken !== undefined && options.inputToken !== '')
        console.log(options.inputToken, tokens[options.inputToken])
    else
        console.log(tokens)
}
```
This function will check if there is an `inputToken`.
* If theres an input token, then it will filter the results to only those of that token.
* If theres is none, then it will print all the tokens with their values.

## Results
### 1. Without any parameter
![No parameters](./images/no_parameters.png)
### 2. With token only as a parameter
FILTER `token = ETH`

![Token parameter = ETH](./images/token_parameter.png)
### 3. With date only as a parameter
FILTER `date = 10/25/2019`

![Date parameter = 10/25/2019](./images/date_parameter.png)
### 4. With token and date as parameters

FILTER `token = BTC, date = 10/25/2019`

![Both token and Date Parameter](./images/all_parameters.png)