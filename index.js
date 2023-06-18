const app=require('express')();
const {postProduct}=require('./Routes/postProduct.route')
var bodyParser = require('body-parser')
app.use(bodyParser.json())

// *ROUTES*

app.use('/',postProduct)

app.listen(9160,()=>{

    console.log("Server is running..🚀")
});