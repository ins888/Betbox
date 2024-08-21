
firebase.auth().onAuthStateChanged((user) => {
  // if (user) {
  //   const usernameElement = document.getElementById('user-profile-name');
  //   console.log("User :", user);
  //   // The user is logged in
  //   const username = user.displayName;

  //   // Update the UI to show the username
  //   usernameElement.textContent = username;
  // } 
  // else {
  //     console.log("Unaviable User.")
  // }
  setupUI(user);
});


const loginForm = document.querySelector('#login-form');
const loginModal = document.querySelector('#login-modal');
const registerModal = document.querySelector('#register-modal');
const registerForm = document.querySelector('#register-form');
const registerEmailInput = document.querySelector('#input-email-signup');
const registerUsernameInput = document.querySelector('#input-username-signup');
const registerPasswordInput = document.querySelector('#input-password-signup');
const confirmPasswordInput = document.querySelector('#confirm-password');

loginForm.addEventListener('submit', (e) => {
e.preventDefault()
const email = loginForm.email.value;
const password = loginForm.password.value;


firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // User is signed in
    const user = userCredential.user;
    console.log('User is signed in:', user);
    
    // Hide the login modal and its parent
    loginModal.classList.add('hidden');
    loginForm.reset();
  })
  .catch((error) => {
    // Handle errors
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
    console.log('Error:', errorCode, errorMessage);
    loginForm.reset();
  })
  .finally(() => {
    document.querySelector("div[modal-backdrop]").remove()
  });
});

firebase.auth().onAuthStateChanged((user) => {
if (user) {
  // User is logged in
  console.log('User is logged in');
  console.log('Username:', user.displayName);
  loginModal.classList.add('hidden');
} else {
  // User is logged out
  console.log('User is logged out');
}
});


const logoutButton = document.querySelector('#btnLogout');
logoutButton.addEventListener('click', (e) => {
e.preventDefault();
firebase.auth().signOut()
  .then(() => {
    // User is signed out
    console.log('User is signed out');
  })
  .catch((error) => {
    // Handle errors
    console.log('Error:', error);
  });
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = registerEmailInput.value;
  const username = registerUsernameInput.value;
  const password = registerPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  if (password !== confirmPassword) {
    alert('Passwords do not match');
  }
  console.log(email, username, password, confirmPassword);
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User is registered and logged in
      console.log('User is registered and logged in');
      const user = userCredential.user;
      return user.updateProfile({
        displayName: username // Add username to the user's profile
      }).then(() => {
        // Add the user's display name to the leaderboard node in the database
        const leaderboardRef = firebase.database().ref('leaderboard');
        const userData = {
          name: user.displayName,
          win: 0,
          lose: 0,
          score: 0
        };
        leaderboardRef.child(user.uid).set(userData);
      });
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      console.log('Error:', errorCode, errorMessage);
      registerForm.reset();
    });
});
