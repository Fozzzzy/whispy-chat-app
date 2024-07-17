import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

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

// Receive Inputs from Add Friend DOM
const form = document.querySelector('#add-friend-form');
const addFriendInput = document.querySelector('#add-friend-input');
// const addFriendButton = document.querySelector('#add-friend-btn');
let currentUserId = window.localStorage.getItem("currentUserId");
console.log(`Current User ID: ${currentUserId}`);


// Add friend button
form.addEventListener('submit', async function (e) {
    const friendId = addFriendInput.value;
    if (!friendId) {
        alert("Please enter friend's WhispyID")
    }
    e.preventDefault()

    // Check addFriend function return true or not
    let result = await addFriend(currentUserId, friendId);
    form.reset();
    if (result === true) {
        alert("Friend successfully added");
    } else {
        alert("Friend not added");
    }
})

// Function to check if user(or friend) ID exists
async function checkUserExists(userId) {
    const userRef = ref(db, `user/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists();
}

// Function to add friend
async function addFriend(currentUserId, friendId) {
    try {
        // Check if friend userID exists in db
        const friendExists = await checkUserExists(friendId);
        if (!friendExists||currentUserId == friendId) {
            alert("Friend user does not exist");
            return false;
        }

        // Check if friend already added
        const currentUserFriendsRef = ref(db, `user/${currentUserId}/friends`);
        const currentUserFriendsSnapshot = await get(currentUserFriendsRef);
        const currentUserFriends = currentUserFriendsSnapshot.val() || {};

        if (currentUserFriends[friendId]) {
            console.log(this);
            alert("Already friends with this user");
            return false;
        }   
        // Create an index for current user and friend user
        const currentUserFriendIndex = currentUserFriends.length;
        const friendIndex = dbData["user"][friendId]["friends"].length;
        // Write friendID to db
        await set(ref(db, `user/${currentUserId}/friends/${currentUserFriendIndex}`), friendId);
        await set(ref(db, `user/${friendId}/friends/${friendIndex}`), currentUserId);
        let result = await addChat(currentUserId, friendId);
        //Update the var dbData
        dbRef = ref(db);
        dbSnapshot = get(dbRef);
        dbSnapshot.then((Snapshot) => {
            dbData = Snapshot.val();
            });
        return true;

    } catch (error) {
        // Check if error
        console.log(`${error}`);
    }
}

//Instantly adds a chat between user and friend
async function addChat(currentUserId, friendId) {
    try {
        const chatID = currentUserId + friendId;
        // Write new chat to db
        await set(ref(db, `chat/${chatID}`),
            {
                member:{0:"",1:currentUserId,2:friendId},
                historyMessage:{0:{
                    userID:0,
                    content:0,
                    time:0
                }}
            }
        );
        const userIndex = dbData["user"][currentUserId]["chat"].length;
        const friendIndex = dbData["user"][friendId]["chat"].length;
        await set(ref(db, `user/${currentUserId}/chat/${userIndex}`),chatID);
        await set(ref(db, `user/${friendId}/chat/${friendIndex}`),chatID);
        //Update the var dbData
        dbRef = ref(db);
        dbSnapshot = get(dbRef);
        dbSnapshot.then((Snapshot) => {
            dbData = Snapshot.val();
            });
        return true;

    } catch (error) {
        // Check if error
        console.log(`${error}`);
    }
}

//Go back to message page
document.getElementById("goBack").addEventListener("click",function(e){
    e.preventDefault;
    window.location = "test.html";
})

