const matchfield = document.getElementById("matchfield");
const maxWidth = matchfield.clientWidth - 10;
const maxHeight = matchfield.clientHeight - 10;
const radius = 5;
const drawTime = new LinkedList();

/** Default Values */
let population = 100;
let patientZeros = 1;
let incubationTime = 14;
let infectedTime = 14;
let lethality = 3;

let running = false;
let persons = [];

document.getElementById("start-stop").addEventListener('click', startStop);
document.getElementById("generate").addEventListener('click', startGeneration);

function tick() {
    if(running) {
        movePersons();
        requestAnimationFrame(tick);
    }
}

function startStop() {
    if(persons.length) {
        running = !running;
        if(running) {
            requestAnimationFrame(tick);
        }
    } else {
        alert("Not Generated!");
    }
}

function startGeneration() {
    running = false;
    patientZeros = 1;
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
        infectPerson(person);
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
 * set ill status for person
 * @param {Person} person
 */
function infectPerson(person) {
    if(!person.infected) {
        person.node.classList.add("ill");
        person.infected = true;
    }
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

        detectCollision(p);
    });
    let end = Date.now();
    drawTime.add(Math.round(end-now));
    document.getElementById("renderTime").innerText = Math.round(drawTime.average) + "ms";
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
 */
function detectCollision(person) {
    detectWallCollision(person);
    detectPersonsCollision(person);
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
 */
function detectPersonsCollision(person) {
    let middle = {
        x: person.x + radius,
        y: person.y + radius,
    };

    persons.forEach((p) => {
        if(p === person) {
            return;
        }

        let dx = middle.x - (p.x + radius);
        let dy = middle.y - (p.y + radius);
        let d = dx * dx + dy * dy;

        if(d <= radius * radius) {
            changeVelocity(p, person, "velocityX");
            changeVelocity(p, person, "velocityY");

            if(p.infected || person.infected) {
                infectPerson(p);
                infectPerson(person);
            }
        }
    })
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

/**
 * @typedef {object} Person
 * @property {HTMLElement} node
 * @property {number} x
 * @property {number} y
 * @property {number} velocityX
 * @property {number} velocityY
 * @property {boolean} infected
 */