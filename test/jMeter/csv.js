const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        {id: 'wallet_address_1'},
        {id: 'wallet_address_2'}
    ]
});

let data = [
    {
        wallet_address_1: '4565464648745654646487456546464874565464648745654646487',
        wallet_address_2: '78965464648745654646487456546464874565464648745654646452'
    }
]


csvWriter
    .writeRecords(data)
    .then(()=> console.log('The CSV file was written successfully'));