const gameRef = firebase.database().ref("Game");
const popup = document.querySelector(".popup-box");
const winmessage = document.getElementById("message");
const modal = document.getElementById('win-modal');

let selectedButton = null;

var startAble = false;
var inGame = false;
var click = false;
var gameInfoData;
var ScoreData;
var alreadyplus = false;


let xTurn = "";
gameRef.child("game-1").child("Turn").on("value", snapshot => {
    const turn = snapshot.val();
    xTurn = turn === "x" ? "o" : "x";
});

const popupRef = firebase.database().ref("popup");

popupRef.set(false);
gameRef.child("game-1").child("winner").remove();

popupRef.on('value', (snapshot) => {
  const shouldShowPopup = snapshot.val();
  
  if (shouldShowPopup) {
    togglePopup();
  }
});

// Get the initial values of xCoins and oCoins from the database
let xCoins;
let oCoins;
gameRef.child('game-1').on('value', snapshot => {
    xCoins = snapshot.child('xCoins').val();
    oCoins = snapshot.child('oCoins').val();
    document.getElementById("x-coins").textContent = xCoins;
    document.getElementById("o-coins").textContent = oCoins;
});


var btnXO = document.querySelectorAll('.button-option');

btnXO.forEach((element, index) => {
    
    element.dataset.value = "";

    gameRef.child(`game-1/Price/${index}`).on('value', snapshot => {
        let price = snapshot.val();

        if(price === null){
            element.innerHTML = ``;
        }else{
            element.setAttribute('price', price);
            element.innerHTML = `$${price}`;
        }

    });
    
    element.addEventListener('click', (event) => {
        let minicheck  = xTurn === "x" ? "o" : "x";
        console.log(minicheck);

        const currentUser = firebase.auth().currentUser;
        if (inGame == true && event.currentTarget.dataset.value == "" && gameInfoData['Win'] == undefined && gameInfoData['Draw'] == undefined) {
            if (gameInfoData[`user-${gameInfoData['Turn']}-email`] == currentUser.email) {
                click = true;
                gameRef.child("game-1").update({
                    ["Click"]: click,
                    ["Place"]: event.currentTarget.id,
                });

                popupRef.set(true);

                const price = parseInt(element.getAttribute('price'));

                if (minicheck == 'x') {
                    xCoins -= price;
                    document.getElementById("x-coins").textContent = xCoins;
                    gameRef.child('game-1').update({
                        xCoins: xCoins
                    });
                    console.log(`remove $${price} from X`)
                } else if(minicheck == 'o'){
                    oCoins -= price;
                    document.getElementById("o-coins").textContent = oCoins;
                    gameRef.child('game-1').update({
                        oCoins: oCoins
                    });
                    console.log(`remove $${price} from O`)
                }

                console.log(event.currentTarget.id);
            }
            console.log(event.currentTarget.id);
        }


        console.log(xTurn);
    });
});

// HT minigames
let coin = document.querySelector(".coin");
let pickH = document.querySelector("#pick-heads");
let pickT = document.querySelector("#pick-tails");
let playerpick = null;

pickH.addEventListener("click", () => {
  playerpick = true;
  pickH.disabled = true;
  pickT.disabled = true;
  startspin();
});

pickT.addEventListener("click", () => {
  playerpick = false;
  pickH.disabled = true;
  pickT.disabled = true;
  startspin();
});

function startspin() {

  let i = Math.floor(Math.random() * 2);
  coin.style.animation = "none";
  console.log(i);

  gameRef.child("game-1").update({
    playerpick: playerpick,
    spinner: true,
    HTresult: i
  });

  // Add event listener for playerpick
  gameRef.child("game-1/playerpick").on("value", (snapshot) => {
    playerpick = snapshot.val();
  });

  // Add event listener for spinner
  gameRef.child("game-1/spinner").on("value", (snapshot) => {
    const spinner = snapshot.val();
    if (spinner === false) {
      gameRef.child("game-1/HTeq").once("value", (snapshot) => {
        const HTeq = snapshot.val();
        checkWinner(playerpick, HTeq);
      });
    }
  });

  if (i) {
    setTimeout(function () {
      coin.style.animation = "spin-heads 3s forwards";
      gameRef.child("game-1").update({
        HTeq: true
      });
    }, 100);
  } else {
    setTimeout(function () {
      coin.style.animation = "spin-tails 3s forwards";
      gameRef.child("game-1").update({
        HTeq: false
      });
    }, 100);
  }
}

