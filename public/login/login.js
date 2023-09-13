function login(e) {
    e.preventDefault();
    console.log(e.target.name);

    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value

    }
    console.log(loginDetails)
    axios.post('http://35.173.180.61:3000/user/login',loginDetails).then(response => {
            alert(response.data.message)
            console.log(response.data)
            localStorage.setItem('token', response.data.token)
            window.location.href = "../ExpenseTracker/index.html"
    }).catch(err => {
        console.log(JSON.stringify(err))
        document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
    })
}
function forgotpassword() {
    window.location.href = "../ForgotPassword/index.html"
}