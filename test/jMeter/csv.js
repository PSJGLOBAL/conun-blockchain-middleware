const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        {id: 'wallet_address'},
    ]
});

let data = [
    {
        wallet_address: '4565464648745654646487456546464874565464648745654646487',
    },
]


csvWriter
    .writeRecords(data)
    .then(()=> console.log('The CSV file was written successfully'));