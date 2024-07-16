import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase,ref,set,get } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoqUqxHqiB7eEk2kX9TZsD2s23tmxTUHY",
  authDomain: "whispy-chat-app.firebaseapp.com",
  databaseURL:
    "https://whispy-chat-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "whispy-chat-app",
  storageBucket: "whispy-chat-app.appspot.com",
  messagingSenderId: "737310304673",
  appId: "1:737310304673:web:8524cf053e26927a9c83e0",
  measurementId: "G-EW5WHVNL7T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// declare dbData variable as datatype=object
let dbRef = ref(db);
let dbSnapshot = get(dbRef);
let dbData;
dbSnapshot.then((Snapshot) => {
  dbData = Snapshot.val();
});

document.getElementById("login-submit").addEventListener("click",function(e){
    //var declaration
    e.preventDefault();
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;
    //checks if input is null
    if (email==""||password==""){
        alert("Invalid input");
        return false;
      } 
    //searchs every user
    for (const [key, values] of Object.entries(dbData["user"])) {
        if (values["email"]==email){
            if (values["password"]==password){
                alert("login successful");
                window.localStorage.setItem("currentUserId",key)
                window.location = "test.html";
                return false;
            }
            else{
                alert("wrong password");
            }
        }
    }
    alert("email is not register");
    return false;
})

document.getElementById("register").addEventListener("click",function(e){
    e.preventDefault();
    window.location.href = "register.html";
})

document.getElementById("login").addEventListener("click",function(e){
  e.preventDefault();
  window.location.href = "test.html";
})

const togglePasswordButton = document.querySelector('#toggle-password');
const eyeClosed = document.querySelector('#closed-eye');
const eyeOpened = document.querySelector('#opened-eye');