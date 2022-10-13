const mongoose = require("mongoose")

const connectDatabse = () => {
    mongoose.connect(process.env.DB_LOCAL_URL)
        .then(con => {
            console.log(`Database is connected with HOST: ${con.connection.host}`);
        }).catch(err => {
            console.log(err);
        })
}

module.exports = connectDatabse

