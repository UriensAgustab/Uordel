import { VALID_GUESSES } from "./Woordle_Paraules5LletresCatala.js";

const ARRAY_TECLES = document.querySelectorAll("#abecedari .keyRow button");
const GAMEOVER_SCREEN = document.getElementById("endScreen");

let paraula;
let jocActiu = false;
let intents;
let espaiSeleccionat = null;
let espaiSeleccionatNum;
let esperaPintarEspais = 300;
const MAX_INTENTS = 6;

let arrayEspaisFila;

document.getElementsByTagName("body")[0].addEventListener("load", iniciarJoc())
let resetButtons = document.getElementsByClassName("reset");
for (let i=0; i<resetButtons.length; i++){
    resetButtons[i].addEventListener('click', reiniciarJoc);
}
document.getElementById("clue").addEventListener('click', pista);
for (let i=0; i<ARRAY_TECLES.length; i++){
    if (!ARRAY_TECLES[i].classList.contains("specialButton")){
        ARRAY_TECLES[i].addEventListener('click', botoTecla);
    }
}
document.getElementById("delete").addEventListener('click', borrarLletra);
document.getElementById("enter").addEventListener('click', comprovarParaula);
document.addEventListener("keydown", (event) => {
    if (!jocActiu){ return; }

    var audio = new Audio('sounds/fart.mp3');

    if (event.key.toUpperCase() == "ENTER") {
        comprovarParaula();
        return;
    }

    if (event.key.toUpperCase() == "BACKSPACE") {
        borrarLletra();
        return;
    }

    if (event.key.toUpperCase() == "ARROWRIGHT") {
        if(espaiSeleccionatNum<arrayEspaisFila.length-1){
            seleccionarEspai(espaiSeleccionatNum+1);
        }
        return;
    }

    if (event.key.toUpperCase() == "ARROWLEFT") {
        if(espaiSeleccionatNum>0){
            seleccionarEspai(espaiSeleccionatNum-1);
        }
        return;
    }

    if (event.key.length > 1){
        return;
    }

    if (event.key == " ") {
        if (espaiSeleccionatNum < arrayEspaisFila.length-1){
            seleccionarEspai(espaiSeleccionatNum+1);
        }
        return;
    }

    if (event.key.toUpperCase() >= 'A' && event.key.toUpperCase() <= 'Z'){
        entrarLletra(event.key.toUpperCase());
    }
});

function iniciarJoc(){
    jocActiu = true;
    
    intents = 0;
    getRow();
    seleccionarEspai(0);
    paraula = VALID_GUESSES[getRandomNumber(0,VALID_GUESSES.length-1)].toUpperCase();
    //console.log(paraula);
}

function reiniciarJoc(){
    iniciarJoc();

    document.getElementById("clue").classList.remove("disabled");
    GAMEOVER_SCREEN.style.display = "none";
    GAMEOVER_SCREEN.classList.remove("fadeIn");
    GAMEOVER_SCREEN.classList.remove("victory");
    GAMEOVER_SCREEN.classList.remove("defeat");
    let arrayEspais = document.querySelectorAll("#wordsGrid .row div");
    for (let i=0; i<arrayEspais.length; i++){
        arrayEspais[i].innerHTML = '';
        arrayEspais[i].style.transition = "0s";
        arrayEspais[i].classList.remove("none");
        arrayEspais[i].classList.remove("wrongPos");
        arrayEspais[i].classList.remove("good");
        arrayEspais[i].style.transition = "0.5s";
    }
    for (let i=0; i<ARRAY_TECLES.length; i++){
        ARRAY_TECLES[i].classList.remove("none");
        ARRAY_TECLES[i].classList.remove("wrongPos");
        ARRAY_TECLES[i].classList.remove("good");
    }

    var reiniciarAudio = new Audio('sounds/reset.mp3');
    reiniciarAudio.play();
}

