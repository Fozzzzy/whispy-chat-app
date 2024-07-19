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
let selectedChat; // to know which chat is being selected currently by the user
let chatArr; // stores all the chats that this user have with position (order)
let dbRef = ref(db);
let dbSnapshot = get(dbRef);
let dbData; //sets the database as an object variable
let unreadChat; // stores all the chats that this user have as the KEY and number of unread messages as the VALUE
let currentUserId = window.localStorage.getItem("currentUserId"); // get the currentUserId set by login.js
document.getElementById("test").innerText = `current user ID = ${currentUserId}`;

//on start...
dbSnapshot.then((Snapshot) => {
    dbData = Snapshot.val();
    chatArr = dbData["user"][currentUserId]["chat"];
    selectedChat = chatArr[chatArr.length-1];
    renderHistoryMessage();
    renderChatList();
    });

//everytime database is refreshed...
onValue(dbRef, (snapshot) =>{
    dbData = snapshot.val();
    const chatLength = dbData["chat"][selectedChat]["historyMessage"].length;
    //sets the last message that current user sends read by status to true
    set(ref(db,"chat/" + selectedChat + "/historyMessage/" + (chatLength-1) + "/readBy/" + currentUserId),true);
    //refreshes history message and chatlist
    renderHistoryMessage();
    renderChatList();
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
        set(ref(db,"user/"+key+"/"+"unreadChat"),
            null
        )
    }
})

//Everytime 'enter' is pressed in message input text....
document.getElementById("message").addEventListener('keypress', function(e){
    if (e.key === 'Enter'){
        const text = document.getElementById("message").value;
        const date = new Date();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        let count = dbData["chat"][selectedChat]["historyMessage"].length;
        //create new message and put it into database
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
        // for every member in the selected chat
        for (let i=1;i<memberArr.length;i++){ 
            userChatArr = dbData["user"][memberArr[i]]["chat"];
            index = userChatArr.indexOf(selectedChat);
            userChatArr.splice(index,1);
            userChatArr.push(selectedChat);
            // rearange the position of current member's chat list with selected chat on the top
            set(ref(db,"user/" + memberArr[i] + "/chat"),userChatArr);
            // set the message read by current member false (belum dibaca)
            set(ref(db,"chat/" + selectedChat + "/historyMessage/" + count + "/readBy/" + memberArr[i]),false);
            // except for current user id...
            if (memberArr[i] !== currentUserId) { //
                unreadChatCount = dbData["user" ][memberArr[i]]["unreadChat"][selectedChat];
                unreadChatCount += 1;
                //counts the sum of unread message by current member of the selected chat and put it to database
                set(ref(db,"user/" + memberArr[i] + "/unreadChat/" + selectedChat),unreadChatCount);
            }
        }
    }
})

function renderHistoryMessage(){
    //rendering to html....
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
    // after rendering of a chat, reset the unread message of the chat to 0, set read by status to all messages to true for current user
    const chatLength = dbData["chat"][selectedChat]["historyMessage"].length
    const unreadChatCount = dbData["user" ][currentUserId]["unreadChat"][selectedChat];
    for (let i=chatLength-1;i>chatLength-1-unreadChatCount;i--){
        set(ref(db,"chat/" + selectedChat + "/historyMessage/" + i + "/readBy/" + currentUserId),true);
    }
    set(ref(db,"user/" + currentUserId + "/unreadChat/" + selectedChat),0);
}

function renderChatList(){
    //rendering to html...
    chatArr = dbData["user"][currentUserId]["chat"];
    unreadChat = dbData["user"][currentUserId]["unreadChat"];
    let chatIdString;
    let chatIdHTML = "";
    for(let i=chatArr.length-1;i>0;i--){
        chatIdString = `<button id="chat-${i}">${chatArr[i]} (${unreadChat[chatArr[i]]})</button><br>`;
        chatIdHTML += chatIdString;
    }
    document.getElementById("chatList").innerHTML = chatIdHTML;
    //add a event listener for every button that is rendered. If clicked, the selectedChat value is set to the newest
    for(let i=chatArr.length-1;i>0;i--){
        document.getElementById(`chat-${i}`).addEventListener("click",function(e){
            e.preventDefault;
            selectedChat = chatArr[i];
            renderHistoryMessage();
        })
    }
}

$(document).ready(function() { //on document fully loaded..
    console.log("window is opened");
    set(ref(db,"user/" + currentUserId + "/isActive"),true);
    $(window).on('focus', function() { //detects if window is on focus
        console.log('Window is focused');
        set(ref(db,"user/" + currentUserId + "/isActive"),true);
    });
    $(window).on('blur', function() { //detects if window is on blur
        console.log('Window is blurred');
        set(ref(db,"user/" + currentUserId + "/isActive"),false);
    });
    $(window).on('beforeunload', function(e) { //detects if window is about to close
        set(ref(db,"user/" + currentUserId + "/isActive"),false);
    });
});