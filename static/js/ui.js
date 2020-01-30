function resetScreen(screen) {
    fetch("resetScreen?screen=" + screen);
}

function addCommand(tag) {
    var command = document.getElementById("command" + tag).value;
    fetch('addCommand?tag=' + tag + '&command=' + command);
    location.reload();
}

function removeCommand(tag) {
    var command = document.getElementById("command" + tag).value;
    fetch('removeCommand?tag=' + tag + '&command=' + command);
    location.reload();
}

function changeName(tag) {
    var newName = document.getElementById("name" + tag).value;
    fetch('setTag?tag=' + tag + '&name=' + newName);
    location.reload();
}

function changeRandom(tag) {
    var newRandom = false;
    if(document.getElementById("random" + tag).checked) {
        newRandom = true;
    }
    fetch('setTag?tag=' + tag + '&random=' + newRandom);
    location.reload();
}

function addTag() {
    fetch('addTag');
    location.reload();
}

function setScreenTag(screen) {
    var newTag = document.getElementById("tag" + screen).value;
    fetch('changeScreenTag?tag=' + newTag + '&screen=' + screen);
    //location.reload();
}