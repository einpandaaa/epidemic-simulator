/**
 * @author einpandaaa
 */
const matchfield = document.getElementById("matchfield");
const maxWidth = matchfield.clientWidth - 10;
const maxHeight = matchfield.clientHeight - 10;
const radius = 5;
const drawTime = new LinkedList();

const canvas = document.getElementById("statGraph");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
let ctx = canvas.getContext("2d");

const generationError = "Initial generation of simulation needs to be done before starting the simulation.";
const finishedMessage = "Game Finished! All persons cured, dead or never infected.";
const endedMessage = "Your game is already finished. To keep going, generate a new round.";

/** Default Values */
let population = document.getElementById("population").value;
let patientZeros = document.getElementById("patient").value;
let incubationTime = document.getElementById("incubation").value * 30;
let infectedTime = document.getElementById("infected").value * 30;
let lethality = document.getElementById("lethality").value;

let running = false;
let ticks = 0;
let end = false;
let persons = [];

let stats = {};

/**
 * @type {GraphData}
 */
let graphData = {};

document.getElementById("start-stop").addEventListener('click', startStop);
document.getElementById("generate").addEventListener('click', startGeneration);
document.getElementById("form").addEventListener('input', detectUserInput);
document.getElementById("close1").addEventListener('click', toggleOverlay);
document.getElementById("close2").addEventListener('click', toggleOverlay);

function tick() {
    if(running) {
        document.getElementById("tickCounter").innerText = ((++ticks)/30 | 0) + " days";
        movePersons();
        displayStats();
        if(!(ticks % 30)) {
            updateGraphData();
            drawGraph();
        }
        requestAnimationFrame(tick);
    }
}

function detectUserInput(event) {
    switch(event.target.id) {
        case "population":
            population = event.target.value;
            break;
        case "patient":
            patientZeros = event.target.value;
            break;
        case "incubation":
            incubationTime = event.target.value * 30;
            break;
        case "infected":
            infectedTime = event.target.value * 30;
            break;
        case "lethality":
            lethality = event.target.value;
            break;
    }
}

function startStop() {
    if(persons.length && !end) {
        running = !running;

        if(running) {
            document.querySelectorAll("#form input").forEach((e) => {
                e.setAttribute("disabled", "disabled");
            });
            document.getElementById("start-stop").className = "stop";
            requestAnimationFrame(tick);
        } else {
            document.getElementById("start-stop").className = "start";
            document.querySelectorAll("#form input").forEach((e) => {
                e.removeAttribute("disabled");
            });
        }
    } else if (end){
        toggleOverlay(endedMessage);
    } else {
        toggleOverlay(generationError);
    }
}

/**
 * @param {string} message
 */
function toggleOverlay(message) {
    if(document.getElementById("overlay").classList.contains("dnone")) {
        document.getElementById("overlay").classList.remove("dnone");
        document.getElementById("grid").classList.add("blur");
        document.querySelector("#overlay .message-box p").innerText = message;
    } else {
        document.getElementById("overlay").classList.add("dnone");
        document.getElementById("grid").classList.remove("blur");
        document.querySelector("#overlay .message-box p").innerText = "";
    }
}

function startGeneration() {
    running = false;
    ticks = 0;
    document.getElementById("tickCounter").innerText = "0 days";

    if(patientZeros === 0) {
        patientZeros = document.getElementById("patient").value;
    }

    stats.healthy = population;
    stats.incubated = 0;
    stats.infected = 0;
    stats.cured = 0;
    stats.dead = 0;
    displayStats();

    graphData.healthy = [population];
    graphData.incubated = [patientZeros];
    graphData.infected = [0];
    graphData.cured = [0];
    graphData.dead = [0];

    if(persons.length) {
        matchfield.innerHTML = '';
        persons = [];
    }

    for (let i = 1; i <= population; i++) {
        generatePerson(generateKoords());
    }
}

/**
 * spawn individual persons with random coordiantes
 * @param {number[]} coords
 */
function generatePerson(coords) {
    end = false;
    /**
     * @type {Person}
     */
    let person = {
        node: document.createElement("DIV"),
        x: coords[0],
        y: coords[1],
        infected: false
    };

    person.node.className = "round person";
    setPersonCoords(person);
    calculateMoveParams(person);

    if(patientZeros > 0) {
        incubatePerson(person);
        patientZeros--;
    }

    matchfield.appendChild(person.node)
    persons.push(person);
}

/**
 * return coordiantes array (x,y)
 * @returns {number[]}
 */
function generateKoords() {
    return [
        Math.floor(Math.random() * maxWidth) + 1,
        Math.floor(Math.random() * maxHeight) + 1
    ];
}

/**
 * @param {Person} person
 */
function incubatePerson(person) {
    if(!person.incubationTime && !person.isCured) {
        person.incubationTime = 1;
        person.node.classList.add("incubating");

        stats.healthy--;
        stats.incubated++;
    }
}

/**
 * set ill status for person
 * @param {Person} person
 */
function infectPerson(person) {
    if(!person.infected) {
        person.node.classList.add("infected");
        person.node.classList.remove("incubating");
        person.infected = true;
        person.infectedTime = 1;

        if(Math.random() * 100 <= lethality) {
            person.willDie = true;
        }

        stats.incubated--;
        stats.infected++;
    }
}

/**
 * @param {Person} person
 */
function killPerson(person) {
    person.node.classList.remove("infected");
    person.node.classList.add("dead");
    persons.splice(persons.indexOf(person),1);

    stats.infected--;
    stats.dead++;
    isEnd();
}

