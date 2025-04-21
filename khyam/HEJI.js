// DEFINITIONS FOR ARRAY OPERATIONS

Array.prototype.SumArray = function (arr) { // calculate sum of two arrays by element
	var sum = [];
	if (arr != null && this.length == arr.length) {
		for (var i = 0; i < arr.length; i++) {
			sum.push(this[i] + arr[i]);
		}
	}
	return sum;
} 
Array.prototype.DiffArray = function (arr) { // calculate the difference of two arrays by element
	var diff = [];
	if (arr != null && this.length == arr.length) {
		for (var i = 0; i < arr.length; i++) {
			diff.push(this[i] - arr[i]);
		}
	}
	return diff;
}
Array.prototype.ProductArray = function (arr) { // multiply two arrays by element 
	var product = [];
	if (arr != null && this.length == arr.length) {
		for (var i = 0; i < arr.length; i++) {
			product.push(this[i] * arr[i]);
		}
	}
	return product;
}
Array.prototype.DivideArray = function (arr) { // divide two arrays by element  
	var divide = [];
	if (arr != null && this.length == arr.length) {
		for (var i = 0; i < arr.length; i++) {
			divide.push(this[i] / arr[i]);
		}
	}
	return divide;
}
Array.prototype.LowestTermsArray = function (arr) { // ensure elements are in lowest terms 
	var returnLowestTerms = [[],[]];
	if (arr != null && this.length == arr.length) {
		for (var i = 0; i < arr.length; i++) {
			returnLowestTerms[0].push(this[i] - Math.min(this[i],arr[i]));
			returnLowestTerms[1].push(arr[i] - Math.min(this[i],arr[i]))
		}
	}
	return returnLowestTerms;
}
Array.prototype.PowersArray = function (arr) { // calculate prime powers
	var powers = [];
	if (arr != null && this.length == arr.length) {
		for (var i = 0; i < arr.length; i++) {
			powers.push(Math.pow(this[i], arr[i]));
		}
	}
	return powers;
}
function sum(array) { // sum of all array elements
	var sum = 0;
	for (var i = 0; i < array.length; i++) {
		sum = sum + array[i];
	}
	return sum;
}
function multiply(array) { // product of all array elements 
	var mult = 1;
	for (var i = 0; i < array.length; i++) {
		mult = mult * array[i];
	}
	return mult;
}
function reduce(numerator,denominator){ // put fractions in reduced form 
	var gcd = function gcd(a,b){
		return b ? gcd(b, a%b) : a;
	};
	gcd = gcd(numerator,denominator);
	return [numerator/gcd, denominator/gcd];
}
function getArray(integer){ // get prime factorization of integer, output array of powers of each prime 
	var result = [];
	for(i = 0; i < primes.length; i++){
		result.push(0);
		while(integer % primes[i] == 0){
			result[i]++;
			integer = integer / primes[i];
		}
	}
	return result;
}

// CONSTANTS AND VARIABLES 

const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47]; // prime integers 3-31
const reference = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];  // harmonic space coordinates of 1/1 = 
const autoOffsetToA = [4,-3,0,0,0,0,0,0,0,0,0,0,0,0,0]; 
const tonalIdentity = [0,1,4,-2,-1,3,7,-3,6,-2,0,2,4,-1,1]; // distance in fifths for each prime partial
const negIdentity = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];

