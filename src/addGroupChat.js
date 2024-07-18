import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get,onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

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
const currentUserId = window.localStorage.getItem("currentUserId");

let friendArr;
let friendArrAdd = [''];
// declare dbData variable as datatype=object
let dbRef = ref(db);
let dbSnapshot = get(dbRef);
let dbData;
dbSnapshot.then((Snapshot) => {
    dbData = Snapshot.val();
    friendArr = (dbData["user"][currentUserId]["friends"]);
    console.log("friendArr: ", friendArr);
    console.log("friendArrAdd: ", friendArrAdd);
    renderFriendList();
    renderFriendAdd();
});

onValue(dbRef, (snapshot) =>{
  dbData = snapshot.val();
});
//Go back to message page
document.getElementById("goBack").addEventListener("click",function(e){
    e.preventDefault;
    window.location = "test.html";
})

//search filter algorithm
document.getElementById("searchFriend").addEventListener("keyup",function(e){
    e.preventDefault;
    var txtValue, a;
    const searchInput = document.getElementById("searchFriend").value;
    const filter = searchInput.toUpperCase();
    const ul = document.getElementById("friendList");
    const li = ul.getElementsByTagName('button');

    for (let i = 0; i < li.length; i++) {
        a = li[i];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
    }
})  
// idk how this works
async function renderFriendList(){
    let friendListString;
    let friendListHTML = "";
    for (let i = 1; i < friendArr.length;i++ ){
        friendListString = `<button id="friend-${i}">${(friendArr[i])}</button>`;
        friendListHTML += friendListString;
    }
    document.getElementById("friendList").innerHTML = friendListHTML;
    for (let i = 1; i < friendArr.length; i++){
      document.getElementById(`friend-${i}`).addEventListener('click',function(e){
        e.preventDefault;
        const userID = friendArr[i]; 
        friendArr.splice(i,1);
        friendArrAdd.push(userID);
        console.log("friendArr: ", friendArr);
        console.log("friendArrAdd: ", friendArrAdd);
        return renderFriendAdd(),renderFriendList();
      })
    }
}
// idk how this works too
async function renderFriendAdd(){
  let friendAddString;
  let friendAddHTML = "";
  for (let i = 1; i < friendArrAdd.length;i++ ){
      friendAddString = `<button id="friendAdd-${i}">${(friendArrAdd[i])}</button>`;
      friendAddHTML += friendAddString;
  }
  document.getElementById("friendAdd").innerHTML = friendAddHTML;
  for (let i = 1; i < friendArrAdd.length; i++){
    document.getElementById(`friendAdd-${i}`).addEventListener('click',function(e){
      e.preventDefault;
      const userID = friendArrAdd[i]; 
      friendArrAdd.splice(i,1);
      friendArr.push(userID);
      console.log("friendArr: ", friendArr);
      console.log("friendArrAdd: ", friendArrAdd);
      return renderFriendList(),renderFriendAdd();
    })
  }
}

document.getElementById("confirm").addEventListener("click", async function(e){
  e.preventDefault;
  if (friendArrAdd.length < 2){
    alert("you must choose at least 2 friends");
    return false;
  }
  let check;
  friendArrAdd.push(currentUserId);
  for (const [key, values] of Object.entries(dbData["user"][currentUserId]["chat"])) {
    if (key !== "0"){
      check = (dbData["chat"][values]['member']);
      console.log(check);
      console.log(friendArrAdd);
      console.log(isEqual(check,friendArrAdd))
      if(isEqual(check,friendArrAdd)){
        alert("chat already exist");
        friendArrAdd.splice(friendArrAdd.length-1,1);
        return false;
      }
    }
  }
  addChat(friendArrAdd);
  friendArrAdd.splice(friendArrAdd.length-1,1);
})

async function addChat(arr) {
  try {
      let chatID = "";
      for (let i=0;i<arr.length;i++){
        chatID += arr[i];
      }
      // Write new chat to db
      set(ref(db, `chat/${chatID}`),
          {
              member:arr,
              historyMessage:{0:{
                  userID:0,
                  content:0,
                  time:0
              }}
          }
      );
      let userIndex
      for (let i=1;i<arr.length;i++){
        console.log(arr[i]);
        userIndex = dbData["user"][arr[i]]["chat"].length;
        set(ref(db, `user/${arr[i]}/chat/${userIndex}`),chatID);
      }
      window.location = "test.html";
      
      return true;

  } catch (error) {
      // Check if error
      console.log(`${error}`);
  }
}


function isEqual(a, b)
{
    // check if the lengths are equal
    if (a.length !== b.length) {
        return false;
    }
    let map = new Map();
    for (let elem of a) {
        // increment the frequency of each element
        map.set(elem, (map.get(elem) || 0) + 1);
    }
    for (let elem of b){
        // if the element is not in the map, the arrays are not equal
        if (!map.has(elem)) {
            return false;
        }
        // decrement the frequency of each element
        map.set(elem, map.get(elem) - 1);
        // if the frequency becomes negative, the arrays are not equal
        if (map.get(elem) < 0) {
            return false;
        }
    }
    return true;
}