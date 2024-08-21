const leaderRef = firebase.database().ref('leaderboard');
const user = firebase.auth().currentUser;

if (user) {
  leaderRef.child(user.uid).update({
    name: user.displayName
  });
}

let displayLeaderboard = () => {
  leaderRef.once("value").then((snapshot) => {
    let rank = 1;
    const data = [];
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      data.push(childData);
    });

    data.sort((a, b) => b.score - a.score);

    const leaderboard = document.querySelector('#leaderboard tbody');
    leaderboard.innerHTML = '';

    data.forEach((item) => {
      const row = document.createElement('tr');
      const rankCell = document.createElement('td');
      const nameCell = document.createElement('td');
      const winrateCell = document.createElement('td');
      const scoreCell = document.createElement('td');
      rankCell.textContent = rank++;
      nameCell.textContent = item.name;
      winrateCell.textContent = `${item.win} / ${item.lose}`;
      scoreCell.textContent = item.score;

      row.className += `font-medium text-gray-900 backdrop-blur-md bg-white/10`;
      rankCell.className += `sm:px-8 px-4 py-2  sm:py-3 text-blue-900`;
      nameCell.className += `sm:px-8 px-4 py-2  sm:py-3 text-blue-900`;
      winrateCell.className += `sm:px-8 px-4 py-2  sm:py-3 text-blue-900`;
      scoreCell.className += `sm:px-8 px-4 py-2  sm:py-3 text-blue-900`;

      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(winrateCell);
      row.appendChild(scoreCell);
      leaderboard.appendChild(row);
    });
  });
};

displayLeaderboard();
