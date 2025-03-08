
document.addEventListener("DOMContentLoaded", function () {
    const boardElement = document.getElementById("chessboard");
    const turnIndicator = document.getElementById("turn-indicator");
    const colorSelect = document.getElementById("color-select");
    const startButton = document.getElementById("start-game");
    const customizeButton = document.getElementById("customize-game");
    const modal = document.getElementById("custom-rule-modal");
    const closeModal = document.querySelector(".close");
    const saveRulesButton = document.getElementById("save-rules");
    const pieceSelect = document.getElementById("piece-select");
    const movementInput = document.getElementById("custom-moves");
    const moveSound = document.getElementById("move-sound");

    let game = new Chess();
    let stockfish = new Worker("/static/js/stockfish.js");
    let customRules = {};
    let playerColor = "white";
    let isPlayerTurn = true;
    let lastAiMove = null;

    function applyCustomRules(piece, from, to) {
        if (!customRules[piece]) return true;
        let allowedMoves = customRules[piece];
        let dx = to.charCodeAt(0) - from.charCodeAt(0);
        let dy = parseInt(to[1]) - parseInt(from[1]);

        let moveType = "";
        if (dx === 0 && dy === 1) moveType = "F1";
        if (dx === 0 && dy === 2) moveType = "F2";
        if (dx === 1 && dy === 1) moveType = "D1";
        if (dx === -1 && dy === 1) moveType = "D2";
        if (dx === 1 && dy === 0) moveType = "R1";
        if (dx === -1 && dy === 0) moveType = "L1";
        if (Math.abs(dx) === Math.abs(dy)) moveType = "B1";

        return allowedMoves.includes(moveType);
    }

    function makeBestMove() {
        stockfish.postMessage("position fen " + game.fen());
        stockfish.postMessage("go depth 15");
    }

    stockfish.onmessage = function (event) {
        if (event.data.startsWith("bestmove")) {
            let move = event.data.split(" ")[1];
            game.move({ from: move.substring(0, 2), to: move.substring(2, 4) });
            renderBoard();
            moveSound.play();
            updateTurnIndicator();
        }
    };

    function updateTurnIndicator() {
        turnIndicator.innerText = game.turn() === "w" ? "White's Turn" : "Black's Turn";
    }

    startButton.addEventListener("click", function () {
        playerColor = colorSelect.value;
        game.reset();
        lastAiMove = null;
        isPlayerTurn = playerColor === "white";
        renderBoard();
        updateTurnIndicator();
        if (playerColor === "black") setTimeout(makeBestMove, 500);
    });

    customizeButton.addEventListener("click", function () {
        modal.style.display = "block";
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    saveRulesButton.addEventListener("click", function () {
        let piece = pieceSelect.value.toUpperCase();
        let movementRules = movementInput.value.split(",").map(rule => rule.trim());
        customRules[piece] = movementRules;
        modal.style.display = "none";
        alert("Custom rules saved for " + piece);
    });

    function renderBoard() {
        boardElement.innerHTML = "";
        let boardConfig = {
            draggable: true,
            position: game.fen(),
            onDrop: function (source, target) {
                let pieceObj = game.get(source);
                if (!pieceObj) return "snapback";
                let piece = pieceObj.type.toUpperCase();

                if (customRules[piece] && !applyCustomRules(piece, source, target)) {
                    return "snapback";
                }

                let move = game.move({ from: source, to: target, promotion: "q" });
                if (!move) return "snapback";

                moveSound.play();
                updateTurnIndicator();
                isPlayerTurn = false;
                setTimeout(makeBestMove, 500);
            }
        };
        Chessboard("chessboard", boardConfig);
    }

    renderBoard();
});