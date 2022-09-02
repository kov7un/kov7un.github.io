let count = 0;
let secret = Math.random() * 100 + 1;
secret = Math.floor(secret);
console.log(secret);

function game() {

  let number = +numberInput.value;
  console.log(number);

  if (number == secret) {
    right.innerHTML = (`Вы угадали!!!`);

    function game() {
      window.location.reload();
    }
    setTimeout(game, 1500);

  } else if (secret > number) {
    more.innerHTML = (`Секрет число больше ${number}`);
    count++;
  } else {
    less.innerHTML = (`Секрет число меньше ${number}`);
    count++;
  }

  wrong.innerHTML = (`Попытка (${count}/10)`);

  if (count > 10) {
    wrong.innerHTML = (`Вы проиграли!!! Ответ был ${secret}`);

    function game() {
      window.location.reload();
    }
    setTimeout(game, 1500);
  }
}