// Reference pitch harmonic space coordinates, spelling  (NB: all opposite sign)
const refOctave = [
[9,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -9 octaves
[8,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -8 octaves
[7,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -7 octaves
[6,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -6 octaves
[5,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -5 octaves
[4,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -4 octaves
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -3 octaves
[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -2 octaves
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -1 octave
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 0 octaves
[-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // +1 octave
[-2,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // +2 octaves
[-3,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // +3 octaves
];
const refNote = [ // the diatonic note
[-6, 4, 0,0,0,0,0,0,0,0,0,0,0,0,0], // F
[-4, 3, 0,0,0,0,0,0,0,0,0,0,0,0,0], // C
[-3,2,0,0,0,0,0,0,0,0,0,0,0,0,0], // G
[-1,1,0,0,0,0,0,0,0,0,0,0,0,0,0], // D
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // A
[2,-1,0,0,0,0,0,0,0,0,0,0,0,0,0], // E
[3,-2,0,0,0,0,0,0,0,0,0,0,0,0,0]  // B
];
const refAccidental = [
[-11,7,0,0,0,0,0,0,0,0,0,0,0,0,0], // #
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
[11,-7,0,0,0,0,0,0,0,0,0,0,0,0,0], // b
];
const frequencyOctave = [-108,-96,-84,-72,-60,-48,-36,-24,-12,0,12,24,36];
const frequencyNote = [-4,-9,-2,-7,0,-5,2];
const frequencyAccidental = [-1,0,1];
const diatonicTempered = [800, 300, 1000, 500, 0, 700, 200];

// Input harmonic space coordinates (notation)
const octave = [
[-9,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -9 octaves
[-8,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -8 octaves
[-7,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -7 octaves
[-6,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -6 octaves
[-5,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -5 octaves
[-4,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -4 octaves
[-3,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -3 octaves
[-2,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -2 octaves
[-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // -1 octave
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 0 octaves
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 1 octave
[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 2 octaves
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // 3 octaves
];
const notes = [ // the diatonic note
[2,-1,0,0,0,0,0,0,0,0,0,0,0,0,0], // F
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // C
[-1,1,0,0,0,0,0,0,0,0,0,0,0,0,0], // G
[-3,2,0,0,0,0,0,0,0,0,0,0,0,0,0], // D
[-4,3,0,0,0,0,0,0,0,0,0,0,0,0,0], // A
[-6,4,0,0,0,0,0,0,0,0,0,0,0,0,0], // E
[-7,5,0,0,0,0,0,0,0,0,0,0,0,0,0] // B
];
const chromatic = [
[33,-21,0,0,0,0,0,0,0,0,0,0,0,0,0], // bbb
[22,-14,0,0,0,0,0,0,0,0,0,0,0,0,0], // bb
[11,-7,0,0,0,0,0,0,0,0,0,0,0,0,0], // b
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
[-11,7,0,0,0,0,0,0,0,0,0,0,0,0,0], // #
[-22,14,0,0,0,0,0,0,0,0,0,0,0,0,0], // x 
[-33,21,0,0,0,0,0,0,0,0,0,0,0,0,0] // #x 
];
const syntonic = [ // 81:80
[12,-12,3,0,0,0,0,0,0,0,0,0,0,0,0],
[8,-8,2,0,0,0,0,0,0,0,0,0,0,0,0],
[4,-4,1,0,0,0,0,0,0,0,0,0,0,0,0], // o5 (lowering)
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-4,4,-1,0,0,0,0,0,0,0,0,0,0,0,0], // u5 (raising)
[-8,8,-2,0,0,0,0,0,0,0,0,0,0,0,0],
[-12,12,-3,0,0,0,0,0,0,0,0,0,0,0,0]
];
const septimal = [ // 64:63
[-18,6,0,3,0,0,0,0,0,0,0,0,0,0,0],
[-12,4,0,2,0,0,0,0,0,0,0,0,0,0,0],
[-6,2,0,1,0,0,0,0,0,0,0,0,0,0,0], // o7 (lowering)
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[6,-2,0,-1,0,0,0,0,0,0,0,0,0,0,0], // u7 (raising)
[12,-4,0,-2,0,0,0,0,0,0,0,0,0,0,0],
[18,-6,0,-3,0,0,0,0,0,0,0,0,0,0,0]
];
const undecimal = [ // 33:32
[15,-3,0,0,-3,0,0,0,0,0,0,0,0,0,0],
[10,-2,0,0,-2,0,0,0,0,0,0,0,0,0,0],
[5,-1,0,0,-1,0,0,0,0,0,0,0,0,0,0], // u11 (lowering)
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-5,1,0,0,1,0,0,0,0,0,0,0,0,0,0], // o11 (raising)
[-10,2,0,0,2,0,0,0,0,0,0,0,0,0,0],
[-15,3,0,0,3,0,0,0,0,0,0,0,0,0,0]
];
const tridecimal = [ // 27:26
[3,-9,0,0,0,3,0,0,0,0,0,0,0,0,0],
[2,-6,0,0,0,2,0,0,0,0,0,0,0,0,0],
[1,-3,0,0,0,1,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-1,3,0,0,0,-1,0,0,0,0,0,0,0,0,0],
[-2,6,0,0,0,-2,0,0,0,0,0,0,0,0,0],
[-3,9,0,0,0,-3,0,0,0,0,0,0,0,0,0]
];
const seventeen = [ // 2187:2176
[21,-21,0,0,0,0,3,0,0,0,0,0,0,0,0],
[14,-14,0,0,0,0,2,0,0,0,0,0,0,0,0],
[7,-7,0,0,0,0,1,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-7,7,0,0,0,0,-1,0,0,0,0,0,0,0,0],
[-14,14,0,0,0,0,-2,0,0,0,0,0,0,0,0],
[-21,21,0,0,0,0,-3,0,0,0,0,0,0,0,0]
];
const nineteen = [ // 513:512
[27,-9,0,0,0,0,0,-3,0,0,0,0,0,0,0],
[18,-6,0,0,0,0,0,-2,0,0,0,0,0,0,0],
[9,-3,0,0,0,0,0,-1,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-9,3,0,0,0,0,0,1,0,0,0,0,0,0,0],
[-18,6,0,0,0,0,0,2,0,0,0,0,0,0,0],
[-27,9,0,0,0,0,0,3,0,0,0,0,0,0,0]
];
const twentyThree = [ // 736:729
[-15,18,0,0,0,0,0,0,-3,0,0,0,0,0,0],
[-10,12,0,0,0,0,0,0,-2,0,0,0,0,0,0],
[-5,6,0,0,0,0,0,0,-1,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[5,-6,0,0,0,0,0,0,1,0,0,0,0,0,0],
[10,-12,0,0,0,0,0,0,2,0,0,0,0,0,0],
[15,-18,0,0,0,0,0,0,3,0,0,0,0,0,0]
];
const twentyNine = [ // 261:256
[24,-6,0,0,0,0,0,0,0,-3,0,0,0,0,0],
[16,-4,0,0,0,0,0,0,0,-2,0,0,0,0,0],
[8,-2,0,0,0,0,0,0,0,-1,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-8,2,0,0,0,0,0,0,0,1,0,0,0,0,0],
[-16,4,0,0,0,0,0,0,0,2,0,0,0,0,0],
[-24,6,0,0,0,0,0,0,0,3,0,0,0,0,0]
];
const thirtyOne = [ // 32:31
[-15,0,0,0,0,0,0,0,0,0,3,0,0,0,0],
[-10,0,0,0,0,0,0,0,0,0,2,0,0,0,0],
[-5,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[5,0,0,0,0,0,0,0,0,0,-1,0,0,0,0],
[10,0,0,0,0,0,0,0,0,0,-2,0,0,0,0],
[15,0,0,0,0,0,0,0,0,0,-3,0,0,0,0]
];
const thirtySeven = [ // 37:36
[6,6,0,0,0,0,0,0,0,0,0,-3,0,0,0],
[4,4,0,0,0,0,0,0,0,0,0,-2,0,0,0],
[2,2,0,0,0,0,0,0,0,0,0,-1,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-2,-2,0,0,0,0,0,0,0,0,0,1,0,0,0],
[-4,-4,0,0,0,0,0,0,0,0,0,2,0,0,0],
[-6,-6,0,0,0,0,0,0,0,0,0,3,0,0,0]
];
const fortyOne = [ // 82:81
[-3,12,0,0,0,0,0,0,0,0,0,0,-3,0,0],
[-2,8,0,0,0,0,0,0,0,0,0,0,-2,0,0],
[-1,4,0,0,0,0,0,0,0,0,0,0,-1,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[1,-4,0,0,0,0,0,0,0,0,0,0,1,0,0],
[2,-8,0,0,0,0,0,0,0,0,0,0,2,0,0],
[3,-12,0,0,0,0,0,0,0,0,0,0,3,0,0]
];
const fortyThree = [ // 129:128
[21,-3,0,0,0,0,0,0,0,0,0,0,0,-3,0],
[14,-2,0,0,0,0,0,0,0,0,0,0,0,-2,0],
[7,-1,0,0,0,0,0,0,0,0,0,0,0,-1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[-7,1,0,0,0,0,0,0,0,0,0,0,0,1,0],
[-14,2,0,0,0,0,0,0,0,0,0,0,0,2,0],
[-21,3,0,0,0,0,0,0,0,0,0,0,0,3,0]
];
const fortySeven = [ // 48:47
[-12,-3,0,0,0,0,0,0,0,0,0,0,0,0,3],
[-8,-2,0,0,0,0,0,0,0,0,0,0,0,0,2],
[-4,-1,0,0,0,0,0,0,0,0,0,0,0,0,1], // lowering
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[4,1,0,0,0,0,0,0,0,0,0,0,0,0,-1], // raising
[8,2,0,0,0,0,0,0,0,0,0,0,0,0,-2],
[12,3,0,0,0,0,0,0,0,0,0,0,0,0,-3]
];

// Character mappings for HEJI2 font
const nat = "n";
const diatonicOutput = ["F","C","G","D","A","E","B"];
const fiveDownDownDownDown = ["eI","I","K","M","O","R","vR"];
const fiveDownDownDown = ["eB","B","b","k","s","S","vS"];
const fiveDownDown = ["eC","C","c","l","t","T","vT"];
const fiveDown = ["eD","D","d","m","u","U","vU"];
const pythagOutput = ["eE","E","e","","v","V","vV"];
const fiveUp = ["eF","F","f","o","w","W","vW"];
const fiveUpUp = ["eG","G","g","p","x","X","vX"];
const fiveUpUpUp = ["eH","H","h","q","y","Y","vY"];
const fiveUpUpUpUp = ["eJ","J","L","N","P","Q","vQ"];
const septimalSymbols = ["&lt,",",","&lt","",">",".",">."]; 
const undecimalSymbols = ["555","55","5","","4","44","444"];
const tridecimalSymbols = ["000","00","0","","9","99","999"];
const seventeenSymbols = [":::","::",":","",";",";;",";;;"];
const nineteenSymbols = ["È","À","*","","/","Á","É"];
const twentyThreeSymbols = ["666","66","6","","3","33","333"];
const twentyNineSymbols = ["777","77","7","","2","22","222"];
const thirtyOneSymbols = ["111","11","1","","8","88","888"];
const thirtySevenSymbols = ["ààà","àà","à","","á","áá","ááá"];
const fortyOneSymbols = ["---","--","-","","+","++","+++"];
const fortyThreeSymbols = ["èèè","èè","è","","é","éé","ééé"];
const fortySevenSymbols = ["&#xee5b;&#xee5b;&#xee5b;","&#xee5b;&#xee5b;","&#xee5b;","","&#xee5a;","&#xee5a;&#xee5a;","&#xee5a;&#xee5a;&#xee5a;"];

// Print-out of closest MIDI note (12-ED2)
const refMidiNote = ["*ntC", "*stD | *ftE","*ntD","*stD | *ftE","*ntE","*ntF","*stF | *ftG","*ntG","*stG | *ftA","*ntA","*stA | *ftB","*ntB"];

// Global Variables
var numValue = 1; 
var denValue = 1; 
var displayNumValue = 1;
var displayDenValue = 1;
var melodicRefNum = 1;
var melodicRefDen = 1;
var melodicNum = 1;
var melodicDen = 1;
var checkMelodicNum = 1;
var checkMelodicDen = 1;
var inputNum = 1; 
var inputDen = 1; 
var inputNumReduced = 1;
var inputDenReduced = 1;
var savedNum = 1; 
var savedDen = 1;
var numArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var denArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var savedNumArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var savedDenArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var reducedSavedNum = 1;
var reducedSavedDen = 1;
var reducedRatioRemainder = [1,1];
var inputSum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var displaySum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var savedInputSum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var offsetNumRemainder = 1;
var offsetDenRemainder = 1;
var inputNumRemainder = 1;
var inputDenRemainder = 1;
var precision = 1;
var kammerTon = 440.000000;
var jiCents = 0;
var cents_toRef = 0;
var freq1to1 = 440.000000;
var reducedOffsetInput;
var freq = 440.000000; 
var ref12acc = 0;
var diat_to_refTempered = 0;
var currentCents = 0;
var cat = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var monzoArray = [];
var bigArray = [];
var displayBigArray = [];
var power3 = [];
var power5 = [];
var power7 = [];
var power11 = [];
var power13 = [];
var power17 = [];
var power19 = [];
var power23 = [];
var power29 = [];
var cents = [];
var harmD = [];
var delta = [];
var accCount = [];
var diatPC= [];
var acc3 = [];
var melodicCents = 0;
var monzoMessage = "";
var cents_from_diatonic_tempered = 0;
var centDeviation = 0;
var sibeliusRange = 200;
var midiRange = 1200;
var edoQuantisation = 53;

// PROCEDURES 

// Functions to retrieve input values 
function getRefOctave(){
	return $(".refOctave.selected").attr("value");
}

function getRefNote(){
	return $(".refNote.selected").attr("value");
}

function getRefAccidental(){
	return $(".refAccidental.selected").attr("value");
}

function getFrequencyOctave(){
	return $(".refOctave.selected").attr("value");
}

function getFrequencyNote(){
	return $(".refNote.selected").attr("value");
}

function getFrequencyAccidental(){
	return $(".refAccidental.selected").attr("value");
}

function getOctave(){
	return $(".octave.selected").attr("value");
}

function getNote(){
	return $(".notes.selected").attr("value");
}

function getChromatic(){
	return $(".chromatic.selected").attr("value");
}

function getSyntonic(){
	return $(".syntonic.selected").attr("value");
}

function getSeptimal(){
	return $(".septimal.selected").attr("value");
}

function getUndecimal(){
	return $(".undecimal.selected").attr("value");
}

function getTridecimal(){
	return $(".tridecimal.selected").attr("value");
}

function getSeventeen(){
	return $(".seventeen.selected").attr("value");
}

function getNineteen(){
	return $(".nineteen.selected").attr("value");
}

function getTwentyThree(){
	return $(".twentyThree.selected").attr("value");
}

function getTwentyNine(){
	return $(".twentyNine.selected").attr("value");
}

function getThirtyOne(){
	return $(".thirtyOne.selected").attr("value");
}

function getThirtySeven(){
	return $(".thirtySeven.selected").attr("value");
}

function getFortyOne(){
	return $(".fortyOne.selected").attr("value");
}

function getFortyThree(){
	return $(".fortyThree.selected").attr("value");
}

function getFortySeven(){
	return $(".fortySeven.selected").attr("value");
}

function getFrequency(){
	return $(".frequency").attr("value");
}

function getSavedNum(){
	return $(".savedNum").attr("value");
}

function getSavedDen(){
	return $(".savedDen").attr("value");
}

function getInputNum(){
	return $(".inputNum").attr("value");
}

function getInputDen(){
	return $(".inputDen").attr("value");
}

function getMelodicRefNum(){
	return $(".melodicRefNum").attr("value");
}

function getMelodicRefDen(){
	return $(".melodicRefDen").attr("value");
}

function checkMelodicNum(){
	return $(".checkMelodicNum").attr("value");
}

function checkMelodicDen(){
	return $(".checkMelodicDen").attr("value");
}


$(document).ready(function(){
	kammerTon = $("#frequencyA4").val();
	inputNum = $("#inputNum").val();
	inputDen = $("#inputDen").val();
	sendA();
	getPC();
	$("#inputNum").change(function(c){
		inputNum = $(this).val();
		doCalc();
		getPC();
		getSavedInputSum();
	})
	$("#inputDen").change(function(c){
		inputDen = $(this).val();
		doCalc();
		getPC();
		getSavedInputSum();
	})
	$(".refOctave").click(function(c){
		$(".refOctave").removeClass("selected");
		$(this).addClass("selected");
		getFrequency1to1();
		doCalc();
		getPC();
	});
	$(".refNote").click(function(c){
		$(".refNote").removeClass("selected");
		$(this).addClass("selected");
		getFrequency1to1();
		doCalc();
		getPC();
	});
	$(".refAccidental").click(function(c){
		$(".refAccidental").removeClass("selected");
		$(this).addClass("selected");
		getFrequency1to1();
		doCalc();
		getPC();
	});
	$(".octave").click(function(c){
		$(".octave").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	});
	$(".accidental").click(function(c){
		$(".accidental").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	});
	$(".notes").click(function(c){
		$(".notes").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	});
	$(".chromatic").click(function(c){
		$(".chromatic").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	});
	$(".syntonic").click(function(c){
		$(".syntonic").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".septimal").click(function(c){
		$(".septimal").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".undecimal").click(function(c){
		$(".undecimal").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".tridecimal").click(function(c){
		$(".tridecimal").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".seventeen").click(function(c){
		$(".seventeen").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".nineteen").click(function(c){
		$(".nineteen").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".twentyThree").click(function(c){
		$(".twentyThree").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".twentyNine").click(function(c){
		$(".twentyNine").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".thirtyOne").click(function(c){
		$(".thirtyOne").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".thirtySeven").click(function(c){
		$(".thirtySeven").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".fortyOne").click(function(c){
		$(".fortyOne").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".fortyThree").click(function(c){
		$(".fortyThree").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$(".fortySeven").click(function(c){
		$(".fortySeven").removeClass("selected");
		$(this).addClass("selected");
		doCalc();
		getPC();
	}); 
	$("#num").change(function(c){
		numValue = $(this).val();
		getCentDeviation();
		getPC();
	});
	$("#den").change(function(c){
		denValue = $(this).val();
		getCentDeviation();
		getPC();
	});
	$("#melodicRefNum").change(function(c){
		melodicRefNum = $(this).val();
		getMelodicRatio();
	});
	$("#melodicRefDen").change(function(c){
		melodicRefDen = $(this).val();
		getMelodicRatio();
	});
	$("#checkMelodicNum").change(function(c){
		checkMelodicNum = $(this).val();
		getMelodicRatio();
	});
	$("#checkMelodicDen").change(function(c){
		checkMelodicDen = $(this).val();
		getMelodicRatio();
	});
	$("#frequencyA4").change(function(c){
		kammerTon = $(this).val();
		if ($("#refFrequencyLinkedRadio").prop("checked")){
			getFrequency1to1();
		}
		getCentDeviation();
		getPC(); 
	});
	$("#1to1Frequency").change(function(c){
		freq1to1 = $(this).val();
		if ($("#refFrequencyLinkedRadio").prop("checked")){
			getFrequencyKammerTon();
		}
		getOutputFrequency();
		getCentDeviation();
		getPC(); 
	});
	$("#edoQuantisation").change(function(c){
		edoQuantisation = $(this).val();
		$("#edoSize").text(edoQuantisation);
		$("#edoSizeMelodic").text(edoQuantisation);
		//getEDOSteps();
	});
	$("#savedNum").change(function(c){
		savedNum = $(this).val();
		getSavedInputSum();
	});
	$("#savedDen").change(function(c){
		savedDen = $(this).val();
		getSavedInputSum();
	});
	$("#paletteInput").click(function(c){
		doCalc();
		getPC();
	});
	$("#ratioInput").click(function(c){
		doCalc();
		getPC();
	});
	$("#normalize").click(function(c){
		doCalc();
		getPC();
	});
	$("#bendParameter").change(function(c){
		getBend();
	});
	$('#filterall').change(function(c){
		$('.filterstroke').prop("checked", this.checked);
	});
	$("#refFrequencyLinkedRadio").click(function(c){
		getFrequencyKammerTon();
		getOutputFrequency();
		//getEDOSteps();
		getCentDeviation();
		getPC();
	})
	$("#precision").change(function(c){
		precision = $(this).val();
		doCalc();
		getMelodicRatio();
    });
    $("#theme").click(function(c) {
        if (this.checked) {
            trans()
			document.documentElement.setAttribute("data-theme", "dark");
			localStorage.setItem("theme", "dark");
        } else {
            trans()
			document.documentElement.setAttribute("data-theme", "light");
			localStorage.setItem("theme", "light");
        }
	});
	$("#sibeliusRange").change(function(c){
		sibeliusRange = $(this).val();
		getBend();
    });
	$("#midiRange").change(function(c){
		midiRange = $(this).val();
		getBend();
    });

});

function preferences() {
	var savedPreference = localStorage.getItem("theme");
	if (savedPreference == "dark") {
		trans()
        document.documentElement.setAttribute('data-theme', 'dark');
		$("#theme").click();
	} else if (savedPreference == "light"){
		$("#theme").prop("checked", false);
	} else if (savedPreference == null){
		$("#theme").prop("checked", false);
	}
}

let trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition')
    }, 1000);
} 

// utilities
function getValue(arr){
	return multiply(primes.PowersArray(arr));
}

function mod(n,m) {
	return ((n % m) + m) % m;
}

// Basic chain of functions (defined below) 
function doCalc() { 		
	getInputSum();
	getOandUArrays();
	getDisplaySum();
	getDisplayValues();
	getCentDeviation();
	getOutputFrequency();
	getPC();
	getCurrentCents();
}

// retrieval of prime powers based on each comma
function getInputSum(){
	if ($("#paletteInput").prop("checked")){ 
		inputSum = autoOffsetToA
		.SumArray(octave[getOctave()])
		.SumArray(notes[getNote()])
		.SumArray(chromatic[getChromatic()]) 
		.SumArray(syntonic[getSyntonic()])
		.SumArray(septimal[getSeptimal()])
		.SumArray(undecimal[getUndecimal()])
		.SumArray(tridecimal[getTridecimal()])
		.SumArray(seventeen[getSeventeen()])
		.SumArray(nineteen[getNineteen()])
		.SumArray(twentyThree[getTwentyThree()])
		.SumArray(twentyNine[getTwentyNine()])
		.SumArray(thirtyOne[getThirtyOne()])
		.SumArray(thirtySeven[getThirtySeven()])
		.SumArray(fortyOne[getFortyOne()])
		.SumArray(fortyThree[getFortyThree()])
		.SumArray(fortySeven[getFortySeven()]);
		reducedRatioRemainder = [1,1];
	} else if ($("#ratioInput").prop("checked")){ 
		smallestTerms = reduce(inputNum,inputDen);
		inputNumReduced =  smallestTerms[0];
		inputDenReduced = smallestTerms[1];
		numArray = getArray(inputNumReduced);
		denArray = getArray(inputDenReduced);
		var inputInputSum = numArray
		.DiffArray(denArray)
		var productNumArray = numArray.SumArray(savedNumArray);
		var productDenArray = denArray.SumArray(savedDenArray);
		reducedOffsetInput = productNumArray.LowestTermsArray(productDenArray);
		inputSum = reducedOffsetInput[0].DiffArray(reducedOffsetInput[1]);
	}
}

// convert nums and dens into positive int only arrays
function getOandUArrays(){
	var otonalArray = inputSum.map(value => {
		return value < 0 ? 0 : value;
	});
	var utonalArray = inputSum.map(value => {
		return value < 0 ? Math.abs(value) : 0;
	});
	numValue = getValue(otonalArray);
	denValue = getValue(utonalArray);
}

function getFrequency1to1(){ //determine the default 1/1 frequency as an equal tempered interval from the KammerTon based on palette input
	freq1to1 = kammerTon 
		* Math.pow(2, (frequencyOctave[getFrequencyOctave()] / 12)) 
		* Math.pow(2, (frequencyNote[getFrequencyNote()] / 12)) 
		* Math.pow(2, (frequencyAccidental[getFrequencyAccidental()] / 12));
	$("#1to1Frequency").val(freq1to1.toFixed(4));
	getOutputFrequency();
	getCentDeviation();
}

function getFrequencyKammerTon(){ //determine the KammerTon implied as an equal tempered relationship from 1/1 based on palette input
	kammerTon = freq1to1
		/ Math.pow(2, (frequencyOctave[getFrequencyOctave()] / 12)) 
		/ Math.pow(2, (frequencyNote[getFrequencyNote()] / 12)) 
		/ Math.pow(2, (frequencyAccidental[getFrequencyAccidental()] / 12));
	$("#frequencyA4").val(kammerTon.toFixed(4));
	getOutputFrequency();
	getCentDeviation();
}

// adjust monzo with respect to selected reference, calculate Tenney harmonic distance
function getDisplaySum(){
	displaySum = inputSum;
	if ($("#paletteInput").prop("checked")){
		displaySum = inputSum
		.SumArray(refOctave[getRefOctave()]) 
		.SumArray(refNote[getRefNote()]) 
		.SumArray(refAccidental[getRefAccidental()]);
	}
	cat = displaySum;
	var hdValue = 0;
	if ($("#normalize").prop("checked")){
		hdValue = (Math.log2(3) * Math.abs(displaySum[1])) + (Math.log2(5) * Math.abs(displaySum[2])) + (Math.log2(7) * Math.abs(displaySum[3]))
		+ (Math.log2(11) * Math.abs(displaySum[4])) + (Math.log2(13) * Math.abs(displaySum[5])) + (Math.log2(17) * Math.abs(displaySum[6]))
		+ (Math.log2(19) * Math.abs(displaySum[7])) + (Math.log2(23) * Math.abs(displaySum[8])) + (Math.log2(29) * Math.abs(displaySum[9]))
		+ (Math.log2(31) * Math.abs(displaySum[10])) + (Math.log2(37) * Math.abs(displaySum[11])) + (Math.log2(41) * Math.abs(displaySum[12])) + (Math.log2(43) * Math.abs(displaySum[13])) + (Math.log2(47) * Math.abs(displaySum[14]));
	} else {
		hdValue = Math.abs(displaySum[0]) + (Math.log2(3) * Math.abs(displaySum[1])) + (Math.log2(5) * Math.abs(displaySum[2])) + (Math.log2(7) * Math.abs(displaySum[3]))
		+ (Math.log2(11) * Math.abs(displaySum[4])) + (Math.log2(13) * Math.abs(displaySum[5])) + (Math.log2(17) * Math.abs(displaySum[6]))
		+ (Math.log2(19) * Math.abs(displaySum[7])) + (Math.log2(23) * Math.abs(displaySum[8])) + (Math.log2(29) * Math.abs(displaySum[9]))
		+ (Math.log2(31) * Math.abs(displaySum[10])) + (Math.log2(37) * Math.abs(displaySum[11])) + (Math.log2(41) * Math.abs(displaySum[12])) + (Math.log2(43) * Math.abs(displaySum[13])) + (Math.log2(47) * Math.abs(displaySum[14]));
	}
	$("#hd").text(hdValue.toFixed(precision));
}

function getDisplayValues(){ //calculate num and den for display
	if ($("#paletteInput").prop("checked")){ 
		var displayOtonalArray = displaySum.map(value => {
			return value < 0 ? 0 : value;
		});
		var displayUtonalArray = displaySum.map(value => {
			return value < 0 ? Math.abs(value) : 0;
		});
	}	else if ($("#ratioInput").prop("checked")){
		var displayOtonalArray = reducedOffsetInput[0];
		var displayUtonalArray = reducedOffsetInput[1];
	}
	var integerMonzo1 = getValue(savedNumArray);
	var integerMonzo2 = getValue(savedDenArray);
	var integerMonzo3 = getValue(numArray);
	var integerMonzo4 = getValue(denArray);
	var remainderOffsetNum = reducedSavedNum / integerMonzo1;
	var remainderOffsetDen = reducedSavedDen / integerMonzo2; 
	var remainderInputNum = inputNumReduced / integerMonzo3;
	var remainderInputDen = inputDenReduced / integerMonzo4; 
	var ratioRemainderNum = remainderOffsetNum * remainderInputNum;
	var ratioRemainderDen = remainderOffsetDen * remainderInputDen; 
	reducedRatioRemainder = reduce(ratioRemainderNum,ratioRemainderDen);
	if ($("#ratioInput").prop("checked")){
		displayNumValue = getValue(displayOtonalArray) * reducedRatioRemainder[0];
		displayDenValue = getValue(displayUtonalArray) * reducedRatioRemainder[1];
	} else {
		displayNumValue = getValue(displayOtonalArray);
		displayDenValue = getValue(displayUtonalArray);
	}
	//optionally normalizes output 
	if ($("#normalize").prop("checked")){
		var normTest = Math.log2(Math.abs(displayNumValue / displayDenValue));
		if (normTest < 0){
			normTest = 1 + Math.floor(Math.abs(normTest));
			normTest = Math.pow(2,normTest);
			displayNumValue = normTest * displayNumValue;
		} else if (normTest > 1) {
			normTest = Math.floor(normTest);
			normTest = Math.pow(2,normTest);
			displayDenValue = normTest * displayDenValue;
		}
		var reduceNormalized = reduce(displayNumValue,displayDenValue);
		displayNumValue = reduceNormalized[0];
		displayDenValue = reduceNormalized[1];
	}
	if (displayNumValue <= 9007199254740991 && displayDenValue <= 9007199254740991){
		$("#num").text(displayNumValue);
		$("#den").text(displayDenValue);
		var displayNumArray = getArray(displayNumValue);
		var displayDenArray = getArray(displayDenValue);
		var displayMeldoicSum = displayNumArray.DiffArray(displayDenArray);
		$("#monzo").text(displayMeldoicSum);
		if (reducedRatioRemainder[0] > 1 && reducedRatioRemainder[1] > 1){
			monzoMessage = "× ( " + reducedRatioRemainder[0] + " / " + reducedRatioRemainder[1] + " )";
		} else if (reducedRatioRemainder[0] > 1) {
			monzoMessage = "× ( " + reducedRatioRemainder[0] + " / 1 )";
		} else if (reducedRatioRemainder[1] > 1) {
			monzoMessage = "× ( 1 / " + reducedRatioRemainder[1] + " )";
		}
		$("#over31Message").text(monzoMessage);
	} else {
		var float = displayNumValue / displayDenValue;
		$("#num").text(float);
		$("#den").text(1);
		$("#monzo").text("stack overflow");
		$("#over31Message").text("");
	}
}

function getCentDeviation(){ //calculate cent deviation, interval to ref (corrected if tuning metre setting is unlinked)
	if ($("#paletteInput").prop("checked")){ 
		var centsSum = inputSum
		.SumArray(refOctave[getRefOctave()]) 
		.SumArray(refNote[getRefNote()]) 
		.SumArray(refAccidental[getRefAccidental()]);
	} else if ($("#ratioInput").prop("checked")){ 
		var centsSum = inputSum;
	}
	var centsOtonalArray = centsSum.map(value => {
		return value < 0 ? 0 : value;
	});
	var centsUtonalArray = centsSum.map(value => {
		return value < 0 ? Math.abs(value) : 0;
	});
	var centsNumValue = getValue(centsOtonalArray);
	var centsDenValue = getValue(centsUtonalArray);
	if ($("#ratioInput").prop("checked")){
			jiCents = 1200*Math.log2((displayNumValue) / (displayDenValue) 
			/ (kammerTon 
			/ (freq1to1
			/ Math.pow(2, (frequencyOctave[getFrequencyOctave()] / 12)) 
			/ Math.pow(2, (frequencyNote[getFrequencyNote()] / 12)) 
			/ Math.pow(2, (frequencyAccidental[getFrequencyAccidental()] / 12))))); 
	} else {
		jiCents = 1200*Math.log2((centsNumValue) / (centsDenValue)
			/ (kammerTon 
			/ (freq1to1
			/ Math.pow(2, (frequencyOctave[getFrequencyOctave()] / 12)) 
			/ Math.pow(2, (frequencyNote[getFrequencyNote()] / 12)) 
			/ Math.pow(2, (frequencyAccidental[getFrequencyAccidental()] / 12))))); 
	}
	// harmonic series as number of 12-ED2 semitones
	var et2 = (centsSum[0] * 12);
	var et3 = (centsSum[1] * 19);
	var et5 = (centsSum[2] * 28);
	var et7 = (centsSum[3] * 34);
	var et11 = (centsSum[4] * 41);
	var et13 = (centsSum[5] * 45);
	var et17 = (centsSum[6] * 49);
	var et19 = (centsSum[7] * 51);
	var et23 = (centsSum[8] * 54);
	var et29 = (centsSum[9] * 58);
	var et31 = (centsSum[10] * 60);
	var et37 = (centsSum[11] * 62);
	var et41 = (centsSum[12] * 64);
	var et43 = (centsSum[13] * 65);
	var et47 = (centsSum[14] * 67);
	var etSemiTones = (et2 + et3 + et5 + et7 + et11 + et13 + et17 + et19 + et23 + et29 + et31 + et37 + et41 + et43 + et47);
	var etCents = etSemiTones * 100.0;
	centDeviation = mod((jiCents - etCents),100);
	if (centDeviation > 50){
		centDeviation = -(100.0 - centDeviation);
	}
	if (centDeviation < 50) {
		$("#cents").text("+" + centDeviation.toFixed(precision) + " cents");
	} 
	if (centDeviation == 0){
		$("#cents").text("±" + centDeviation.toFixed(precision) + " cents");
	}
	if (centDeviation < 0){
		$("#cents").text(centDeviation.toFixed(precision) + " cents");
	}
	getBend();
	if ($("#ratioInput").prop("checked")){
			cents_toRef = 1200*Math.log2((displayNumValue) / (displayDenValue));
	} else {
		cents_toRef = 1200*Math.log2((centsNumValue) / (centsDenValue));
	}
	if ($("#normalize").prop("checked")){
		cents_toRef = mod(cents_toRef,1200);
	}
	if (cents_toRef > 0) {
		$("#JIgross").text("+"+cents_toRef.toFixed(precision) + " cents");
	} else{
		$("#JIgross").text(cents_toRef.toFixed(precision) + " cents");
	}
	//getEDOSteps();
}

function getOutputFrequency(){
	var outputFreq = freq1to1 * (displayNumValue / displayDenValue);
	$("#frequency").text(outputFreq.toFixed(precision)+" Hz");
}

// get/clear output values for ratio input / melodic distance check 
function getCurrentPitch(){
	savedNum = displayNumValue;
	savedDen = displayDenValue;
	$("#savedNum").val(savedNum);
	$("#savedDen").val(savedDen);
	getSavedInputSum();
}

function loadCurrentPitch(){
	inputNum = displayNumValue;
	inputDen = displayDenValue;
	$("#inputNum").val(inputNum);
	$("#inputDen").val(inputDen);
	getInputSum();
	doCalc(); 
}

function getSavedInputSum(){
	savedSmallestTerms = reduce(savedNum,savedDen);
	reducedSavedNum = savedSmallestTerms[0];
	reducedSavedDen = savedSmallestTerms[1];
	savedNumArray = getArray(reducedSavedNum);
	savedDenArray = getArray(reducedSavedDen);
	savedInputSum = savedNumArray
	.DiffArray(savedDenArray);
	doCalc(); 
}

function getMelodicReference(){
	melodicRefNum = displayNumValue;
	melodicRefDen = displayDenValue;
	$("#melodicRefNum").val(melodicRefNum);
	$("#melodicRefDen").val(melodicRefDen);
	getMelodicRatio();
}

function getMelodicCheck(){
	checkMelodicNum = displayNumValue;
	checkMelodicDen = displayDenValue;
	$("#checkMelodicNum").val(checkMelodicNum);
	$("#checkMelodicDen").val(checkMelodicDen);
	getMelodicRatio();
}

function clearSave(){
	savedNum = 1;
	savedDen = 1;
	savedInputSum = reference;
	$("#savedNum").val(savedNum);
	$("#savedDen").val(savedDen);
	getSavedInputSum();
}

function clearMelodicSave() {
	melodicRefNum = 1;
	melodicRefDen = 1;
	$("#melodicRefNum").val(melodicRefNum);
	$("#melodicRefDen").val(melodicRefDen);
	getMelodicRatio();
}

function clearMelodic() {
	checkMelodicNum = 1;
	checkMelodicDen = 1;
	$("#checkMelodicNum").val(checkMelodicNum);
	$("#checkMelodicDen").val(checkMelodicDen);
	getMelodicRatio();
}

function clearInputRatio() {
	inputNum = 1;
	inputDen = 1;
	$("#inputNum").val(inputNum);
	$("#inputDen").val(inputDen);
	doCalc();
}

// do the melodic distance calculation
function getMelodicRatio(){
	melodicNum = melodicRefDen * checkMelodicNum;
	melodicDen = melodicRefNum * checkMelodicDen;
	var reduceMelodic = reduce(melodicNum,melodicDen);
	$("#melodicNum").text(reduceMelodic[0]);
	$("#melodicDen").text(reduceMelodic[1]);
	melodicCents =  1200 * Math.log2(reduceMelodic[0] / reduceMelodic[1]);
	if (melodicCents > 0) {
		$("#melodicCents").text("+"+melodicCents.toFixed(precision) + " cents");
	} else {
		$("#melodicCents").text(melodicCents.toFixed(precision) + " cents");
	} 
	var melodicRefFreq = freq1to1 * (melodicRefNum / melodicRefDen);
	var checkFreq = freq1to1 * (checkMelodicNum / checkMelodicDen);
	var freqDiff = Math.abs(checkFreq - melodicRefFreq);
	$("#freqDiff").text(freqDiff.toFixed(precision)+" Hz");
	var melodicHD = Math.log2(reduceMelodic[0] * reduceMelodic[1]);
	$("#melodicHD").text(melodicHD.toFixed(precision));

	var melodicNumArray = getArray(reduceMelodic[0]);
	var melodicDenArray = getArray(reduceMelodic[1]);
	var meldoicSum = melodicNumArray.DiffArray(melodicDenArray);
	$("#monzoMelodic").text(meldoicSum);
	var integerMonzo5 = getValue(melodicNumArray);
	var integerMonzo6 = getValue(melodicDenArray);
	var remainderMelodicInputNum = melodicNum / integerMonzo5;
	var remainderMelodicInputDen = melodicDen / integerMonzo6; 
	var reducedMelodicRatioRemainder = reduce(remainderMelodicInputNum,remainderMelodicInputDen);
	var monzoMessageMelodic = "";
	if (reducedMelodicRatioRemainder[0] > 1 && reducedMelodicRatioRemainder[1] > 1){
		monzoMessageMelodic = "× ( " + reducedMelodicRatioRemainder[0] + " / " + reducedMelodicRatioRemainder[1] + " )";
	} else if (reducedMelodicRatioRemainder[0] > 1) {
		monzoMessageMelodic = "× ( " + reducedMelodicRatioRemainder[0] + " / 1 )";
	} else if (reducedMelodicRatioRemainder[1] > 1) {
		monzoMessageMelodic = "× ( 1 / " + reducedMelodicRatioRemainder[1] + " )";
	}
	$("#over31MessageMelodic").text(monzoMessageMelodic);
}

// clear all values stored in calc other than reference information
function doClear() {
	$("#paletteInput").click();
	$("#Anatural").click();
	$("#defaultOctave").click();
	$("#default3").click();
	$("#default5").click();
	$("#default7").click();
	$("#default11").click();
	$("#default13").click();
	$("#default17").click();
	$("#default19").click();
	$("#default23").click();
	$("#default29").click();
	$("#default31").click();
	$("#default37").click();
	$("#default41").click();
	$("#default43").click();
	$("#default47").click();
	savedNum = 1;
	savedDen = 1;
	$("#savedNum").val(savedNum);
	$("#savedDen").val(savedDen);
	inputNum = 1;
	inputDen = 1;
	$("#inputNum").val(inputNum);
	$("#inputDen").val(inputDen);
}

function clearFreq(){
	freq1to1 = 440;
	kammerTon = 440;
	edoQuantisation = 53;
	$("#1to1Frequency").val(freq1to1.toFixed(4));
	$("#frequencyA4").val(kammerTon.toFixed(4));
	$("#edoQuantisation").val(edoQuantisation);
	$("#edoSize").text(edoQuantisation);
	$("#defaultRefoctave").click();
	$("#defaultRefNote").click();
	$("#defaultRefAccidental").click();	
	$("#refFrequencyLinkedRadio").click();
	getOutputFrequency();
	//getEDOSteps();
}

// Load page with A-natural "input"
function sendA(){
	$("#paletteInput").click();
	$("#Anatural").click();
	$("#defaultOctave").click();
	$("#default3").click();
	$("#default5").click();
	$("#default7").click();
	$("#default11").click();
	$("#default13").click();
	$("#default17").click();
	$("#default19").click();
	$("#default23").click();
	$("#default29").click();
	$("#default31").click();
	$("#default37").click();
	$("#default41").click();
	$("#default43").click();
	$("#default47").click();
	doCalc();
	getFrequency1to1();
	getFrequencyKammerTon();
	getCurrentPitch();
	getMelodicRatio();
	getBend();
	//getEDOSteps();
}

// get HE notation output 
function getPC(){
	var inverseSum = inputSum
	.DiffArray(refOctave[getRefOctave()]) 
	.DiffArray(refNote[getRefNote()]) 
	.DiffArray(refAccidental[getRefAccidental()]);

	var referenceSum = refOctave[getRefOctave()] 
	.DiffArray(refNote[getRefNote()]) 
	.DiffArray(refAccidental[getRefAccidental()]);

	var refArray = referenceSum.ProductArray(tonalIdentity);

	if ($("#paletteInput").prop("checked")){
		tonalArray = inputSum.ProductArray(tonalIdentity);
	} else if ($("#ratioInput").prop("checked")){
		tonalArray = inverseSum.ProductArray(tonalIdentity);
	}
	var refArraySum = sum(refArray);
	var tonalArraySum = sum(tonalArray);
	var refpc = mod((refArraySum + 4),7); 
	var pc = mod((tonalArraySum + 4),7);
	var outputDiatonic = diatonicOutput[pc];
	var ref12;
	if (refpc == 0){
		ref12 = 5;
	} else if (refpc == 1){
		ref12 = 0;
	} else if (refpc == 2){
		ref12 = 7;
	} else if (refpc == 3){
		ref12 = 2;
	} else if (refpc == 4){
		ref12 = 9;
	} else if (refpc == 5){
		ref12 = 4;
	} else if (refpc == 6){
		ref12 = 11;
	}
	$("#refflat").click(function(c){ 
		ref12acc = 1; 
	})
	$("#refsharp").click(function(c){ 
		ref12acc = -1; 
	})
	$("#defaultRefAccidental").click(function(c){ 
		ref12acc = 0; 
	})
	var diat_to_refTempered = (diatonicTempered[pc] - diatonicTempered[refpc] + (100 * ref12acc) + 1200.0) % 1200.0;
	cents_from_diatonic_tempered = ((((cents_toRef % 1200.0) + 1200.0) % 1200.0) - diat_to_refTempered + 1200.0) % 1200.0;
	getBend();
	var refNat = 7 * ref12acc;
	var note = mod(((((ref12 * 100) + jiCents ) / 100).toFixed(0) - ref12acc),12);
	var refMidiNoteOutput = refMidiNote[note];
	var natural;
	var pythag;
	var septimal;
	var undecimal;
	var tridecimal;
	var seventeen;
	var nineteen;
	var twentyThree;
	var twentyNine;
	var thirtyOne;
	var thirtySeven;
	var fortyOne;
	var fortyThree;
	var fortySeven;
	var chromatic = tonalArraySum + 25;
	// display natural on diatonic pitch classes 
	if ((displaySum[1] - refNat + refpc - 4 == -4 || displaySum[1] - refNat + refpc - 4 == -3 || displaySum[1] - refNat + refpc - 4 == -2 || displaySum[1] - refNat + refpc - 4 == -1 || displaySum[1] - refNat + refpc - 4 == 0 || displaySum[1] - refNat + refpc - 4 == 1 || displaySum[1] - refNat + refpc - 4 == 2) && displaySum[2] == 0 && displaySum[3] == 0 && displaySum[4] == 0 && displaySum[5] == 0 && displaySum[6] == 0 && displaySum[7] == 0 && displaySum[8] == 0 && displaySum[9] == 0 && displaySum[10] == 0 && displaySum[11] == 0 && displaySum[12] == 0 && displaySum[13] == 0 && displaySum[14] == 0){
		natural = "n"; 
	} else {
		natural = "";
	}
	// rest of the combinations
	if (displaySum[2] == -4){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveUpUpUpUp[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveUpUpUpUp[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveUpUpUpUp[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveUpUpUpUp[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveUpUpUpUp[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveUpUpUpUp[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveUpUpUpUp[6];
		}
	} else if (displaySum[2] == -3){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveUpUpUp[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveUpUpUp[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveUpUpUp[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveUpUpUp[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveUpUpUp[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveUpUpUp[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveUpUpUp[6];
		}
	} else if (displaySum[2] == -2){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveUpUp[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveUpUp[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveUpUp[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveUpUp[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveUpUp[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveUpUp[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveUpUp[6];
		}
	} else if (displaySum[2] == -1){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveUp[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveUp[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveUp[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveUp[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveUp[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveUp[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveUp[6];
		}
	} else if (displaySum[2] == 0){
		if (chromatic >= 0 && chromatic <= 6){
			pythag = pythagOutput[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = pythagOutput[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = pythagOutput[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = pythagOutput[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = pythagOutput[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = pythagOutput[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = pythagOutput[6];
		}
	} else if (displaySum[2] == 1){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveDown[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveDown[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveDown[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveDown[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveDown[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveDown[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveDown[6];
		}
	} else if (displaySum[2] == 2){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveDownDown[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveDownDown[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveDownDown[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveDownDown[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveDownDown[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveDownDown[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveDownDown[6];
		}
	} else if (displaySum[2] == 3){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveDownDownDown[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveDownDownDown[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveDownDownDown[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveDownDownDown[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveDownDownDown[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveDownDownDown[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveDownDownDown[6];
		}
	} else if (displaySum[2] == 4){
		if (chromatic>=0 && chromatic <= 6){
			pythag = fiveDownDownDownDown[0];
		} else if (chromatic >= 7 && chromatic <= 13){
			pythag = fiveDownDownDownDown[1];
		} else if (chromatic >= 14 && chromatic <= 20){
			pythag = fiveDownDownDownDown[2];
		} else if (chromatic >= 21 && chromatic <= 27){
			pythag = fiveDownDownDownDown[3];
		} else if (chromatic >= 28 && chromatic <= 34){
			pythag = fiveDownDownDownDown[4];
		} else if (chromatic >= 35 && chromatic <= 41){
			pythag = fiveDownDownDownDown[5];
		} else if (chromatic >= 42 && chromatic <= 48){
			pythag = fiveDownDownDownDown[6];
		}
	}
	if (displaySum[3] == -3){
		septimal = septimalSymbols[6];
	} else if (displaySum[3] == -2){
		septimal = septimalSymbols[5];
	} else if (displaySum[3] == -1){
		septimal = septimalSymbols[4];
	} else if (displaySum[3] == 0){
		septimal = septimalSymbols[3];
	} else if (displaySum[3] == 1){
		septimal = septimalSymbols[2];
	} else if (displaySum[3] == 2){
		septimal = septimalSymbols[1];
	} else if (displaySum[3] == 3){
		septimal = septimalSymbols[0];
	} 
	if (displaySum[4] == 3){
		undecimal = undecimalSymbols[6];
	} else if (displaySum[4] == 2){
		undecimal = undecimalSymbols[5];
	} else if (displaySum[4] == 1){
		undecimal = undecimalSymbols[4];
	} else if (displaySum[4] == 0){
		undecimal = undecimalSymbols[3];
	} else if (displaySum[4] == -1){
		undecimal = undecimalSymbols[2];
	} else if (displaySum[4] == -2){
		undecimal = undecimalSymbols[1];
	} else if (displaySum[4] == -3){
		undecimal = undecimalSymbols[0];
	} 
	if (displaySum[5] == -3){
		tridecimal = tridecimalSymbols[6];
	} else if (displaySum[5] == -2){
		tridecimal = tridecimalSymbols[5];
	} else if (displaySum[5] == -1){
		tridecimal = tridecimalSymbols[4];
	} else if (displaySum[5] == 0){
		tridecimal = tridecimalSymbols[3];
	} else if (displaySum[5] == 1){
		tridecimal = tridecimalSymbols[2];
	} else if (displaySum[5] == 2){
		tridecimal = tridecimalSymbols[1];
	} else if (displaySum[5] == 3){
		tridecimal = tridecimalSymbols[0];
	} 
	if (displaySum[6] == -3){
		seventeen = seventeenSymbols[6];
	} else if (displaySum[6] == -2){
		seventeen = seventeenSymbols[5];
	} else if (displaySum[6] == -1){
		seventeen = seventeenSymbols[4];
	} else if (displaySum[6] == 0){
		seventeen = seventeenSymbols[3];
	} else if (displaySum[6] == 1){
		seventeen = seventeenSymbols[2];
	} else if (displaySum[6] == 2){
		seventeen = seventeenSymbols[1];
	} else if (displaySum[6] == 3){
		seventeen = seventeenSymbols[0];
	}
	if (displaySum[7] == -3){
		nineteen = nineteenSymbols[0];
	} else if (displaySum[7] == -2){
		nineteen = nineteenSymbols[1];
	} else if (displaySum[7] == -1){
		nineteen = nineteenSymbols[2];
	} else if (displaySum[7] == 0){
		nineteen = nineteenSymbols[3];
	} else if (displaySum[7] == 1){
		nineteen = nineteenSymbols[4];
	} else if (displaySum[7] == 2){
		nineteen = nineteenSymbols[5];
	} else if (displaySum[7] == 3){
		nineteen = nineteenSymbols[6];
	}
	if (displaySum[8] == -3){
		twentyThree = twentyThreeSymbols[0];
	} else if (displaySum[8] == -2){
		twentyThree = twentyThreeSymbols[1];
	} else if (displaySum[8] == -1){
		twentyThree = twentyThreeSymbols[2];
	} else if (displaySum[8] == 0){
		twentyThree = twentyThreeSymbols[3];
	} else if (displaySum[8] == 1){
		twentyThree = twentyThreeSymbols[4];
	} else if (displaySum[8] == 2){
		twentyThree = twentyThreeSymbols[5];
	} else if (displaySum[8] == 3){
		twentyThree = twentyThreeSymbols[6];
	}
	if (displaySum[9] == 3){
		twentyNine = twentyNineSymbols[6];
	} else if (displaySum[9] == 2){
		twentyNine = twentyNineSymbols[5];
	} else if (displaySum[9] == 1){
		twentyNine = twentyNineSymbols[4];
	} else if (displaySum[9] == 0){
		twentyNine = twentyNineSymbols[3];
	} else if (displaySum[9] == -1){
		twentyNine = twentyNineSymbols[2];
	} else if (displaySum[9] == -2){
		twentyNine = twentyNineSymbols[1];
	} else if (displaySum[9] == -3){
		twentyNine = twentyNineSymbols[0];
	}
	if (displaySum[10] == -3){
		thirtyOne = thirtyOneSymbols[6];
	} else if (displaySum[10] == -2){
		thirtyOne = thirtyOneSymbols[5];
	} else if (displaySum[10] == -1){
		thirtyOne = thirtyOneSymbols[4];
	} else if (displaySum[10] == 0){
		thirtyOne = thirtyOneSymbols[3];
	} else if (displaySum[10] == 1){
		thirtyOne = thirtyOneSymbols[2];
	} else if (displaySum[10] == 2){
		thirtyOne = thirtyOneSymbols[1];
	} else if (displaySum[10] == 3){
		thirtyOne = thirtyOneSymbols[0];
	}
	if (displaySum[11] == 3){
		thirtySeven = thirtySevenSymbols[6];
	} else if (displaySum[11] == 2){
		thirtySeven = thirtySevenSymbols[5];
	} else if (displaySum[11] == 1){
		thirtySeven = thirtySevenSymbols[4];
	} else if (displaySum[11] == 0){
		thirtySeven = thirtySevenSymbols[3];
	} else if (displaySum[11] == -1){
		thirtySeven = thirtySevenSymbols[2];
	} else if (displaySum[11] == -2){
		thirtySeven = thirtySevenSymbols[1];
	} else if (displaySum[11] == -3){
		thirtySeven = thirtySevenSymbols[0];
	}
	if (displaySum[12] == 3){
		fortyOne = fortyOneSymbols[6];
	} else if (displaySum[12] == 2){
		fortyOne = fortyOneSymbols[5];
	} else if (displaySum[12] == 1){
		fortyOne = fortyOneSymbols[4];
	} else if (displaySum[12] == 0){
		fortyOne = fortyOneSymbols[3];
	} else if (displaySum[12] == -1){
		fortyOne = fortyOneSymbols[2];
	} else if (displaySum[12] == -2){
		fortyOne = fortyOneSymbols[1];
	} else if (displaySum[12] == -3){
		fortyOne = fortyOneSymbols[0];
	}
	if (displaySum[13] == 3){
		fortyThree = fortyThreeSymbols[6];
	} else if (displaySum[13] == 2){
		fortyThree = fortyThreeSymbols[5];
	} else if (displaySum[13] == 1){
		fortyThree = fortyThreeSymbols[4];
	} else if (displaySum[13] == 0){
		fortyThree = fortyThreeSymbols[3];
	} else if (displaySum[13] == -1){
		fortyThree = fortyThreeSymbols[2];
	} else if (displaySum[13] == -2){
		fortyThree = fortyThreeSymbols[1];
	} else if (displaySum[13] == -3){
		fortyThree = fortyThreeSymbols[0];
	}
	if (displaySum[14] == 3){
		fortySeven = fortySevenSymbols[6];
	} else if (displaySum[14] == 2){
		fortySeven = fortySevenSymbols[5];
	} else if (displaySum[14] == 1){
		fortySeven = fortySevenSymbols[4];
	} else if (displaySum[14] == 0){
		fortySeven = fortySevenSymbols[3];
	} else if (displaySum[14] == -1){
		fortySeven = fortySevenSymbols[2];
	} else if (displaySum[14] == -2){
		fortySeven = fortySevenSymbols[1];
	} else if (displaySum[14] == -3){
		fortySeven = fortySevenSymbols[0];
	}
	var notationString;
	var undefinedNotation;
	if ($("#ratioInput").prop("checked") && (fortySeven == null || fortyThree == null || fortyOne == null || thirtySeven == null || thirtyOne == null || twentyNine == null || twentyThree == null || nineteen == null || seventeen == null || tridecimal == null || undecimal == null || septimal == null || pythag == null || natural == null || reducedRatioRemainder[0] > 1 || reducedRatioRemainder[1] > 1)) {
		notationString = "";
		outputDiatonic = "";
		undefinedNotation = "undefined";
	} else {
		notationString = fortySeven + fortyThree + fortyOne + thirtySeven + thirtyOne + twentyNine + twentyThree +  nineteen + seventeen + tridecimal + undecimal + septimal + pythag + natural;
		undefinedNotation = "";
		monzoMessage = "";
	}
	$("#notationOutput").html(notationString);
	$("#noteName").html(outputDiatonic);
	$("#undefinedNotation").html(undefinedNotation);
	$("#midiNote").text(refMidiNoteOutput);
}

function getBend() {
	if ($("#bendParameter").val() == 1) {
		if ($("#refFrequencyFreeRadio").prop("checked")) {
			var diatonicCentsDiff = cents_from_diatonic_tempered - (1200 * Math.log2(kammerTon / 440));
		} else {
			var diatonicCentsDiff = cents_from_diatonic_tempered;
		}
		if (diatonicCentsDiff > 600.0) {
			diatonicCentsDiff = diatonicCentsDiff - 1200.0;
		}
		// Sibelius pitch bend
		var sibelius_z = Math.round(diatonicCentsDiff / (sibeliusRange/2) * 128 * 32);
		var sibelius_delta = Math.floor(sibelius_z / 128);
		var sibelius_x = 64 + sibelius_delta;
		var sibelius_y = Math.round(sibelius_z - (sibelius_delta*128));
		if (sibelius_x < 0 || sibelius_x > 127) {
			$("#sibelius_bend").text("out of range");
		} else {
			$("#sibelius_bend").text("~B "+sibelius_y+","+sibelius_x);
		}
		// Finale bend
		var xbend_delta = Math.round((diatonicCentsDiff / (midiRange/8192)));
		if (xbend_delta < -8191 || xbend_delta > 8192) {
			$("#xbend").text("out of range");
		} else {	
			$("#xbend").text(xbend_delta);
		}

		// Musescore bend
		if (diatonicCentsDiff > 200 || diatonicCentsDiff < -200) {
			$("#musescore_cents").text("out of range");
		} else {
			$("#musescore_cents").text(diatonicCentsDiff.toFixed(2));
		}
	} else {
		var sibelius_z = Math.round(centDeviation / (sibeliusRange/2) * 128 * 32);
		var sibelius_delta = Math.floor(sibelius_z / 128);
		var sibelius_x = 64 + sibelius_delta;
		var sibelius_y = Math.round(sibelius_z - (sibelius_delta*128));
		$("#sibelius_bend").text("~B "+sibelius_y+","+sibelius_x);

		// Finale bend
		var xbend_delta = Math.round((centDeviation / (midiRange/8192)));
			$("#xbend").text(xbend_delta);

		// Musescore bend
		$("#musescore_cents").text(centDeviation.toFixed(2));
	} 
}

function getEnharmonics(){ //search for enharmonic proximities
	empty();
	var filter3;
	var filter5;
	var filter7;
	var filter11;
	var filter13;
	var filter17;
	var filter19;
	var filter23;
	var filter29;
	var ajax = new XMLHttpRequest();
	var url = "data.php";
	var asynchronous = true;
	var centValue;
	var sort;
	var listSize;
	var maxAcc = 2;

	if ($("#enharmonicCentsRadio").prop("checked")){
		centValue = $("#centreCents").val() % 1200;
		while ($("#centreCents").val() < 0){
			centValue = centValue + 1200.0;
		}
	} else {
		var currentFreq = $("#frequencyInput").val();
		var centDiff = (1200*Math.log2((currentFreq) / (freq1to1))) % 1200;
		while (centDiff < 0){
			centDiff = centDiff + 1200.0;
		}
		centValue = centDiff;
	}

	if ($("#acc_1").prop("checked")){
		maxAcc = 1;
	} else if ($("#acc_2").prop("checked")){
		maxAcc = 2;
	} else if ($("#acc_3").prop("checked")){
		maxAcc = 3;
	}
	
	var centRange = $("#rangeCents").val();
	var hdMin = $("#minHD").val();
	var hdMax = $("#maxHD").val();
	
	if ($("#filter3").prop("checked")){
		filter3 = "(monzo3<0 OR monzo3=0 OR monzo3>0)";
	} else {
		filter3 = "monzo3=0";
	}
	if ($("#filter5").prop("checked")){
		filter5 = "(monzo5<0 OR monzo5=0 OR monzo5>0)";
	} else {
		filter5 = "monzo5=0";
	}
	if ($("#filter7").prop("checked")){
		filter7 = "(monzo7<0 OR monzo7=0 OR monzo7>0)";
	} else {
		filter7 = "monzo7=0";
	}
	if ($("#filter11").prop("checked")){
		filter11 = "(monzo11<0 OR monzo11=0 OR monzo11>0)";
	} else {
		filter11 = "monzo11=0";
	}
	if ($("#filter13").prop("checked")){
		filter13 = "(monzo13<0 OR monzo13=0 OR monzo13>0)";
	} else {
		filter13 = "monzo13=0";
	}
	if ($("#filter17").prop("checked")){
		filter17 = "(monzo17<0 OR monzo17=0 OR monzo17>0)";
	} else {
		filter17 = "monzo17=0";
	}
	if ($("#filter19").prop("checked")){
		filter19 = "(monzo19<0 OR monzo19=0 OR monzo19>0)";
	} else {
		filter19 = "monzo19=0";
	}
	if ($("#filter23").prop("checked")){
		filter23 = "(monzo23<0 OR monzo23=0 OR monzo23>0)";
	} else {
		filter23 = "monzo23=0";
	}
	if ($("#filter29").prop("checked")){
		filter29 = "(monzo29<0 OR monzo29=0 OR monzo29>0)";
	} else {
		filter29 = "monzo29=0";
	}
	if ($("#hdSort").prop("checked")){
		sort = "ORDER BY hd ASC";
	} else {
		sort = "ORDER BY cents ASC";
	}

	var currentRefNote = getRefNote();
	var currentRefAccidental = getRefAccidental();
	
	var vars = "centValue="+centValue+"&centRange="+centRange+"&hdMin="+hdMin+"&hdMax="+hdMax+"&filter3="+filter3+
	"&filter5="+filter5+"&filter7="+filter7+"&filter11="+filter11+"&filter13="+filter13+"&filter17="+filter17+
	"&filter19="+filter19+"&filter23="+filter23+"&filter29="+filter29+"&maxAcc="+maxAcc+"&currentRefNote="+currentRefNote+
	"&currentRefAccidental="+currentRefAccidental+"&sort="+sort;

	ajax.open("POST", url, asynchronous);
	ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	// sending request
	ajax.send(vars);
	// receiving response from data.php
	ajax.onreadystatechange = function(){
		Array.prototype.SumArray = function (arr) { // sum two arrays by element 
			var sum = [];
			if (arr != null && this.length == arr.length) {
				for (var i = 0; i < arr.length; i++) {
					sum.push(this[i] + arr[i]);
				}
			}
			return sum;
		} 
		if (ajax.readyState == 4 && ajax.status == 200){
			// converting JSON back to array
			var data = JSON.parse(ajax.responseText);
			// console.log(data); // for debugging
			// html value for <tbody>
			var html = "";
			// loop through the data
			for (var a = 0; a < data.length; a++){
				monzoArray = (data[a].monzo);
				power3[a] = data[a].monzo3;
				var integer3 = parseInt(power3[a], 10);

				power5[a] = data[a].monzo5;
				var integer5 = parseInt(power5[a], 10);

				power7[a] = data[a].monzo7;
				var integer7 = parseInt(power7[a], 10);

				power11[a] = data[a].monzo11;
				var integer11 = parseInt(power11[a], 10);

				power13[a] = data[a].monzo13;
				var integer13 = parseInt(power13[a], 10);

				power17[a] = data[a].monzo17;
				var integer17 = parseInt(power17[a], 10);

				power19[a] = data[a].monzo19;
				var integer19 = parseInt(power19[a], 10);

				power23[a] = data[a].monzo23;
				var integer23 = parseInt(power23[a], 10);

				power29[a] = data[a].monzo29;
				var integer29 = parseInt(power29[a], 10);

				cents[a] = data[a].cents;
				harmD[a] = data[a].hd;
				delta[a] = ((data[a].cents - centValue).toFixed(precision));
				accCount[a] = data[a].acc;
				diatPC[a] = data[a].diat;
				acc3[a] = data[a].acc_3;

				var monzoEN = [0,integer3,integer5,integer7,integer11,integer13,integer17,integer19,integer23,integer29,0];
				var monzoArrayInt = monzoEN
					.DiffArray(refOctave[getRefOctave()]) 
					.DiffArray(refNote[getRefNote()]) 
					.DiffArray(refAccidental[getRefAccidental()]);

				bigArray[a] = monzoArrayInt;
				displayBigArray[a] = monzoEN;
				}

				if ($("#outputSize").val() <= data.length){
					listSize = $("#outputSize").val();
				} else {
					listSize = data.length;
				}

				for (var a = 0; a < listSize; a++){

				var referenceSumEN = refOctave[getRefOctave()] 
					.DiffArray(refNote[getRefNote()]) 
					.DiffArray(refAccidental[getRefAccidental()])
					.ProductArray([0,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
				var refArrayEN = referenceSumEN.ProductArray(tonalIdentity);
				var	tonalArrayEN = bigArray[a].ProductArray(tonalIdentity);
				var refArraySumEN = sum(refArrayEN);
				var tonalArraySumEN = sum(tonalArrayEN);
				var pcEN = mod((tonalArraySumEN + 4),7);
				var outputDiatonicEN = diatonicOutput[pcEN];
				var naturalEN;
				var pythagEN;
				var septimalEN;
				var undecimalEN;
				var tridecimalEN;
				var seventeenEN;
				var nineteenEN;
				var twentyThreeEN;
				var twentyNineEN;
				var thirtyOneEN;
				var thirtySevenEN;
				var fortyOneEN;
				var fortyThreeEN;
				var fortySevenEN;
				var chromaticEN = tonalArraySumEN + 25;
				// display natural on diatonic pitch classes 
				if ((bigArray[a][1] == -4 || bigArray[a][1] == -3 || bigArray[a][1] == -2 || bigArray[a][1] == -1 || bigArray[a][1] == 0 || bigArray[a][1] == 1 || bigArray[a][1] == 2) && bigArray[a][2] == 0 && bigArray[a][3] == 0 && bigArray[a][4] == 0 && bigArray[a][5] == 0 && bigArray[a][6] == 0 && bigArray[a][7] == 0 && bigArray[a][8] == 0 && bigArray[a][9] == 0 && bigArray[a][10] == 0 && bigArray[a][11] == 0 && bigArray[a][12] == 0 && bigArray[a][13] == 0 && bigArray[a][14] == 0){
					naturalEN = "n"; 
				} else {
					naturalEN = "";
				}
				// rest of the combinations
				if (bigArray[a][2] == -4){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveUpUpUpUp[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveUpUpUpUp[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveUpUpUpUp[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveUpUpUpUp[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveUpUpUpUp[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = fiveUpUpUpUp[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveUpUpUpUp[6];
					}
				} else if (bigArray[a][2] == -3){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveUpUpUp[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveUpUpUp[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveUpUpUp[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveUpUpUp[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveUpUpUp[4];
					} else if (chromaticEN>= 35 && chromaticEN <= 41){
						pythagEN = fiveUpUpUp[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveUpUpUp[6];
					}
				} else if (bigArray[a][2] == -2){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveUpUp[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveUpUp[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveUpUp[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveUpUp[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveUpUp[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = fiveUpUp[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveUpUp[6];
					}
				} else if (bigArray[a][2] == -1){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveUp[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveUp[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveUp[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveUp[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveUp[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = fiveUp[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveUp[6];
					}
				} else if (bigArray[a][2] == 0){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = pythagOutput[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = pythagOutput[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = pythagOutput[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = pythagOutput[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = pythagOutput[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = pythagOutput[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = pythagOutput[6];
					}
				} else if (bigArray[a][2] == 1){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveDown[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveDown[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveDown[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveDown[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveDown[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = fiveDown[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveDown[6];
					}
				} else if (bigArray[a][2] == 2){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveDownDown[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveDownDown[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveDownDown[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveDownDown[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveDownDown[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = fiveDownDown[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveDownDown[6];
					}
				} else if (bigArray[a][2] == 3){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveDownDownDown[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveDownDownDown[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveDownDownDown[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveDownDownDown[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveDownDownDown[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = fiveDownDownDown[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveDownDownDown[6];
					}
				} else if (bigArray[a][2] == 4){
					if (chromaticEN >= 0 && chromaticEN <= 6){
						pythagEN = fiveDownDownDownDown[0];
					} else if (chromaticEN >= 7 && chromaticEN <= 13){
						pythagEN = fiveDownDownDownDown[1];
					} else if (chromaticEN >= 14 && chromaticEN <= 20){
						pythagEN = fiveDownDownDownDown[2];
					} else if (chromaticEN >= 21 && chromaticEN <= 27){
						pythagEN = fiveDownDownDownDown[3];
					} else if (chromaticEN >= 28 && chromaticEN <= 34){
						pythagEN = fiveDownDownDownDown[4];
					} else if (chromaticEN >= 35 && chromaticEN <= 41){
						pythagEN = fiveDownDownDownDown[5];
					} else if (chromaticEN >= 42 && chromaticEN <= 48){
						pythagEN = fiveDownDownDownDown[6];
					}
				}
				if (bigArray[a][3] == -3){
					septimalEN = septimalSymbols[6];
				} else if (bigArray[a][3] == -2){
					septimalEN = septimalSymbols[5];
				} else if (bigArray[a][3] == -1){
					septimalEN = septimalSymbols[4];
				} else if (bigArray[a][3] == 0){
					septimalEN = septimalSymbols[3];
				} else if (bigArray[a][3] == 1){
					septimalEN = septimalSymbols[2];
				} else if (bigArray[a][3] == 2){
					septimalEN = septimalSymbols[1];
				} else if (bigArray[a][3] == 3){
					septimalEN = septimalSymbols[0];
				} 
				if (bigArray[a][4] == 3){
					undecimalEN = undecimalSymbols[6];
				} else if (bigArray[a][4] == 2){
					undecimalEN = undecimalSymbols[5];
				} else if (bigArray[a][4] == 1){
					undecimalEN = undecimalSymbols[4];
				} else if (bigArray[a][4] == 0){
					undecimalEN = undecimalSymbols[3];
				} else if (bigArray[a][4] == -1){
					undecimalEN = undecimalSymbols[2];
				} else if (bigArray[a][4] == -2){
					undecimalEN = undecimalSymbols[1];
				} else if (bigArray[a][4] == -3){
					undecimalEN = undecimalSymbols[0];
				} 
				if (bigArray[a][5] == -3){
					tridecimalEN = tridecimalSymbols[6];
				} else if (bigArray[a][5] == -2){
					tridecimalEN = tridecimalSymbols[5];
				} else if (bigArray[a][5] == -1){
					tridecimalEN = tridecimalSymbols[4];
				} else if (bigArray[a][5] == 0){
					tridecimalEN = tridecimalSymbols[3];
				} else if (bigArray[a][5] == 1){
					tridecimalEN = tridecimalSymbols[2];
				} else if (bigArray[a][5] == 2){
					tridecimalEN = tridecimalSymbols[1];
				} else if (bigArray[a][5] == 3){
					tridecimalEN = tridecimalSymbols[0];
				} 
				if (bigArray[a][6] == -3){
					seventeenEN = seventeenSymbols[6];
				} else if (bigArray[a][6] == -2){
					seventeenEN = seventeenSymbols[5];
				} else if (bigArray[a][6] == -1){
					seventeenEN = seventeenSymbols[4];
				} else if (bigArray[a][6] == 0){
					seventeenEN = seventeenSymbols[3];
				} else if (bigArray[a][6] == 1){
					seventeenEN = seventeenSymbols[2];
				} else if (bigArray[a][6] == 2){
					seventeenEN = seventeenSymbols[1];
				} else if (bigArray[a][6] == 3){
					seventeenEN = seventeenSymbols[0];
				}
				if (bigArray[a][7] == -3){
					nineteenEN = nineteenSymbols[0];
				} else if (bigArray[a][7] == -2){
					nineteenEN = nineteenSymbols[1];
				} else if (bigArray[a][7] == -1){
					nineteenEN = nineteenSymbols[2];
				} else if (bigArray[a][7] == 0){
					nineteenEN = nineteenSymbols[3];
				} else if (bigArray[a][7] == 1){
					nineteenEN = nineteenSymbols[4];
				} else if (bigArray[a][7] == 2){
					nineteenEN = nineteenSymbols[5];
				} else if (bigArray[a][7] == 3){
					nineteenEN = nineteenSymbols[6];
				}
				if (bigArray[a][8] == -3){
					twentyThreeEN = twentyThreeSymbols[0];
				} else if (bigArray[a][8] == -2){
					twentyThreeEN = twentyThreeSymbols[1];
				} else if (bigArray[a][8] == -1){
					twentyThreeEN = twentyThreeSymbols[2];
				} else if (bigArray[a][8] == 0){
					twentyThreeEN = twentyThreeSymbols[3];
				} else if (bigArray[a][8] == 1){
					twentyThreeEN = twentyThreeSymbols[4];
				} else if (bigArray[a][8] == 2){
					twentyThreeEN = twentyThreeSymbols[5];
				} else if (bigArray[a][8] == 3){
					twentyThreeEN = twentyThreeSymbols[6];
				}
				if (bigArray[a][9] == 3){
					twentyNineEN = twentyNineSymbols[6];
				} else if (bigArray[a][9] == 2){
					twentyNineEN = twentyNineSymbols[5];
				} else if (bigArray[a][9] == 1){
					twentyNineEN = twentyNineSymbols[4];
				} else if (bigArray[a][9] == 0){
					twentyNineEN = twentyNineSymbols[3];
				} else if (bigArray[a][9] == -1){
					twentyNineEN = twentyNineSymbols[2];
				} else if (bigArray[a][9] == -2){
					twentyNineEN = twentyNineSymbols[1];
				} else if (bigArray[a][9] == -3){
					twentyNineEN = twentyNineSymbols[0];
				}
				if (bigArray[a][10] == -3){
					thirtyOneEN = thirtyOneSymbols[6];
				} else if (bigArray[a][10] == -2){
					thirtyOneEN = thirtyOneSymbols[5];
				} else if (bigArray[a][10] == -1){
					thirtyOneEN = thirtyOneSymbols[4];
				} else if (bigArray[a][10] == 0){
					thirtyOneEN = thirtyOneSymbols[3];
				} else if (bigArray[a][10] == 1){
					thirtyOneEN = thirtyOneSymbols[2];
				} else if (bigArray[a][10] == 2){
					thirtyOneEN = thirtyOneSymbols[1];
				} else if (bigArray[a][10] == 3){
					thirtyOneEN = thirtyOneSymbols[0];
				}
				if (bigArray[a][11] == 3){
					thirtySevenEN = thirtySevenSymbols[6];
				} else if (bigArray[a][11] == 2){
					thirtySevenEN = thirtySevenSymbols[5];
				} else if (bigArray[a][11] == 1){
					thirtySevenEN = thirtySevenSymbols[4];
				} else if (bigArray[a][11] == 0){
					thirtySevenEN = thirtySevenSymbols[3];
				} else if (bigArray[a][11] == -1){
					thirtySevenEN = thirtySevenSymbols[2];
				} else if (bigArray[a][11] == -2){
					thirtySevenEN = thirtySevenSymbols[1];
				} else if (bigArray[a][11] == -3){
					thirtySevenEN = thirtySevenSymbols[0];
				}
				if (bigArray[a][12] == 3){
					fortyOneEN = fortyOneSymbols[6];
				} else if (bigArray[a][12] == 2){
					fortyOneEN = fortyOneSymbols[5];
				} else if (bigArray[a][12] == 1){
					fortyOneEN = fortyOneSymbols[4];
				} else if (bigArray[a][12] == 0){
					fortyOneEN = fortyOneSymbols[3];
				} else if (bigArray[a][12] == -1){
					fortyOneEN = fortyOneSymbols[2];
				} else if (bigArray[a][12] == -2){
					fortyOneEN = fortyOneSymbols[1];
				} else if (bigArray[a][12] == -3){
					fortyOneEN = fortyOneSymbols[0];
				}
				if (bigArray[a][13] == 3){
					fortyThreeEN = fortyThreeSymbols[6];
				} else if (bigArray[a][13] == 2){
					fortyThreeEN = fortyThreeSymbols[5];
				} else if (bigArray[a][13] == 1){
					fortyThreeEN = fortyThreeSymbols[4];
				} else if (bigArray[a][13] == 0){
					fortyThreeEN = fortyThreeSymbols[3];
				} else if (bigArray[a][13] == -1){
					fortyThreeEN = fortyThreeSymbols[2];
				} else if (bigArray[a][13] == -2){
					fortyThreeEN = fortyThreeSymbols[1];
				} else if (bigArray[a][13] == -3){
					fortyThreeEN = fortyThreeSymbols[0];
				}
				if (bigArray[a][14] == 3){
					fortySevenEN = fortySevenSymbols[6];
				} else if (bigArray[a][14] == 2){
					fortySevenEN = fortySevenSymbols[5];
				} else if (bigArray[a][14] == 1){
					fortySevenEN = fortySevenSymbols[4];
				} else if (bigArray[a][14] == 0){
					fortySevenEN = fortySevenSymbols[3];
				} else if (bigArray[a][14] == -1){
					fortySevenEN = fortySevenSymbols[2];
				} else if (bigArray[a][14] == -2){
					fortySevenEN = fortySevenSymbols[1];
				} else if (bigArray[a][14] == -3){
					fortySevenEN = fortySevenSymbols[0];
				}
				var notationStringEN;
				var undefinedNotationEN;
					notationStringEN = thirtyOneEN + twentyNineEN + twentyThreeEN +  nineteenEN + seventeenEN + tridecimalEN + undecimalEN + septimalEN + pythagEN + naturalEN;
					undefinedNotationEN = "";

				var displayOtonalArrayEN = displayBigArray[a].map(value => {
					return value < 0 ? 0 : value;
				});
				var displayUtonalArrayEN = displayBigArray[a].map(value => {
					return value < 0 ? Math.abs(value) : 0;
				});	
				var displayNumValueEN = getValue(displayOtonalArrayEN);
				var displayDenValueEN = getValue(displayUtonalArrayEN);

				var normTestEN = Math.log2(Math.abs(displayNumValueEN / displayDenValueEN));
				
				if (normTestEN == 0){
					if (cents[a] == 1200.000000){
						displayNumValueEN = 2;
						displayDenValueEN = 1;
					}
					if (cents[a] == -1200.000000){
						displayNumValueEN = 1;
						displayDenValueEN = 2;
					}
				} else if (normTestEN < 0){
					normTestEN = 1 + Math.floor(Math.abs(normTestEN));
					if (cents[a] < 0){
						normTestEN -= 1;
					} else if (cents[a] >= 1200){
						normTestEN += 1;
					}
					normTestEN = Math.pow(2,normTestEN);
					displayNumValueEN = normTestEN * displayNumValueEN;
				}else if (normTestEN > 1) {
					normTestEN = Math.floor(normTestEN);
					if (cents[a] < 0){
						normTestEN += 1;
					} else if (cents[a] > 1200){
						normTestEN -= 1;
					}
					normTestEN = Math.pow(2,normTestEN);
					displayDenValueEN = normTestEN * displayDenValueEN;
				} else if (normTestEN > 0 && normTestEN < 1){
					if (cents[a] < 0){
						normTestEN += 1;
						normTestEN = Math.pow(2,normTestEN);
					} else if (cents[a] > 1200){
						normTestEN += 1;
						displayDenValueEN = normTestEN * displayDenValueEN;
					}
				}

				if (displayNumValueEN <= 9007199254740991 && displayDenValueEN <= 9007199254740991){
					displayNumValueEN = displayNumValueEN;
					displayDenValueEN = displayDenValueEN;

				} else {
					var floatEN = displayNumValueEN / displayDenValueEN;
					displayNumValueEN = floatEN;
					displayDenValueEN = 1;
				}
				
				// storing in html
				html += "<tr>";
				html += "<td>" + power3[a] + "</td>";
				html += "<td>" + power5[a] + "</td>";
				html += "<td>" + power7[a] + "</td>";
				html += "<td>" + power11[a] + "</td>";
				html += "<td>" + power13[a] + "</td>";
				html += "<td>" + power17[a] + "</td>";
				html += "<td>" + power19[a] + "</td>";
				html += "<td>" + power23[a] + "</td>";
				html += "<td>" + power29[a] + "</td>";
				html += "<td>" + displayNumValueEN + " / " + displayDenValueEN +"</td>";
				html += "<td>" + cents[a] + "</td>";
				html += "<td>" + delta[a] + "</td>";
				html += "<td>" + harmD[a] + "</td>";
				html += "<td style='text-align:right;font-family:HEJI;font-size:1.75rem;'>" + notationStringEN + outputDiatonicEN + "</td>";
				html += "</tr>";	 
			}		
			// replacing the body of <tbody> of <table>
			document.getElementById("data").innerHTML = html;
			document.getElementById("loading").innerHTML = "";
		} else {
			var loading = "loading...";
			document.getElementById("data").innerHTML = "";
			document.getElementById("loading").innerHTML = loading;
		}
	} 
}

function getCurrentCents(){ //load the current pitch (normalised) into the enharmonic search cent input box
	currentCents = cents_toRef % 1200;
	while (currentCents < 0){
		currentCents = currentCents + 1200.0;
	}
	$("#centreCents").val(currentCents.toFixed(precision));
}

function getMelodicCents(){ //load the current melodic step (normalised) into the enharmonic search cent input box
	currentCents = melodicCents % 1200;
	while (currentCents < 0){
		currentCents = currentCents + 1200.0;
	}
	$("#centreCents").val(currentCents.toFixed(precision));
}

function clearCurrentCents(){ //reset the cent input box in the enharmonic search
	var currentCents = 0.000000;
	$("#centreCents").val(currentCents);
}

function clearCurrentFreq(){ //reset the frequency input box in the enharmonic search
	var currentFreq = freq1to1;
	$("#frequencyInput").val(currentFreq);
}

function clearCurrentCF(){ //reset both frequency and cents input in the enharmonic search
	var currentCents = 0.000000;
	var currentFreq = freq1to1;
	$("#centreCents").val(currentCents);
	$("#frequencyInput").val(currentFreq);
}

function clearCurrentRange(){ //reset the tolerance range to +/- 8 cents (default)
	var currentRange = 2.000000;
	$("#rangeCents").val(currentRange);
}

function clearFilters(){ //reset the enharmonic search parameters
	var currentRange = 2.000000;
	var currentHDmin = 0.000000;
	var currentHDmax = 50.000000;
	var currentListlength = 48;
	$("#rangeCents").val(currentRange);
	$("#minHD").val(currentHDmin);
	$("#maxHD").val(currentHDmax);
	$("#outputSize").val(currentListlength);
}

function empty(){ //clear the enharmonic search results
	bigArray = [];
	displayBigArray = [];
	monzoArray = [];
	power3 = [];
	power5 = [];
	power7 = [];
	power11 = [];
	power13 = [];
	power17 = [];
	power19 = [];
	power23 = [];
	power29 = [];
	cents = [];
	harmD = [];
	delta = [];
	accCount = [];
	diatPC = [];
	acc3 = [];
}

function wipeEnharmonics(){
	empty();
	var html = "";

	// storing in html
	html += "<tr>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "<td>" + "</td>";
	html += "</tr>"
	
	// replacing the body of <tbody> of <table>
	document.getElementById("data").innerHTML = html;	
	getEnharmonics();
}
