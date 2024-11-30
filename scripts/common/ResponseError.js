class ResponseError {
    constructor(block) {
        if (!block) return;
        this.block = block;
    }

    show() {
        this.block.classList.add('show');
    }

    hide() {
        this.block.classList.remove('show');
    }
}