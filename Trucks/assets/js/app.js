

let number = 1;

function next() {

  number = number + 1;

  if (number > 6) {
    number = 1;
  }


  photo.src = `./img/img${number}.jpg`;

  caption.innerHTML = `Photo #${number}`
}