import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
const firebaseConfig = {
  apiKey: "AIzaSyCoqUqxHqiB7eEk2kX9TZsD2o23tmxTUHY",
  authDomain: "whispy-chat-app.firebaseapp.com",
  databaseURL: "https://whispy-chat-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "whispy-chat-app",
  storageBucket: "whispy-chat-app.appspot.com",
  messagingSenderId: "737310304673",
  appId: "1:737310304673:web:8524cf053e26927a9c83e0",
  measurementId: "G-EW5WHVNL7T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js"

import { getDatabase, ref, set, child, get, update, remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js"
const realdb = getDatabase();

var files = []
var reader = new FileReader();

var namebox = document.getElementById('namebox');
var extlab = document.getElementById('extlab');
var myimg = document.getElementById('myimg');
var proglab = document.getElementById('upprogress');
var SelBtn = document.getElementById('selbtn');
var UpBtn = document.getElementById('upbtn');
var DownBtn = document.getElementById('downbtn');


// Mengubah kotak nama file dan menambahkan extension sesuai file
var input = document.createElement('input');
input.type = 'file';
input.onchange = e =>{
  files = e.target.files;

  var extension = GetFileExt(files[0]);
  var name = GetFileName(files[0]);

  namebox.value = name;
  extlab.innerHTML = extension;

  reader.readAsDataURL(files[0]);
}

// Menampilkan image di layar
reader.onload = function(){
  myimg.src = reader.result;
}


// Select
SelBtn.onclick = function(){
  input.click();
}

// Dapetin extension file
function GetFileExt(file) {
  var temp = file.name.split('.');
  var ext = temp.slice((temp.length-1),(temp.length))
  console.log(ext)
  return '.' + ext[0]
}

// Dapetin nama file (tanpa extension)
function GetFileName(file) {
  var temp = file.name.split(".");
  var fname = temp.slice(0,-1).join('.') ;
  return fname;
}

// Upload to storage
async function UploadProcess() {
  var ImgToUpload = files[0];

  var ImgName = namebox.value + extlab.innerHTML;

  if(!ValidateName()){
    alert('name cannot contain ".", "#", "$", "[", "]"');
    return;
  }

  const metaData ={
    contentType:ImgToUpload.type
  }

  const storage = getStorage();

  const storageRef = sRef(storage, "images/"+ImgName);

  const UploadTask = uploadBytesResumable(storageRef, ImgToUpload, metaData);

  UploadTask.on('state-changed', (snapshot)=>{
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes)*100;
    proglab.innerHTML = "Upload "+ progress + "%"; 
  },
(error) =>{
  alert("error: image not uploaded!");
},

()=>{
  getDownloadURL(UploadTask.snapshot.ref).then((downloadURL)=>{
    SaveURLtoRealtimeDB(downloadURL);
  })
}
);
}


// Upload nama dan URL image ke realtime DB
function SaveURLtoRealtimeDB(URL){
var name = namebox.value;
var ext = extlab.innerHTML;

set(ref(realdb,"ImagesLinks/"+name),{
  ImageName: (name+ext),
  ImgUrl: URL
});
}

// Dapetin URL dari realtime DB
function GetURLfromRealtimeDB(){
var name = namebox.value
var dbref = ref(realdb)

get(child(dbref, "ImagesLinks/"+name)).then((snapshot)=>{
  if (snapshot.exists()){
    myimg.src = snapshot.val().ImgUrl;
  }
})
}

// Ngecek kalau nama filenya valid atau tidak
function ValidateName(){
var regex = /[\.#$\[\]]/
return !(regex.test(namebox.value));
}


UpBtn.onclick = UploadProcess;
DownBtn.onclick = GetURLfromRealtimeDB;