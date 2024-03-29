//35.173.180.61:3000
const pagination=document.getElementById('pagination')

const show=document.getElementsByClassName('mydownload')
function addNewExpense(e){
    e.preventDefault()
    const expenseDetails={
        expenseamount:e.target.expenseamount.value,
        description:e.target.description.value,
        category:e.target.category.value

    }
    console.log(expenseDetails)
    const token=localStorage.getItem('token')
    axios.post("http://35.173.180.61:3000/expense/addexpense",expenseDetails,{headers:{"Authorization":token}})
    .then(response=>{
        console.log(response)
        if(response.status === 201){
            addNewExpensetoUI(response.data.expense)
        }

    }).catch(err=>{
        showError(err)
    })

}
function showLeaderboard(){
    const inputElement=document.createElement("input")
    inputElement.type="button"
    inputElement.value="Show Leaderboard"
    inputElement.onclick=async()=>{
        const token=localStorage.getItem('token')
        const page =1;
        const userLeaderBoardArray=await axios.get(`http://35.173.180.61:3000/premium/showLeaderBoard`,{headers:{"Authorization":token}})
        console.log(userLeaderBoardArray)

        var LeaderboardElem=document.getElementById("leaderboard")
        LeaderboardElem.innerHTML +='<h1>Leader Board</h1>'
        userLeaderBoardArray.data.
        forEach((userDetails)=>{
            LeaderboardElem.innerHTML +=`<li>Name-${userDetails.name} TOtal Expense-${userDetails.total_cost || 0}`
        })
       
    }
    document.getElementById("message").appendChild(inputElement)
    
}



function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
function showPremiumusermessage(){
    document.getElementById('rzp-button').style.visibility="hidden";
    document.getElementById('message').innerHTML="you are a premium user";
    

}
window.addEventListener("DOMContentLoaded",()=>{
    const page=1;
    const token=localStorage.getItem('token')
    const decodeToken=parseJwt(token)
    console.log(decodeToken)
    const ispremiumuser=decodeToken.ispremiumuser
    if(ispremiumuser){
        showPremiumusermessage()
        showLeaderboard()
        
    }
    
    axios.get(`http://35.173.180.61:3000/expense/getexpenses?page=${page}`,{headers:{"Authorization":token}}).then(response =>{
        console.log(response)
        response.data.expenses.forEach(expense=>{
            addNewExpensetoUI(expense)
        })
        showPagination(response.data.pagination)
    })
})
function showPagination({
    currentPage,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    lastpage
}){
    pagination.innerHTML="";
    if(hasPreviousPage){
        const btn2=document.createElement('button')
        btn2.innerHTML=previousPage
        btn2.addEventListener('click',()=>getExpenses(previousPage))
        pagination.appendChild(btn2)
    }
    const btn1=document.createElement('button')
    btn1.innerHTML=`<h3>${currentPage}</h3>`
    btn1.addEventListener('click',()=>getExpenses(currentPage))
    pagination.appendChild(btn1)
    if(hasNextPage){
        const btn3=document.createElement('button')
        btn3.innerHTML=nextPage
        btn3.addEventListener('click',()=>getExpenses(nextPage))
        pagination.appendChild(btn3)
    }
}
function getExpenses(page){
    const token=localStorage.getItem('token')
    axios.get(`http://35.173.180.61:3000/expense/getexpenses?page=${page}`,{headers:{"Authorization":token}})
    .then(response=>{
        response.data.expenses.forEach(expense=>{
            addNewExpensetoUI(expense)
            
        })
        showPagination(response.data.pagination)

        
    })
}
function addNewExpensetoUI(expense){
    const parentElement=document.getElementById('listofExpenses')
    const expenseElemId=`expense-${expense.id}`;
    parentElement.innerHTML +=`<li id=${expenseElemId}>
    ${expense.expenseamount} - ${expense.category} - ${expense.description}
    <button onClick='deleteExpense(event,${expense.id})'>Delete Expense</button>
    </li>`
}
function download(){
    const token=localStorage.getItem('token')
    axios.get('http://35.173.180.61:3000/user/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileURL;
            a.download = 'myexpense.txt';
            a.click();
        } else {
            console.log("Something went wrong")
        }
  
    })
    .catch((err) => {
        console.log(err);
    });
}


function deleteExpense(e,expenseid){
    const token=localStorage.getItem('token')
    axios.delete(`http://35.173.180.61:3000/expense/deleteexpense/${expenseid}`,{headers:{"Authorization":token}}).then(()=>{
        console.log(expenseid)
        removeExpensefromUI(expenseid)

    })
    .catch((err=>{
        showError(err)
    }))
}
function removeExpensefromUI(expenseid){
    const expenseElemId=`expense-${expenseid}`
    document.getElementById(expenseElemId).remove()
}
function showError(err){
    document.body.innerHTML+=`<div style="color:red;">${err}</div>`
}
document.getElementById('rzp-button').onclick=async function(e){
    const token=localStorage.getItem('token');
    const response= await axios.get('http://35.173.180.61:3000/purchase/premiummembership',{headers:{"Authorization":token}})
    console.log(response)
    var options=
    {
        "key":response.data.key_id,
        "order_id":response.data.order.id,
        // handler use for success payment
        "handler":async function(response){
           const res= await axios.post('http://35.173.180.61:3000/purchase/updatetransactionstatus',{
                order_id:options.order_id,
                payment_id:response.razorpay_payment_id,
            },{headers:{"Authorization":token}})
            console.log(res)

            alert('You are a premium user Now')
           
            document.getElementById('rzp-button').style.visibility="hidden";
            document.getElementById('message').innerHTML="you are a premium user";

            localStorage.setItem('token',res.data.token)
            showLeaderboard()
        }
    }
    const rzp1=new Razorpay(options);
    rzp1.open();
    e.preventDefault();
    rzp1.on('payment failed',function(response){
        console.log(response)
        alert('something went wrong')
    })

}