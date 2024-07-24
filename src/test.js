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
// document.getElementById("test").innerText = `current user ID = ${currentUserId}`;


//on start...
dbSnapshot.then((Snapshot) => {
    dbData = Snapshot.val();
    chatArr = dbData["user"][currentUserId]["chat"];
    selectedChat = chatArr[chatArr.length-1];
    renderTyping();
    renderHistoryMessage();
    renderChatList();
    });

//everytime database is refreshed...
onValue(dbRef, (snapshot) =>{
    dbData = snapshot.val();
    chatArr = dbData["user"][currentUserId]["chat"];
    const chatLength = dbData["chat"][selectedChat]["historyMessage"].length;
    
    //sets the last message that current user sends read by status to true
    set(ref(db,"chat/" + selectedChat + "/historyMessage/" + (chatLength-1) + "/readBy/" + currentUserId),true);


    //refreshes history message and chatlist
    renderHistoryMessage();
    renderChatList();
})

//isActive isTyping feat
set(ref(db,"user/" + currentUserId + "/isActive"),true);
document.getElementById("message").addEventListener('keyup', function(e){
    e.preventDefault();
    const text = document.getElementById("message").value;
    if (selectedChat !== "" && selectedChat !== undefined){
        set(ref(db,"chat/" + selectedChat + "/isTyping/" + currentUserId + "/content"),text);
    }
    updateStatusTyping(isTyping());
})

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        set(ref(db,"user/" + currentUserId + "/isActive"),true);
        updateStatusTyping(isTyping());
    } else {    
        set(ref(db,"user/" + currentUserId + "/isActive"),false);
        updateStatusTyping(false);
    }
  });

//log out and clears currentUsedID value in localstorage
document.getElementById("logout").addEventListener("click",function(e){
    e.preventDefault();
    updateStatusTyping(false);
    window.localStorage.clear();
    window.location = "index.html";
})

//change page to addfriend
document.getElementById("addFriend").addEventListener("click",function(e){
    e.preventDefault();
    updateStatusTyping(false);
    window.location = "addFriend.html";
})

//change page to addGroupChat
document.getElementById("addGroupChat").addEventListener("click",function(e){
    e.preventDefault();
    updateStatusTyping(false);
    window.location = "addGroupChat.html";
})

// Dont press this unless u want to reset the friends all users have to zero
// document.getElementById("resetFriend").addEventListener("click",function(e){
//     e.preventDefault();
//     for (const [key, values] of Object.entries(dbData["user"])) {
//         set(ref(db,"user/"+key+"/"+"friends"),
//             {0:""}
//         )
//         set(ref(db,"user/"+key+"/"+"chat"),
//             {0:""}
//         )
//         set(ref(db,"user/"+key+"/"+"unreadChat"),
//             null
//         )
//     }
// })

