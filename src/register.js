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


document.querySelector("form").addEventListener("submit", async function(e) {
  // Check input validation
  if (!this.checkValidity()) {
    // Let the browser handle invalid form
    return;
  }

  e.preventDefault();
  let name = document.getElementById("register-name").value;
  let email = document.getElementById("register-email").value;
  let password = document.getElementById("register-password").value;
  let userID = document.getElementById("register-userID").value;


  // Check any similar userID and email;
  for (const [key, values] of Object.entries(dbData["user"])) {
    if (key == userID){
      alert("This whispID is already taken. Try a different one");
      this.reset();
      return;
    }
    if (values["email"]==email){
      alert("An account with this email already exists");
      this.reset();
      return;
    }
  }
  try {
    // Create new user into the database
    await set(ref(db,"user/" + userID),
    {
      chat:{0:""},
      description:"",
      displayName:name,
      email:email,
      friends:{0:""},
      password:password
    });
    alert("Registration success");
  
    // Refreshes the variable dbData to now database (!!always refresh after using set!!)
    dbRef = ref(db);
    dbSnapshot = await get(dbRef);
    dbData = dbSnapshot.val();

    window.location.href = "index.html";
  } catch (error) {
    console.error("Error during registration", error);
  }
})

document.getElementById("login").addEventListener("click", function(e){
  e.preventDefault();
  window.location.href = "index.html";
})

// Make password visible/hidden
const togglePasswordButton = document.querySelector('#toggle-password');
const eyeClosed = document.querySelector('#closed-eye');
const eyeOpened = document.querySelector('#opened-eye');
const passwordElement = document.querySelector('#login-password');
let isPasswordVisible = false;

togglePasswordButton.addEventListener("click", function(e) {
    e.preventDefault();

    if (isPasswordVisible) {
        // Hide the password
        passwordElement.type = 'password';
        eyeClosed.classList.remove('hide');
        eyeOpened.classList.add('hide');
    } else {
        // Show the password
        passwordElement.type = 'text';
        eyeClosed.classList.add('hide');
        eyeOpened.classList.remove('hide');
    }
    
    isPasswordVisible = !isPasswordVisible;
});