function pista(){
    let pistaButton = document.getElementById("clue");
    if (pistaButton.classList.contains("disabled")) return;
    pistaButton.classList.add("disabled");

    for (let i=0; i<paraula.length; i++){
        let tecla = buscarTecla(paraula.charAt(i));
        if (!tecla.classList.contains("wrongPos") && !tecla.classList.contains("good")) {
            tecla.classList.add("wrongPos");
            new Audio("sounds/clue.mp3").play();
            return;
        }
    }

    // EL JUGADOR JA HA DESCOBERT TOTES LES LLETRES
    alert("Ja has descobert totes les lletres, ja no pots utilitzar la pista!");
}

function gameOver(gameOverCondition){
    GAMEOVER_SCREEN.classList.add("fadeIn");
    GAMEOVER_SCREEN.style.display = "flex";
    let gameOverTitle = document.querySelectorAll("#endScreen .title h1")[0];
    let gameOverDesc = document.querySelectorAll("#endScreen .title h3")[0];
    if (gameOverCondition == "victory"){
        var winAudio = new Audio('sounds/win.mp3');
        winAudio.play();
        GAMEOVER_SCREEN.classList.add("victory");
        gameOverTitle.innerHTML = "HAS GUANYAT!";
        gameOverDesc.innerHTML = "T'ha costat " + intents + " intents";
    } else if (gameOverCondition == "defeat"){
        var looseAudio = new Audio('sounds/loose.mp3');
        looseAudio.play();
        GAMEOVER_SCREEN.classList.add("defeat");
        gameOverTitle.innerHTML = "HAS PERDUT!";
        gameOverDesc.innerHTML = "La paraula era " + paraula;
    } else{
        GAMEOVER_SCREEN.style.display = "none";
        console.error("gameOverCondition not valid (" + gameOverCondition + ")");
    }
}

function comprovarParaula(){
    let paraulaEntrada = "";
    for (let i=0; i<arrayEspaisFila.length; i++){
        if (arrayEspaisFila[i].innerHTML == ''){
            alert("No has posat prou lletres. tonto.");
            return;
        }
        paraulaEntrada = paraulaEntrada.concat(arrayEspaisFila[i].innerHTML);
    }

    let trobat = false;
    for (let i=0; i<VALID_GUESSES.length && !trobat; i++){
        if(paraulaEntrada == VALID_GUESSES[i].toUpperCase()){
            trobat = true;
        }
    }

    if (!trobat) {
        alert("Aquesta paraula no existeix. tonto.");
        return;
    }

    validarLletresParaula();
}

function validarLletresParaula(){
    jocActiu = false;
    intents++;
    let arrayParaula = paraula.toUpperCase().split('');
    // COMPROVA LLETRES EN MATEIXA POSICIÓ
    var goodLettersQuant = 0;
    for (let i=0; i<arrayEspaisFila.length; i++){
        if (arrayEspaisFila[i].innerHTML == arrayParaula[i]){
            goodLettersQuant++;
            pintarEspai(arrayEspaisFila[i], i+1, "good", goodLettersQuant);
            arrayParaula[i] = null;
        }
    }

    for (let i=0; i<arrayEspaisFila.length; i++){
        if (!arrayEspaisFila[i].classList.contains("good")){
            let lletraTrobada = false;
            for (let j=0; j<arrayParaula.length && !lletraTrobada; j++){
                if (arrayEspaisFila[i].innerHTML == arrayParaula[j]){
                    lletraTrobada = true;
                    arrayParaula[j] = null;
                    pintarEspai(arrayEspaisFila[i], i+1, "wrongPos");
                }
            }
            if (!lletraTrobada){
                pintarEspai(arrayEspaisFila[i], i+1, "none");
            }
        }
    }

    let paraulaCorrecte = true;
    for (let i=0; i<arrayEspaisFila.length && paraulaCorrecte; i++){
        if (!arrayEspaisFila[i].classList.contains("good")){
            paraulaCorrecte = false;
        }
    }

    var tempsEspera = esperaPintarEspais * (arrayEspaisFila.length+1);
    if (intents == MAX_INTENTS) {
        tempsEspera *= 3;
    }
    if (paraulaCorrecte){
        setTimeout(() => {
            gameOver("victory")
        },tempsEspera);
        return;
    }

    if (intents>=MAX_INTENTS){
        setTimeout(() => {
            gameOver("defeat")
        },tempsEspera);
        return;
    }

    getRow();
    setTimeout(() => {
        seleccionarEspai(0);
        jocActiu = true;
    }, tempsEspera);
}

