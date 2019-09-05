'use strict';
//operations on the TEST table 

// inserts 2 rows. 
module.exports.insert = async (bqClient) => {

    const datasetId = 'monitoring';
    const tableId = 'TEST';
    const rows = [{ id: 'PMS-55-002', time_local: '2019-09-09 02:00:17.0200' },
    { id: 'PMS-55-002', time_local: '2019-09-09 02:00:17.0201' }];

    // Insert data into a table
    await bqClient
        .dataset(datasetId)
        .table(tableId)
        .insert(rows);
    console.log(`Inserted ${rows.length} rows`);

}


// Queries a dataset.
module.exports.query = async (bqClient) => {

    // The SQL query to run
    const sqlQuery = `SELECT id
            FROM \`sundaya.monitoring.TEST\`
            WHERE time_local >= @start_time
            ORDER BY id DESC`;

    const options = {
        query: sqlQuery,
        location: 'asia-east1',                             // Location must match that of the dataset(s) referenced in the query.
        params: { start_time: '2019-02-08' },
    };

    // Run the query
    const [rows] = await bqClient.query(options);

    console.log('Rows:');
    rows.forEach(row => console.log(row));
}
