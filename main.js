var set = false;
var direction = 1; 
var dimension = 8;
var piece = {
  selected: {
    x: -1,
    y: -1
  },
  location: {
    x: -1,
    y: -1
  }
};

function init() {
  let square = (window.innerHeight > window.innerWidth) ? window.innerWidth : window.innerHeight;
  let other = (window.innerHeight < window.innerWidth) ? 0 : window.innerHeight;
  square -= square * 0.05;
  dimension = prompt("What are the board dimensions? A standard board is 8 locations.");
  while(dimension != null && !(dimension.match("^[0-9]+$")))
    dimension = prompt("Please enter in a valid dimension. What are the board dimensions?");
  if(dimension != null)
    dimension = parseInt(dimension);
  else
    dimension = 8;

  for(let i = 0; i < dimension; i++){
    let element = document.getElementsByClassName("col")[0];
    if(i > 0)
      element = element.cloneNode(true);
    else {
      element.children[0].style.border = "solid black " + (1 / dimension * square) * 0.1 + "px";
      element.children[0].children[0].style.border = "dashed white " + (square / dimension) * 0.1 + "px";
      element.style.width = 1 / dimension * square + "px";
      element.style.height = 1 / dimension * square + "px";
    }
    element.className = "col col" + i;
    document.getElementsByClassName("col")[0].parentElement.appendChild(element);
  }

  for(let i = 0, offset = 0; i < dimension; i++, offset = (offset + 1) % 2){
    let element = document.getElementsByClassName("row")[0];
    if(i > 0)
      element = element.cloneNode(true);
    element.className = "row row" + i;
    element.style.height = 1 / dimension * square + "px";

    for(let j = 0; j < dimension; j++) {
      element.children[j].children[0].className = "piece";
    }

    if(i < dimension / 2 - 1 || i > dimension / 2) {
      let color = i < dimension / 2 - 1 ? "one" : "two";
      let inside = element.children;
      for(let j = offset; j < dimension; j+=2) {
        inside[j].children[0].className += " " + color + " active";
      }
    }
    document.getElementById("board").appendChild(element);
  }

  let board = document.getElementById("board");
  board.style.width=square + "px";
  board.style.border = "solid #555 " + square * 0.025 + "px";
  if(other != 0)
    board.style.marginTop = (other - square) / 2 + "px";
}

function clickEvent(element) {
  piece.location.x = parseInt(element.className.substring(7));
  piece.location.y = element.parentElement.className;
  if(piece.location.y.indexOf("selected") == -1)
    piece.location.y = parseInt(piece.location.y.substring(7));
  else 
    piece.location.y = parseInt(piece.location.y.substring(7, piece.location.y.indexOf(" selected")));
  
  if(piece.location.x !== piece.selected.x || piece.location.y !== piece.selected.y) {
    if(isSpaceTaken(piece.location.x, piece.location.y) && isSameTokenType(piece.location.x, piece.location.y)) {
      deselect(piece.selected.x, piece.selected.y);
      select(piece.location.x, piece.location.y);
    } else {
      if(piece.location.x != -1 && piece.location.y != -1)
        if(isSelected(piece.selected.x, piece.selected.y))
          move();
    }
  }
}

function move() {
  if(Math.abs(piece.location.x - piece.selected.x) == 1 && (piece.selected.y - piece.location.y == direction || isKing(piece.selected.x, piece.selected.y) && piece.selected.y - piece.location.y == -1 * direction)) {
    if(!isSpaceTaken(piece.location.x, piece.location.y)) {
      swap(piece.location.x, piece.location.y, piece.selected.x, piece.selected.y);
      deselect(piece.selected.x, piece.selected.y);
      direction *= -1;
      if(direction < 0 && piece.location.y == 0 || direction > 0 && piece.location.y == dimension - 1)
        makeKing(piece.location.x, piece.location.y);
    }
  } else {
    if(jumpChecker(piece.location.x, piece.location.y, piece.selected.x, piece.selected.y)) {
      deselect(piece.selected.x, piece.selected.y); 
      direction *= -1;
      if(direction < 0 && piece.location.y == 0 || direction > 0 && piece.location.y == dimension - 1)
        makeKing(piece.location.x, piece.location.y);
    }
  }
}