// Add event listener for HTresult
gameRef.child("game-1/HTeq").on("value", (snapshot) => {
  const HTeq = snapshot.val();
  if (HTeq !== null) {
    coin.style.animation = HTeq ? "spin-heads 3s forwards" : "spin-tails 3s forwards";
    closepopup();
  }

});

// Add event listener for HTeq
gameRef.child("game-1/HTeq").on("value", (snapshot) => {
  const HTeq = snapshot.val();
  if (HTeq !== null) {
    gameRef.child("game-1").update({
      spinner: false
    });
  }
});
  
function checkWinner(playerpick, result) {
    if (playerpick === result) {
      console.log(playerpick + " wins");
      console.log(gameInfoData['Turn']);
      if(playerpick === false && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'x'
        });
      }else if(playerpick === false && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner:'o'
        });
      }else if(playerpick === true && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'x'
        });
      }else if(playerpick === true && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner: 'o'
        });
      }
    } else {
      console.log(result + " wins");
      console.log(gameInfoData['Turn']);
      if(playerpick === false && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'o'
        });
      }else if(playerpick === false && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner:'x'
        });
      }else if(playerpick === true && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'o'
        });
      }else if(playerpick === true && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner: 'x'
        });
      }
    }
}



// dice minigames
const dice = document.querySelector(".dice");
const even = document.getElementById('evenEvent');
const odd = document.getElementById('oddEvent');
let numDice = 0;
let playerAns = '';

odd.addEventListener('click', () =>{
    playerAns = false;
    odd.disabled = true;
    even.disabled = true;
    rollDice();
});

even.addEventListener('click', () =>{
    playerAns = true;
    odd.disabled = true;
    even.disabled = true;
    rollDice();
});

function rollDice(){
    const random = Math.floor(Math.random() * 6) + 1;
    //dice.style.animation = 'rolling 3s';
    dice.style.animation = 'none';
    console.log(random);

    gameRef.child("game-1").update({
      playerAns: playerAns,
      roll: true,
      numDice: random
    });

    // Add event listener for playerAns
    gameRef.child("game-1/playerAns").on("value", (snapshot) => {
      playerAns = snapshot.val();
    });

    // Add event listener for roll
    gameRef.child("game-1/roll").on("value", (snapshot) => {
      const roll = snapshot.val();
      if (roll === false) {
        gameRef.child("game-1/RDeq").once("value", (snapshot) => {
          const RDeq = snapshot.val();
          checkRolldice(RDeq, playerAns);
        });
      }
    });
    if (random) {
      dice.style.animation = 'rolling 3s';
      setTimeout(() => {
        switch (random) {
            case 1:
                dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
                gameRef.child("game-1").update({
                  RDeq: false
                });
                break;

            case 6:
                dice.style.transform = 'rotateX(180deg) rotateY(0deg)';
                gameRef.child("game-1").update({
                  RDeq: true
                });
                break;

            case 2:
                dice.style.transform = 'rotateX(-90deg) rotateY(0deg)';
                gameRef.child("game-1").update({
                  RDeq: true
                });
                break;

            case 5:
                dice.style.transform = 'rotateX(90deg) rotateY(0deg)';
                gameRef.child("game-1").update({
                  RDeq: false
                });
                break;

            case 3:
                dice.style.transform = 'rotateX(0deg) rotateY(90deg)';
                gameRef.child("game-1").update({
                  RDeq: false
                });
                break;

            case 4:
                dice.style.transform = 'rotateX(0deg) rotateY(-90deg)';
                gameRef.child("game-1").update({
                  RDeq: true
                });
                break;

            default:
                break;
        }
      });
    }
 
}

