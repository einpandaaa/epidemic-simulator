/**
 * @author spthiel
 * @link https://github.com/spthiel/elspeth.xyz/blob/main/webserver/tatsu/js/LinkedList.js
 */
class LinkedList {
    constructor() {
        this.head = this.tail = null;
        this.sum = 0;
        this.count = 0;
        this.average = 0;
    }

    add(value) {
        const newNode = {previous: null, value: value};
        if (this.head) {
            this.head.previous = newNode;
        } else {
            this.tail = newNode;
        }
        this.head = newNode;
        this.sum += value;
        this.count++;
        if (this.count > 25) {
            this.remove();
        }
        this.calc();
    }

    remove() {
        this.sum -= this.tail.value;
        this.count--;
        this.tail = this.tail.previous;
        this.calc();
    }

    calc() {
        if (this.count === 0) {
            this.average = 0;
            return;
        }
        this.average = this.sum/this.count;
    }
}