function jumpChecker(toX, toY, fromX, fromY) {
  toX = parseInt(toX);
  toY = parseInt(toY);
  fromX = parseInt(fromX);
  fromY = parseInt(fromY);

  if(fromX == toX && fromY == toY)
    return true;
  
  let location = validJumpLocations(fromX, fromY);
  for(let index = 0; index < location.length; index++) {
    swap(location[index].x, location[index].y, fromX, fromY);
    let king = isKing((location[index].x + fromX) / 2, (location[index].y + fromY) / 2);
    removeToken((location[index].x + fromX) / 2, (location[index].y + fromY) / 2);
    if(!jumpChecker(toX, toY, location[index].x, location[index].y)) {
      swap(location[index].x, location[index].y, fromX, fromY);
      addToken((location[index].x + fromX) / 2, (location[index].y + fromY) / 2, direction < 0 ? "two":"one", king);
    } else {
      return true;
    }
  }
  return false;
}

function validJumpLocations(x, y) {
  x = parseInt(x);
  y = parseInt(y);
  let location = [];
  
  
  if(isNotSameTokenType(x + 1, y - direction) && isSpaceNotTaken(x + 2, y - 2 * direction)) {
    let point = {
      x: x + 2,
      y: y - 2*direction
    };
    location.push(point);
  }
  if(isNotSameTokenType(x - 1, y - direction) && isSpaceNotTaken(x - 2, y - 2 * direction)) {
    let point = {
      x: x - 2,
      y: y - 2*direction
    };
    location.push(point);
  }
  if(isKing(x, y)) {
    if(isNotSameTokenType(x + 1, y + direction) && isSpaceNotTaken(x + 2, y + 2 * direction)) {
      let point = {
        x: x + 2,
        y: y + 2*direction
      };
      location.push(point);
    }
    if(isNotSameTokenType(x - 1, y + direction) && isSpaceNotTaken(x - 2, y + 2 * direction)) {
      let point = {
        x: x - 2,
        y: y + 2*direction
      };
      location.push(point);
    }
  }

  for(let i = 0; i < location.length; i++) {
    console.log("Potentional spot: (" + location[i].x + ", " + location[i].y + ")");
  }

  return location;
}

function removeToken(x, y) {
  let element = getElement(x, y);
  if(element != null) {
    element.children[0].className = "piece";
    element.children[0].children[0].className = "king";
  }
}

function addToken(x, y, player, king) {
  let element = getElement(x, y);
  if(element != null) {
    element.children[0].className = "piece " + player+ " active";
    if(king) {
      makeKing(x, y);
    }
  }
}

function isSameTokenType(x, y) {
  let element = getElement(x, y);
  if(element != null)
   return element.children[0].className.indexOf(direction > 0 ? "two" : "one") != -1;
  return false;
}

function isSpaceTaken(x, y) {
  let element = getElement(x, y);
  if(element != null)
   return element.children[0].className.indexOf("active") != -1;
  return false;
}

function isNotSameTokenType(x, y) {
  let element = getElement(x, y);
  if(isSpaceTaken(x, y))
    return !isSameTokenType(x, y);
  return false;
}

function isSpaceNotTaken(x, y) {
  let element = getElement(x, y);
  if(element != null)
   return element.children[0].className.indexOf("active") == -1;
  return false;
}

function getElement(x, y) {
  if(x >= 0 && x < dimension && y >= 0 && y < dimension)
    return document.getElementsByClassName("row" + y)[0].children[x];
  return null;
}

function isKing(x, y) {
  let element = getElement(x, y);
  if(element != null)
    return element.children[0].children[0].className.indexOf("active") != -1;
  return false;
}

function makeKing(x, y) {
  let element = getElement(x, y);
  if(element != null) {
    element.children[0].children[0].className += " active";
  }
}

function select(x,y) {
  if(!isSelected(x, y)) {
    piece.selected.x = x;
    piece.selected.y = y;
    getElement(x, y).className += " selected";
  }
}

function deselect(x, y) {
  if(isSelected(x, y)) {
    piece.selected.x = -1;
    piece.selected.y = -1;
    let element = getElement(x, y);
    element.className = element.className.substring(0, element.className.indexOf(" selected"));
  } 
}
  
function isSelected(x, y) {
  let element = getElement(x, y);
  if(element != null)
    return element.className.indexOf("selected") != -1;
  return false;
}

function swap(toX, toY, fromX, fromY) {
  let to = getElement(toX, toY);
  let from = getElement(fromX, fromY);
  if(to != null && from != null) {
   
    let temp = to.children[0].className;
    to.children[0].className = from.children[0].className;
    from.children[0].className = temp;
 
    temp = to.children[0].children[0].className;
    to.children[0].children[0].className = from.children[0].children[0].className;
    from.children[0].children[0].className = temp;
  }
}

init();