/**
 * @param {Person} person
 */
function curePerson(person) {
    person.node.classList.remove("infected");
    person.node.classList.add("cured")
    person.isCured = true;
    person.infected = false;
    person.incubationTime = 0;

    stats.infected--;
    stats.cured++;
    isEnd();
}

/**
 * calculate vector parameter for person movement
 * @param {Person} person
 */
function calculateMoveParams(person) {
    let angle = Math.random() * 360;
    //left-right | top-bottom
    person.velocityX = Math.cos(angle * (Math.PI / 180));
    person.velocityY = Math.sin(angle * (Math.PI / 180));
}

/**
 * move person along vector parameter
 */
function movePersons() {
    let now = Date.now();
    persons.forEach((p) => {
        p.x += p.velocityX;
        p.y += p.velocityY;
        setPersonCoords(p);

        if(p.incubationTime) {
            if(p.incubationTime == incubationTime) {
                infectPerson(p);
            } else if(p.incubationTime < incubationTime ) {
                p.incubationTime++;
            }
        }
        if(p.infected) {
            if(p.infectedTime == infectedTime) {
                if(p.willDie) {
                    killPerson(p);
                } else {
                    curePerson(p);
                }
            } else {
                p.infectedTime++;
            }
        }
    });
    persons.forEach(detectCollision)
    let end = Date.now();
    drawTime.add(Math.round(end-now));
    document.getElementById("renderTime").innerText = Math.round(drawTime.average) + " ms";
}

/**
 * @param {Person} person
 */
function setPersonCoords(person) {
    person.node.style.left = person.x + "px";
    person.node.style.top = person.y + "px";
}

/**
 * @param {Person} person
 * @param {number} i
 */
function detectCollision(person, i) {
    detectWallCollision(person);
    detectPersonsCollision(person, i);
}

/**
 * @param {Person} person
 */
function detectWallCollision(person) {
    if(person.x <= 0) {
        person.x = 0;
        person.velocityX *= -1;
    }
    if(person.y <= 0) {
        person.y = 0;
        person.velocityY *= -1;

    }
    if(person.x >= maxWidth) {
        person.x = maxWidth;
        person.velocityX *= -1;

    }
    if(person.y >= maxHeight) {
        person.y = maxHeight;
        person.velocityY *= -1;
    }

}

/**
 * @param {Person} person
 * @param {number} i
 */
function detectPersonsCollision(person, i) {
    let middle = {
        x: person.x + radius,
        y: person.y + radius,
    };

    for (let i1 = i+1; i1 < persons.length; i1++){
        const p = persons[i1];

        let dx = middle.x - (p.x + radius);
        let dy = middle.y - (p.y + radius);
        let d = dx * dx + dy * dy;

        if(d <= radius * radius * 2) {
            changeVelocity(p, person, "velocityX");
            changeVelocity(p, person, "velocityY");

            if(p.infected ^ person.infected) {
                incubatePerson(p);
                incubatePerson(person);
            }
        }
    }
}

/**
 * @param {Person} person1
 * @param {Person} person2
 * @param {string} velocity
 */
function changeVelocity(person1, person2, velocity) {
    let tempVelocity = person1[velocity];
    person1[velocity] = person2[velocity];
    person2[velocity] = tempVelocity;
}

function isEnd() {
    if(stats.infected === 0 && stats.incubated === 0) {
        running = false;
        end = true;
        toggleOverlay(finishedMessage);
        updateGraphData();
        drawGraph();

        document.getElementById("start-stop").className = "start";
        document.querySelectorAll("#form input").forEach((e) => {
            e.removeAttribute("disabled");
        });
    }
}

function displayStats() {
    document.querySelectorAll(".stats .row p").forEach((e) => {
        e.innerText = stats[e.getAttribute("data-attr")];
    });
}

function drawGraph() {
    let xSteps = canvasWidth / (ticks/30);
    let ySteps = canvasHeight / population;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawLine("healthy", "lightgreen", xSteps, ySteps);
    drawLine("incubated", "lightcoral", xSteps, ySteps);
    drawLine("infected", "red", xSteps, ySteps);
    drawLine("cured", "lightskyblue", xSteps, ySteps);
    drawLine("dead", "#333", xSteps, ySteps);
}

/**
 *
 * @param {string} state
 * @param {string} color
 * @param {number} xSteps
 * @param {number} ySteps
 */
function drawLine(state, color, xSteps, ySteps) {
    let posX = 0;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.moveTo(posX, canvasHeight - ySteps * graphData[state][0]);
    graphData[state].forEach((e, i) => {
        if(i === 0) {
            return;
        }
        posX += xSteps;
        ctx.lineTo(posX, canvasHeight - ySteps * e);
    })
    ctx.stroke();
}

function updateGraphData() {
    graphData.healthy.push(stats.healthy);
    graphData.incubated.push(stats.incubated);
    graphData.infected.push(stats.infected);
    graphData.cured.push(stats.cured);
    graphData.dead.push(stats.dead);
}

/**
 * @typedef {object} Person
 * @property {HTMLElement} node
 * @property {number} x
 * @property {number} y
 * @property {number} velocityX
 * @property {number} velocityY
 * @property {boolean} infected
 * @property {number} incubationTime
 * @property {number} infectedTime
 * @property {boolean} willDie
 * @property {boolean} isCured
 */

/**
 * @typedef {object} GraphData
 * @property {number[]} healthy
 * @property {number[]} incubated
 * @property {number[]} infected
 * @property {number[]} cured
 * @property {number[]} dead
 */