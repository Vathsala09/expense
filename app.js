
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
var cors = require('cors')
const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');

const resetPasswordRoutes = require('./routes/resetpassword')
const userRoutes = require('./routes/user')
const expenseRoutes = require('./routes/expense')
const purchaseRoutes = require('./routes/purchase')
const premiumFeatureRoutes = require('./routes/premiumFeature')

const app = express();
app.use(cors());
app.use(express.json())

app.use('/user', userRoutes)
app.use('/expense', expenseRoutes)
app.use('/purchase', purchaseRoutes)
app.use('/premium', premiumFeatureRoutes)
app.use('/password', resetPasswordRoutes);
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

app.use((req,res)=>{
    console.log('urlll',req.url)
    res.sendFile(path.join(__dirname,`public/${req.url}`))
})


sequelize.sync()
    .then(() => {
       
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })








