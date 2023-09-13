const Expense = require('../models/expenses');
const AWS=require('aws-sdk')
const addexpense = (req, res) => {
    const { expenseamount, description, category } = req.body;

    if(expenseamount == undefined || expenseamount.length === 0 ){
        return res.status(400).json({success: false, message: 'Parameters missing'})
    }
    
    Expense.create({ expenseamount, description, category, userId: req.user.id}).then(expense => {
        return res.status(201).json({expense, success: true } );
    }).catch(err => {
        return res.status(500).json({success : false, error: err})
    })
}

const getexpenses = (req, res)=> {
    
    const page = +req.query.page || 1;
    const NUMBER_OF_EXPENSES_PER_PAGE=3;
    let total_items
    Expense.count({where:{userId:req.user.id}})
    .then((total)=>{
        total_items=total
        return Expense.findAll({where:{userId:req.user.id},offset:(page-1)*NUMBER_OF_EXPENSES_PER_PAGE,
        limit:NUMBER_OF_EXPENSES_PER_PAGE})
    })
   

    .then(expenses=>{
          const pagination={
            currentPage:page,
            hasNextPage:NUMBER_OF_EXPENSES_PER_PAGE *page<total_items,
            nextPage:page + 1,
            hasPreviousPage:page>1,
            previousPage:page-1,
            lastPage:Math.ceil(total_items/NUMBER_OF_EXPENSES_PER_PAGE),

        }
        res.status(200).json({expenses,pagination,success:true})
    })
    .catch(err=>{
        res.status(500).json({error:err,success:false})
    })
}

const deleteexpense = (req, res) => {
    const expenseid = req.params.expenseid;
    if(expenseid == undefined || expenseid.length === 0){
        return res.status(400).json({success: false, })
    }
    Expense.destroy({where: { id: expenseid, userId: req.user.id }}).then((noofrows) => {
        if(noofrows === 0){
            return res.status(404).json({success: false, message: 'Expense doenst belong to the user'})
        }
        return res.status(200).json({ success: true, message: "Deleted Successfuly"})
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ success: true, message: "Failed"})
    })
}


   
    
function uploadToS3(data,filename){
    const BUCKET_NAME=process.env.BUCKET_NAME
    const IAM_USER_KEY=process.env.IAM_USER_KEY
    const IAM_SECRET_KEY=process.env.IAM_USER_SECRET

    let s3bucket=new AWS.S3({
        accessKeyId:IAM_USER_KEY,
        secretAccessKey:IAM_SECRET_KEY,
        Bucket:BUCKET_NAME
    })

    
        var params={
            Bucket:BUCKET_NAME,
            Key:filename,
            Body:data,
            ACL:'public-read'
        }

        return new Promise((resolve,reject)=>{
            s3bucket.upload(params,(err,s3response)=>{
                if(err){
                    console.log("Something went wrong",err);
                    reject(err);
                }
                else{
                    console.log("SUCCESS",s3response);
                    resolve(s3response.Location);
                }
            })
        })
        

}
        
   
const downloadExpenses=async(req,res,next)=>{
  //  if(!req.user.ispremiumuser){
     //   return res.status(400).json({message:'only for premium user'})
   // }
    const expenses=await req.user.getExpenses();
    console.log("expenses=======>",expenses);
    const stringfiedExpenses=JSON.stringify(expenses);
    const userId=req.user.id;
    const filename=`Expense${userId}/${new Date()}.txt`;
    const fileURL=await uploadToS3(stringfiedExpenses,filename);
    res.status(200).json({fileURL, success:true})

    

}
module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadExpenses
}