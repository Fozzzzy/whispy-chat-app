let currentUserId = window.localStorage.getItem("currentUserId");
document.getElementById("test").innerText = `current user ID = ${currentUserId}`;

document.getElementById("logout").addEventListener("click",function(e){
    e.preventDefault;
    window.location = "login.html";
})