function pintarEspai(espai, multiplicadorEspera, classe, pitchShiftQuant){
    if (intents == MAX_INTENTS){
        multiplicadorEspera *= 3;
    }
    var paintAudio = new Audio('sounds/'+classe+'.mp3');
    if (pitchShiftQuant !== undefined){
        paintAudio.playbackRate = 1 + 0.1 * pitchShiftQuant;
        if (paintAudio.preservesPitch !== undefined) {
            paintAudio.preservesPitch = false;
        }
    }

    let espera = (esperaPintarEspais * multiplicadorEspera)*0.001;
    espai.style.transitionDelay = espera + "s";
    espai.classList.add(classe);
    setTimeout(()=> {
        paintAudio.play();
        buscarTecla(espai.innerHTML).classList.add(classe);
    }, esperaPintarEspais * multiplicadorEspera);
}

function buscarTecla(lletra){
    for (let i=0; i<ARRAY_TECLES.length; i++){
        if (ARRAY_TECLES[i].innerHTML.toUpperCase() == lletra.toUpperCase()){
            return ARRAY_TECLES[i];
        }
    }
    return null;
}

function getRow(){
    if (arrayEspaisFila != null){
        for (let i=0; i<arrayEspaisFila.length; i++){
            arrayEspaisFila[i].removeEventListener('click', clickEspai);
        }
    }

    arrayEspaisFila = document.querySelectorAll("#wordsGrid #row"+intents+" div");
    for (let i=0; i<arrayEspaisFila.length; i++){
        arrayEspaisFila[i].addEventListener('click', clickEspai);
    }
}

function clickEspai(event){
    if (!jocActiu) return;

    let espai = event.target;
    getRow();
    for(let i=0; i<arrayEspaisFila.length; i++){
        if(arrayEspaisFila[i] == espai){
            seleccionarEspai(i);
            return;
        }
    }
}

function seleccionarEspai(espaiASeleccionar){
    deseleccionarEspai();

    espaiSeleccionatNum = espaiASeleccionar;
    espaiSeleccionat = arrayEspaisFila[espaiSeleccionatNum];
    espaiSeleccionat.classList.add("selected");
}

function deseleccionarEspai(){
    if (espaiSeleccionat != null){
        espaiSeleccionat.classList.remove("selected");
    }
}

function botoTecla(event){
    if (!jocActiu) return;

    let lletra = event.target.innerHTML;
    entrarLletra(lletra);
}

function entrarLletra(lletra){
    if (!espaiSeleccionat.classList.contains("selected")){
        return;
    }
    espaiSeleccionat.innerHTML = lletra;
    deseleccionarEspai();
    if (espaiSeleccionatNum+1 < arrayEspaisFila.length){
        seleccionarEspai(espaiSeleccionatNum+1);
    }
}

function borrarLletra(){
    if (!jocActiu) return;

    if (espaiSeleccionat.innerHTML != ''){
        espaiSeleccionat.innerHTML = '';
        seleccionarEspai(espaiSeleccionatNum);
    } else if(espaiSeleccionatNum-1 >= 0){
        deseleccionarEspai();
        seleccionarEspai(espaiSeleccionatNum-1);
        espaiSeleccionat.innerHTML = '';
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}