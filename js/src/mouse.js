function MouseHandler() {
    this.leftClick = false;
    this.position = new THREE.Vector2(0, 0);
    document.addEventListener("mousedown", this.mouseDown.bind(this), false);
    document.addEventListener("mouseup", this.mouseUp.bind(this), false);
    document.addEventListener("mousemove", this.mouseMove.bind(this), false);
    document.addEventListener("contextmenu", this.contextMenu.bind(this), false);
}

MouseHandler.prototype = {
    constructor: MouseHandler,

    mouseDown: function(event) {
        this.position.set(event.clientX, event.clientY);
        this.leftClick = event.button === 0 ? true : this.leftClick;
    },

    mouseUp: function(event) {
        event.preventDefault();
        this.position.set(event.clientX, event.clientY);
        this.leftClick = event.button === 0 ? false : this.leftClick;
    },

    mouseMove: function(event) {
        event.preventDefault();
        this.position.set(event.clientX, event.clientY);
    },

    contextMenu: function(event) {
        event.preventDefault();
    }
};