// Add event listener for numDice
gameRef.child("game-1/numDice").on("value", (snapshot) => {
  const numDice = snapshot.val();
  if (numDice != null) {
      dice.style.animation = 'rolling 3s';
      switch (numDice) {
          case 1:
              dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
              break;
          case 6:
              dice.style.transform = 'rotateX(180deg) rotateY(0deg)';
              break;
          case 2:
              dice.style.transform = 'rotateX(-90deg) rotateY(0deg)';
              break;
          case 5:
              dice.style.transform = 'rotateX(90deg) rotateY(0deg)';
              break;
          case 3:
              dice.style.transform = 'rotateX(0deg) rotateY(90deg)';
              break;
          case 4:
              dice.style.transform = 'rotateX(0deg) rotateY(-90deg)';
              break;
          default:
              break;
      }
  closepopup();
  }
  
});

// Add event listener for RDeq
gameRef.child("game-1/RDeq").on("value", (snapshot) => {
  const RDeq = snapshot.val();
  if (RDeq !== null) {
    gameRef.child("game-1").update({
      roll: false
    });
  }
});
function checkRolldice(RDeq, playerAns){
    console.log(`playerAns ${playerAns}`);
    console.log(`RDeq ${RDeq}`);
    console.log(`gameInfoData ${gameInfoData['numDice']}`);

    if (playerAns === RDeq) {
      console.log(playerAns + " wins");
      console.log(gameInfoData['Turn']);
      if(playerAns === false && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'x'
        });
      }else if(playerAns === false && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner:'o'
        });
      }else if(playerAns === true && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'x'
        });
      }else if(playerAns === true && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner: 'o'
        });
      }
    } else {
      console.log(RDeq + " wins");
      console.log(gameInfoData['Turn']);
      if(playerAns === false && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'o'
        });
      }else if(playerAns === false && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner:'x'
        });
      }else if(playerAns === true && gameInfoData['Turn'] == 'x'){
        gameRef.child("game-1").update({
          minigameWinner: 'o'
        });
      }else if(playerAns === true && gameInfoData['Turn'] == 'o'){
        gameRef.child("game-1").update({
          minigameWinner: 'x'
        });
      }
    }
}
// Button Block

function disableButton() {
    const currentUser = firebase.auth().currentUser;
    if (gameInfoData && gameInfoData[`user-${gameInfoData['Turn']}-email`] == currentUser.email) {
        pickH.disabled = false;
        pickT.disabled = false;
        odd.disabled = false;
        even.disabled = false;
    }else{
        pickH.disabled = true;
        pickT.disabled = true;
        odd.disabled = true;
        even.disabled = true;
    }
}
// Closepopup when minigame play

function closepopup(){

    setTimeout(function(){
        popup.classList.remove("open");
        popupRef.set(false);
    },5750);

}

const btnJoins = document.querySelectorAll(".btn-join");
btnJoins.forEach((btnJoin) => btnJoin.addEventListener("click", joinGame));

function joinGame(event){
    const currentUser = firebase.auth().currentUser;
    console.log("[Join] Current user", currentUser);            
    if (currentUser) {
        const btnJoinID = event.currentTarget.getAttribute("id");
        const player = btnJoinID[btnJoinID.length-1];

        const playerForm = document.getElementById(`inputPlayer-${player}`);
        if (playerForm.value == "") {
            // Add player into database
            let tmpID = `user-${player}-id`;
            let tmpEmail= `user-${player}-email`
            gameRef.child("game-1").update({
                [tmpID]: currentUser.uid,
                [tmpEmail]: currentUser.email
            });
            console.log(currentUser.email + " added.");
            event.currentTarget.disabled = true;
        }
    }
}

gameRef.on("value", (snapshot) => {
    getGameInfo(snapshot);
})

