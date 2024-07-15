import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase,ref,set,get,onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

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
let dbData;
onValue(dbRef, (snapshot) =>{
  dbData = snapshot.val();
  let chatIdString;
  let chatIdHTML;
  for (const [key,chatId] of Object.entries(dbData["user"][currentUserId]["chat"])){
    if (key !== "0"){
        chatIdString = `<option value=${chatId}>${chatId}</option>`;
        chatIdHTML += chatIdString;
    }
  }
  document.getElementById("chatList").innerHTML = chatIdHTML;

  let selectedChat = document.getElementById("chatList").value;
  let chatString;
  let chatHTML = "";
  for (const [key, values] of Object.entries(dbData["chat"][selectedChat]["historyMessage"])) {
    if (key !== "0"){
        chatString = `<p>
        ${values["userID"]}:
        ${values["content"]}
        (${values["time"]})
        </p>`
        chatHTML += chatString;
    }
  }
  document.getElementById("history-message").innerHTML = chatHTML;
})

document.getElementById("chatList").addEventListener("click",function(e){
    e.preventDefault;
    let selectedChat = document.getElementById("chatList").value;
    let chatString;
    let chatHTML = "";
    for (const [key, values] of Object.entries(dbData["chat"][selectedChat]["historyMessage"])) {
        if (key !== "0"){
            chatString = `<p>
            ${values["userID"]}:
            ${values["content"]}
            (${values["time"]})
            </p>`
            chatHTML += chatString;
        }
    }
    document.getElementById("history-message").innerHTML = chatHTML;
})


let currentUserId = window.localStorage.getItem("currentUserId");
document.getElementById("test").innerText = `current user ID = ${currentUserId}`;

document.getElementById("logout").addEventListener("click",function(e){
    e.preventDefault;
    window.localStorage.clear();
    window.location = "index.html";
})

document.getElementById("addFriend").addEventListener("click",function(e){
    e.preventDefault;
    window.location = "addFriend.html";
})

document.getElementById("resetFriend").addEventListener("click",function(e){
    e.preventDefault;
    for (const [key, values] of Object.entries(dbData["user"])) {
        set(ref(db,"user/"+key+"/"+"friends"),
            {0:""}
        )
        set(ref(db,"user/"+key+"/"+"chat"),
            {0:""}
        )
    }
})
document.getElementById("message").addEventListener('keypress', async function(e){
    if (e.key === 'Enter'){
        const text = document.getElementById("message").value;
        const selectedChat = document.getElementById("chatList").value;
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}`;
        let count = dbData["chat"][selectedChat]["historyMessage"].length;
        await set(ref(db,"chat/"+selectedChat+"/"+"historyMessage/"+count),
            {
                "userID": currentUserId,
                "content":text,
                "time": time
            }
        )
        document.getElementById("message").value = "";
    }
})