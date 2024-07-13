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


document.getElementById("register-submit").addEventListener("click",function(e){
  //var declaration
  e.preventDefault;
  let name = document.getElementById("register-name").value;
  let email = document.getElementById("register-email").value;
  let password = document.getElementById("register-password").value;
  let userID = document.getElementById("register-userID").value;
  //checks if input is null
  if (name==""||email==""||password==""||userID==""){
    alert("Invalid input");
    return false;
  } 
  //checks any similar userID and email;
  for (const [key, values] of Object.entries(dbData["user"])) {
    if (key == userID){
      alert("whispID has already been taken");
      return false;
    }
    if (values["email"]==email){
      alert("email has been registered");
      return false;
    }
  }
  //create new user into the database
  set(ref(db,"user/" + userID),
  {
    chat:{0:""},
    description:"",
    displayName:name,
    email:email,
    friends:{0:""},
    password:password
  });
  alert("Registration success");
  //refreshes the variable dbData to now database (!!always refresh after using set!!)
  dbRef = ref(db);
  dbSnapshot = get(dbRef);
  dbSnapshot.then((Snapshot) => {
    dbData = Snapshot.val();
  });
  //refresh the input value to null
  document.getElementById("register-name").value = "";
  document.getElementById("register-email").value = "";
  document.getElementById("register-password").value = "";
  document.getElementById("register-userID").value = "";
})

document.getElementById("login").addEventListener("click",function(e){
  e.preventDefault;
  window.location = "login.html";
})