function getGameInfo(snapshot) {
    const currentUser = firebase.auth().currentUser;
    document.getElementById("inputPlayer-x").value = "";
    document.getElementById("inputPlayer-o").value = "";

    snapshot.forEach((data) => {
        const gameInfo = data.val();
        gameInfoData = gameInfo;
        Object.keys(gameInfo).forEach((key) => {
            switch (key) {
                // ถ้ากด Join บทบาท X แล้วปุ่ม Join ของบทบาท O จะ disable
                case "user-x-email":
                    if (gameInfo['user-x-email'] == currentUser.email) {
                        document.getElementById("inputPlayer-x").value = gameInfo[key];
                        document.querySelector("#btnJoin-x").disabled = true;
                        document.querySelector("#btnJoin-o").disabled = true;
                        
                    } else if (gameInfo['user-x-email'] != currentUser.email) {
                        document.getElementById("inputPlayer-x").value = gameInfo[key];
                        if (document.getElementById("inputPlayer-x").value != ""){
                            document.querySelector("#btnJoin-x").disabled = true;
                        }
                    }
                    break;
                // ถ้ากด Join บทบาท O แล้วปุ่ม Join ของบทบาท X จะ disable
                case "user-o-email":

                    if (gameInfo['user-o-email'] == currentUser.email) {
                        document.getElementById("inputPlayer-o").value = gameInfo[key];
                        document.querySelector("#btnJoin-o").disabled = true;
                        document.querySelector("#btnJoin-x").disabled = true;
                        
                    } else if (gameInfo['user-o-email'] != currentUser.email) {
                        document.getElementById("inputPlayer-o").value = gameInfo[key];
                        if (document.getElementById("inputPlayer-o").value != ""){
                            document.querySelector("#btnJoin-o").disabled = true;
                        }
                    }
                    break;
                case "inGameUpdate":
                    inGame = true;
            }
        })
    })
    if(gameInfoData){
        click = gameInfoData['Click'];
    }
    if (document.getElementById("inputPlayer-o").value == "" && (currentUser.email != document.getElementById("inputPlayer-x").value)){
        document.querySelector("#btnJoin-o").disabled = false;
    }
    if (document.getElementById("inputPlayer-x").value == "" && (currentUser.email != document.getElementById("inputPlayer-o").value)){
        document.querySelector("#btnJoin-x").disabled = false;
    }
    // Game status เมื่อกดเข้ามาครบแล้ว 2 คน แต่ยังไม่กดเล่น
    if (document.getElementById("inputPlayer-x").value != "" && document.getElementById("inputPlayer-o").value != ""){
        startAble = true;
        document.getElementById("wait-play").innerText = "Click START GAME";
    }
    else {
        startAble = false;
        btnStartGame.disabled = true;
        document.getElementById("wait-play").innerText = "Waiting for players...";
    }
    if (inGame == true){
        btnCancelJoins.forEach((btnCancel) => btnCancel.disabled = true);
        btnStartGame.disabled = true;
    } 
    if (gameInfoData && gameInfoData['inGameUpdate'] == undefined && document.getElementById("inputPlayer-x").value != "" && document.getElementById("inputPlayer-o").value != "") {
        inGame = false;
        btnCancelJoins.forEach((btnCancel) => btnCancel.disabled = false);
        btnStartGame.disabled = false;        
        btnXO.forEach((element) => element.innerText = "");
    }
    // status บอกผู้เล่นคนไหนจะกดเล่นได้
    if(gameInfoData && gameInfoData['Turn'] != undefined){
        document.getElementById("wait-play").innerText = `Turn: ${gameInfoData['Turn'].toUpperCase()}`;
    }
    // ดึงค่า X หรือ O จากสถานะลงตาราง
    if(gameInfoData && gameInfoData['Place'] != undefined && gameInfoData['minigameWinner'] != undefined){
            console.log(gameInfoData['minigameWinner']);
            if(click == true && (gameInfoData['Win'] == undefined &&  gameInfoData['Draw'] == undefined)){
                console.log(gameInfoData['minigameWinner']);
            document.getElementById(`${gameInfoData['Place']}`).innerText = `${gameInfoData['minigameWinner']}`;
            document.getElementById(`${gameInfoData['Place']}`).dataset.value  = `${gameInfoData['minigameWinner']}`;
            document.getElementById(`${gameInfoData['Place']}`).disabled = 'true';
            click = false;
            gameRef.child("game-1").update({
                ["Click"]: click
            });
                if(gameInfoData['Turn'] == "x"){
                    gameRef.child("game-1").update({
                        ["Turn"]: "o",
                        minigameWinner: null,
                    });
                    
                } else if(gameInfoData['Turn'] == "o") {
                    gameRef.child("game-1").update({
                        ["Turn"]: "x",
                        minigameWinner: null,
                    });
                    
                }
                console.log(gameInfoData['minigameWinner']);
                winCheck();
            }
    }


    // Check status who Win or Draw
    if(gameInfoData && gameInfoData['Win'] == true){
      
        // Display winner modal
        setTimeout(function(){
          modal.classList.remove('hidden');
          modal.classList.add('block');
          console.log('have winner')
          gameRef.child("game-1").update({
            ["winner"]: xTurn,
        });
          if(xTurn == "x"){
            document.getElementById("playerwinner").innerText = `Winner: ${xTurn}`;
          } else{
            document.getElementById("playerwinner").innerText = `Winner: ${xTurn}`;
          }
        }, 6000);
    }
      
    if(gameInfoData && gameInfoData['Draw'] == true){
        if(gameInfoData['xCoin'] > gameInfoData['oCoin']){
            xTurn = 'x';
        }else if(gameInfoData['oCoin'] > gameInfoData['xCoin']){
            xTurn = 'o';
        }
        gameRef.child("game-1").update({
            ["winner"]: xTurn,
            ["Win"]: true,
            ["Draw"]: null
        });
        setTimeout(function(){
            modal.classList.remove('hidden');
            modal.classList.add('block');
            console.log('have winner')
            if(xTurn == "x"){
              document.getElementById("playerwinner").innerText = `Winner: ${xTurn}`;
            } else{
              document.getElementById("playerwinner").innerText = `Winner: ${xTurn}`;
            }
          }, 6000);
    }   
    
    addScoreXO();
    if(gameInfoData && gameInfoData['AlreadyPlus'] != undefined){
        alreadyplus = false;
    }
}

