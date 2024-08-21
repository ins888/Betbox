var ref = firebase.database().ref("MyList");

const logoutItems = document.querySelectorAll(".logged-out");
const loginItems = document.querySelectorAll(".logged-in");

let setupUI = (user) => {
    if(user){
        loginItems.forEach((item) => (item.style.display = "inline-block"));
        logoutItems.forEach((item) => (item.style.display = "none"));
    } else{
        loginItems.forEach((item) => (item.style.display = "none"));
        logoutItems.forEach((item) => (item.style.display = "inline-block")); 
    }
}


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const usernameElement = document.getElementById('user-profile-name');
      console.log("User :", user);
      // The user is logged in
      const username = user.displayName;

      // Update the UI to show the username
      usernameElement.textContent = username;
    } 
});

// let readData = (snapshot) => {
//     const currentUser = firebase.auth().currentUser;
//         snapshot.forEach((data) => {
//             console.log(data.key)
//             var Uscore = data.val().Uscore;
//             var Uemail = data.val().email;
//             document.querySelector('#user-profile-name').innerHTML = `<p>${Uemail}(${Uscore})</p>`;

// });}