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

// declare variable
let selectedChat;
let chatArr;
let dbRef = ref(db);
let dbSnapshot = get(dbRef);
let dbData;
let unreadChat;
let currentUserId = window.localStorage.getItem("currentUserId");
document.getElementById("test").innerText = `current user ID = ${currentUserId}`;

//Initialize the first look (This part doesnt refresh on new item being added in database historyMessage)
dbSnapshot.then((Snapshot) => {
    dbData = Snapshot.val();
    //Creates the chat list that this user have, then render it on the option list
    chatArr = dbData["user"][currentUserId]["chat"];
    selectedChat = chatArr[chatArr.length-1];
    unreadChat = dbData["user"][currentUserId]["unreadChat"];
    renderHistoryMessage();
    console.log(chatArr);
    let chatIdString;
    let chatIdHTML = "";
    for(let i=chatArr.length-1;i>0;i--){
        chatIdString = `<button id="chat-${i}">${chatArr[i]} (${unreadChat[chatArr[i]]})</button><br>`;
        chatIdHTML += chatIdString;
    }
    document.getElementById("chatList").innerHTML = chatIdHTML;

    //Picks the selected chat, then render the history chat of the selected chat
    for(let i=chatArr.length-1;i>0;i--){
        document.getElementById(`chat-${i}`).addEventListener("click",function(e){
            e.preventDefault;
            console.log(`chat-${i}: ${chatArr[i]}`)
            selectedChat = chatArr[i];
            renderHistoryMessage();
        })
    }
    });

//Refreshes the historychat everytime new item/child is added in database (historyMessage)
onValue(dbRef, (snapshot) =>{
    dbData = snapshot.val();
    renderHistoryMessage();
    chatArr = dbData["user"][currentUserId]["chat"];
    unreadChat = dbData["user"][currentUserId]["unreadChat"];
    let chatIdString;
    let chatIdHTML = "";
    for(let i=chatArr.length-1;i>0;i--){
        chatIdString = `<button id="chat-${i}">${chatArr[i]} (${unreadChat[chatArr[i]]})</button><br>`;
        chatIdHTML += chatIdString;
    }
    document.getElementById("chatList").innerHTML = chatIdHTML;
    for(let i=chatArr.length-1;i>0;i--){
        document.getElementById(`chat-${i}`).addEventListener("click",function(e){
            e.preventDefault;
            console.log(`chat-${i}: ${chatArr[i]}`)
            selectedChat = chatArr[i];
            renderHistoryMessage();
        })
    }
})

//log out and clears currentUsedID value in localstorage
document.getElementById("logout").addEventListener("click",function(e){
    e.preventDefault;
    window.localStorage.clear();
    window.location = "index.html";
})

//change page to addfriend
document.getElementById("addFriend").addEventListener("click",function(e){
    e.preventDefault;
    window.location = "addFriend.html";
})

//change page to addGroupChat
document.getElementById("addGroupChat").addEventListener("click",function(e){
    e.preventDefault;
    window.location = "addGroupChat.html";
})

// Dont press this unless u want to reset the friends all users have to zero
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

//Everytime 'enter' is pressed in message input text, new item (the value of input text) is added to historyMessage, this triggers onValue function above to refresh the rendering of historyMessage
document.getElementById("message").addEventListener('keypress', function(e){
    if (e.key === 'Enter'){
        const text = document.getElementById("message").value;
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}`;
        let count = dbData["chat"][selectedChat]["historyMessage"].length;
        set(ref(db,"chat/"+selectedChat+"/"+"historyMessage/"+count),
            {
                "userID": currentUserId,
                "content":text,
                "time": time
            }
        )
        document.getElementById("message").value = "";
        const memberArr = dbData["chat"][selectedChat]["member"]
        let userChatArr;
        let index;
        let unreadChatCount;
        for (let i=1;i<memberArr.length;i++){
            userChatArr = dbData["user"][memberArr[i]]["chat"];
            index = userChatArr.indexOf(selectedChat);
            userChatArr.splice(index,1);
            userChatArr.push(selectedChat);
            set(ref(db,"user/" + memberArr[i] + "/chat"),userChatArr);
            if (memberArr[i] !== currentUserId) {
                unreadChatCount = dbData["user" ][memberArr[i]]["unreadChat"][selectedChat];
                console.log(unreadChatCount);
                unreadChatCount += 1;
                set(ref(db,"user/" + memberArr[i] + "/unreadChat/" + selectedChat),unreadChatCount);
            }
        }
    }
})

function renderHistoryMessage(){
    let chatString;
    let chatHTML = "";
    const historyArr = dbData["chat"][selectedChat]["historyMessage"];
    for(let i=historyArr.length-1;i>0;i--){
        chatString = `<p>
        ${historyArr[i]["userID"]}:
        ${historyArr[i]["content"]}
        (${historyArr[i]["time"]})
        </p>`
        chatHTML += chatString;
    }
    document.getElementById("history-message").innerHTML = chatHTML;
    set(ref(db,"user/" + currentUserId + "/unreadChat/" + selectedChat),0);
}