let addScoreXO = () => {
    const currentUser = firebase.auth().currentUser;
    const leaderboardRef = firebase.database().ref('leaderboard');
    const uid = currentUser.uid;
  
    // Add Score
    if (gameInfoData && gameInfoData['Win'] == true && alreadyplus == false) {
      leaderboardRef.child(uid).transaction((userData) => {
        if (!userData) {
          userData = { score: 0, win: 0, lose: 0 };
        }
        if(gameInfoData['winner'] == 'x'){
          if(currentUser.email == gameInfoData[`user-x-email`]){
            userData.score += 100;
            userData.win += 1;
            alreadyplus = true;
          }
          if(currentUser.email == gameInfoData[`user-o-email`]){
            if(userData.score < 0){
              userData.score *= 0;
              userData.lose += 1;
              alreadyplus = true;
            }
            else{
              userData.score -= 50;
              userData.lose += 1;
              alreadyplus = true;
            }
          }
        } else if(gameInfoData['winner'] == 'o'){
          if(currentUser.email == gameInfoData[`user-o-email`]){
            userData.score += 100;
            userData.win += 1;
            alreadyplus = true;
          }
          if(currentUser.email == gameInfoData[`user-x-email`]){
            if(userData.score < 0){
              userData.score *= 0;
              userData.lose += 1;
              alreadyplus = true;
            }
            else{
              userData.score -= 50;
              userData.lose += 1;
              alreadyplus = true;
            }
          }
        }
        return userData;
      }, (error, committed, snapshot) => {
        if (error) {
          console.log('Transaction failed abnormally!', error);
        } else if (!committed) {
          console.log('No data was committed.');
        } else {
          console.log('Score added successfully!');
        }
      });
    } else {
      console.log('No winner or already added score');
    }
  };
  