//Everytime key enter is pressed in message input text....
document.getElementById("message").addEventListener('keypress', function(e){
    if (e.key === 'Enter'){
        const text = document.getElementById("message").value;
        if (text == ""){
            return false;
        }
        const date = new Date();
        let hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        let period = "AM";

        if (hours >= 12) {
            period = "PM";
            if (hours > 12) {
                hours = hours - 12;
            }
        }

        if (hours === 0) {
            hours = 12;
        }

        const time = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;


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
        // set(ref(db,"chat/" + selectedChat + "/isTyping/" + currentUserId ),false);

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

// Function to render chat history message
function renderHistoryMessage(){
    renderMember()
    //rendering to html....
    let chatString;
    let chatHTML = "";
    let displayName;
    let messageClass;
    const historyArr = dbData["chat"][selectedChat]["historyMessage"];

    for(let i=historyArr.length-1;i>0;i--){
        const message = historyArr[i];
        
        // Check if message from current user or not
        if (message["userID"] == currentUserId) {
            messageClass = "message-sent";
        } else {
            messageClass = "message-received";
        }

        displayName = dbData["user"][historyArr[i]["userID"]]["displayName"]

        // Add to HTML
        chatString = `
        <div>
            <div class="${messageClass} message">
                <div class="mb-1 fw-bold">${displayName}</div>
                ${historyArr[i]["content"]}
                 <span class="message-time">${historyArr[i]["time"]}</span>
            </div>
        </div>
        `
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

// Function to render chat/friend list
function renderChatList(){
    //rendering to html...
    chatArr = dbData["user"][currentUserId]["chat"];
    unreadChat = dbData["user"][currentUserId]["unreadChat"];
    let chatIdString;
    let chatIdHTML = "";
    let groupName;

    for(let i=chatArr.length-1;i>0;i--){
        groupName = toGroupName(chatArr[i]);

        // Check chat selected
        let chatClass = ''
        if (selectedChat === chatArr[i]) {
            chatClass = 'chat-selected'; 
        }

        // Check unread messages
        let unreadCount = unreadChat[chatArr[i]] || 0;
        let unreadCountClass = unreadCount > 0 ? 'd-flex' : 'd-none';

        chatIdString = `
        <div class="friend-item d-flex align-items-center px-3 py-4 ${chatClass}" id="chat-${i}">
                <div class="rounded-circle bg-white me-3" style="min-width: 40px; height: 40px;"></div>
                <div class="d-flex flex-column">
                    <div class="group-name">${groupName}</div>
                </div>
                <div class="ms-auto">
                    <span class="unread-count ${unreadCountClass} align-items-center justify-content-center">${unreadChat[chatArr[i]]}</span>
                </div>
            </div>`;

        // left/Right Chat Float
        
        chatIdHTML += chatIdString;
    }
    document.getElementById("chatList").innerHTML = chatIdHTML;

    // Update chat header on initial open
    updateChatHeader()

    //add a event listener for every button that is rendered. If clicked, the selectedChat value is set to the newest
    for(let i=chatArr.length-1;i>0;i--){
        document.getElementById(`chat-${i}`).addEventListener("click",function(e){
            e.preventDefault();
            updateStatusTyping(false);
            selectedChat = chatArr[i];
            renderTyping();
            renderHistoryMessage();
            renderChatList();
            updateChatHeader();
        })
    }
}

// Function to update friend name header
function updateChatHeader() {
    let groupName = toGroupName(selectedChat);
    document.querySelector('.friend-name-header').innerText = groupName;
}

// Function to render typing status
function renderTyping(){
    document.getElementById("message").value = dbData["chat"][selectedChat]["isTyping"][currentUserId]["content"];
    updateStatusTyping(isTyping());
}
// every after render typing, key up event listener, and visibilityState = visible
function isTyping(){ 
    const text =  document.getElementById("message").value;
    if (text !== ""){
        return true
        } 
    else{
        return false
        }
}
// automatically sets to false when: visibilityState = not visible, change selected chat, and change window
function updateStatusTyping(bool){ 
    if (selectedChat === "" || selectedChat == undefined){
        return false
    }
    if (bool){
        set(ref(db,"chat/" + selectedChat + "/isTyping/" + currentUserId + "/status"),true)
    }
    else{
        set(ref(db,"chat/" + selectedChat + "/isTyping/" + currentUserId + "/status"),false)
    }
    renderMember();
}

function toGroupName(chatID){
    const memberArr = dbData["chat"][chatID]["member"];
    function checkName(currentName){
        return currentName !== currentUserId && currentName !== ""
    }
    let userIdArr = memberArr.filter(checkName);
    function toDisplayName(userID){
        return dbData["user"][userID]['displayName']
    }
    let nameArr = userIdArr.map(toDisplayName);
    let groupName = nameArr.join(", ");
    return groupName;
}



function renderMember(){
    const memberArr = dbData["chat"][selectedChat]["member"];
    function checkName(currentName){
        return currentName !== ""
    }
    let userIdArr = memberArr.filter(checkName);
    function toDisplayName(userID){
        return dbData["user"][userID]['displayName']
    }
    let nameArr = userIdArr.map(toDisplayName);
    let currentUser;
    let isActive;
    let isTyping;
    let memberString;
    let memberHTML = "";
    for (let i=0;i<nameArr.length;i++){
        currentUser = userIdArr[i];
        isActive = dbData["user"][currentUser]["isActive"];
        isTyping = dbData["chat"][selectedChat]["isTyping"][currentUser]["status"];
        memberString = `<p>${currentUser}, isActive: ${isActive}, isTyping: ${isTyping} </p>`
        memberHTML += memberString
    }
    document.getElementById("chatMember").innerHTML = memberHTML;
}
