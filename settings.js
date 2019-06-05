const mysql = require('mysql');

const pool = mysql.createPool({
    port : 33060,
    host : 'localhost',
    user : 'homestead',
    password: 'secret',
    database: 'homestead'
});

module.exports = {
    'mysql' : pool,

    // mosca settings https://github.com/mcollina/mosca/wiki/Mosca-advanced-usage
    mosca : {
        port : 1884,
        id : 'MRIPTA',
        stats : true,
        logger : {
            level: 'info'
        }
    },

    // mongo settings
    mongo : {
        url : '',
        db  : '',
        col : ''
    }

};