const btnCancelJoins = document.querySelectorAll(".btn-cancel-join-game");
btnCancelJoins.forEach((btnCancel) => btnCancel.addEventListener("click", cancelJoin));

function cancelJoin(event) {
    const currentUser = firebase.auth().currentUser;
    console.log("[Cancel] Current user:", currentUser);
    if (currentUser) {
        const btnCancelID = event.currentTarget.getAttribute("id");
        const player = btnCancelID[btnCancelID.length-1];

        const playerForm = document.getElementById(`inputPlayer-${player}`);
        if (playerForm.value && playerForm.value === currentUser.email){
            // Delete Player into database
            let tmpID = `user-${player}-id`;
            let tmpEmail = `user-${player}-email`;

            document.querySelector(`#btnJoin-${player}`).disabled = false;

            if (player == "x"){
                document.querySelector(`#btnJoin-o`).disabled = false;
            } else {
                document.querySelector(`#btnJoin-x`).disabled = false;
            }

            gameRef.child("game-1").child(tmpID).remove();
            gameRef.child("game-1").child(tmpEmail).remove();
            console.log(`delete on id: ${currentUser.uid}`);
        }
    }
}


const btnStartGame = document.querySelector("#btnStartGame");
btnStartGame.addEventListener("click", startGame)

function startGame() {
    if (startAble == true){
        inGame = true;
        console.log(inGame);
        gameRef.child('game-1').update({
            ["inGameUpdate"]: true,
            ["Turn"]: "x",
            xCoins: 3500,
            oCoins: 3500,
        });

        btnXO.forEach((element, index) => {
            let price = Math.floor(Math.random() * 3) * 200 + 100;
            gameRef.child(`game-1/Price/${index}`).set(price)
            .then(() => {
                element.setAttribute('price', price);
                element.innerHTML = `$${price}`;
            });
        });
    } else {
        alert("need players.")
    }
}

let condition = [
    [0, 1, 2],
    [0, 3, 6],
    [2, 5, 8],
    [6, 7, 8],
    [3, 4, 5],
    [1, 4, 7],
    [0, 4, 8],
    [2, 4, 6],
];

// let x play first

const winCheck = () => {
    for (let i of condition) {
      let [element1, element2, element3] = [
        btnXO[i[0]].dataset.value,
        btnXO[i[1]].dataset.value,
        btnXO[i[2]].dataset.value
      ];
        if (element1 != "" && element2 != "" && element3 != "") {
            if (element1 == element2 && element2 == element3) {
                if(element1 == 'x'){
                    xTurn = 'x';
                }else if(element1 == 'o'){
                    xTurn = 'o';
                }
                gameRef.child("game-1").update({
                    ["Win"]: true
                });
            }
            else if((gameInfoData['oCoin'] <= 0) || (gameInfoData['xCoin'] <= 0)){
                gameRef.child("game-1").update({
                    ["Draw"]: true
                });
            }
        }
    }
  }


// Function to toggle the popup
// Get references to the game elements
const diceGame = document.querySelector('.diceGame');
const coinGame = document.querySelector('.HTGame');

// Define an array of games
const games = [diceGame, coinGame];

// Function to toggle the popup
function togglePopup() {
  disableButton();
  popup.classList.toggle('open');
  gameRef.child("game-1").update({
    playerAns: null,
    roll: null,
    numDice: null,
    minigameWinner: null,
    RDeq: null,
    playerpick: null,
    spinner: null,
    HTresult: null,
    HTeq: null,
    randomGame: Math.floor(Math.random() * games.length)
  });
}

// Listen for changes to the game data in the database
gameRef.child("game-1").on("value", function(snapshot) {
  const gameInfoData = snapshot.val();
  if(gameInfoData && gameInfoData['randomGame'] === 0){
    diceGame.style.display = 'block';
    coinGame.style.display = 'none';
  } else if(gameInfoData && gameInfoData['randomGame'] === 1){
    coinGame.style.display = 'block';
    diceGame.style.display = 'none';
  }
});


const leavebtn = document.querySelector("#leave-btn");
leavebtn.addEventListener('click', endGame);

const playagainbtn = document.querySelector("#playagain-btn");
playagainbtn.addEventListener('click', endGame);

const backtoindex = document.querySelector("#logoback");
backtoindex.addEventListener('click', endGame);
function endGame() {
    modal.classList.add('hidden');
    modal.classList.remove('block');
    inGame = false;
    location.reload(true);
    gameRef.child("game-1").child("Click").remove();
    gameRef.child("game-1").child("inGameUpdate").remove();
    gameRef.child("game-1").child("Turn").remove();
    gameRef.child("game-1").child("Place").remove();
    gameRef.child("game-1").child("Win").remove();
    gameRef.child("game-1").child("Draw").remove();
    gameRef.child("game-1").child("HTeq").remove();
    gameRef.child("game-1").child("HTresult").remove();
    gameRef.child("game-1").child("oCoins").remove();
    gameRef.child("game-1").child("xCoins").remove();
    gameRef.child("game-1").child("Price").remove();
    gameRef.child("game-1").child("spinner").remove();
    gameRef.child("game-1").child("playerpick").remove();
    gameRef.child("game-1").child("user-o-email").remove();
    gameRef.child("game-1").child("user-x-email").remove();
    gameRef.child("game-1").child("user-o-id").remove();
    gameRef.child("game-1").child("user-x-id").remove();
    gameRef.child("game-1").child("winner").remove();
    gameRef.child("game-1").child("numDice").remove();
    gameRef.child("game-1").child("RDeq").remove();
    gameRef.child("game-1").child("minigamWinner").remove();
    gameRef.child("game-1").child("playerAns").remove();
    gameRef.child("game-1").child("roll").remove();
    gameRef.child("game-1").child("randomGame").remove();
    gameRef.child("game-1").child("Rage").remove();
    gameRef.child("game-1").update({
        ["AlreadyPlus"]: true
    });
    gameRef.child("game-1").child("AlreadyPlus").remove();
}

function RageQuit(){
  const currentUser = firebase.auth().currentUser;
  if (gameInfoData[`user-${gameInfoData['Turn']}-email`] == currentUser.email) {
    gameRef.child("game-1").update({
      Rage: true
    });
  }
}

let addRageScore = () => {
  const currentUser = firebase.auth().currentUser;
  const leaderboardRef = firebase.database().ref('leaderboard');
  const uid = currentUser.uid;

  // Add Score
  if (gameInfoData['Rage'] == true) {
    leaderboardRef.child(uid).transaction((userData) => {
      if (!userData) {
        userData = { score: 0, win: 0, lose: 0 };
      }
      if(gameInfoData['winner'] == 'x'){
        if(currentUser.email == gameInfoData[`user-x-email`]){
          userData.score += 100;
          userData.win += 1;
          alreadyplus = true;
        }
        if(currentUser.email == gameInfoData[`user-o-email`]){
          if(userData.score < 0){
            userData.score *= 0;
            userData.lose += 1;
            alreadyplus = true;
          }
          else{
            userData.score -= 50;
            userData.lose += 1;
            alreadyplus = true;
          }
        }
      } else if(gameInfoData['winner'] == 'o'){
        if(currentUser.email == gameInfoData[`user-o-email`]){
          userData.score += 100;
          userData.win += 1;
          alreadyplus = true;
        }
        if(currentUser.email == gameInfoData[`user-x-email`]){
          if(userData.score < 0){
            userData.score *= 0;
            userData.lose += 1;
            alreadyplus = true;
          }
          else{
            userData.score -= 50;
            userData.lose += 1;
            alreadyplus = true;
          }
        }
      }
      return userData;
    }, (error, committed, snapshot) => {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      } else if (!committed) {
        console.log('No data was committed.');
      } else {
        console.log('Score added successfully!');
      }
    });
  } else {
    console.log('No winner or already added score');
  }
};