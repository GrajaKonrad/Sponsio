const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');

var bet = -1;

boxes = [
    { x: 100, y: 100, width: 200, height: 200, color: 'grey', text: 'Waiting for players ...', value: 0 },
    { x: 400, y: 100, width: 200, height: 200, color: 'grey', text: 'Waiting for players ...', value: 0 },
    { x: 700, y: 100, width: 200, height: 200, color: 'grey', text: 'Waiting for players ...', value: 0 },
];

function drawBoxes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    boxes.forEach(box => {
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        const textX = box.x + box.width / 2;
        const textY = box.y + box.height / 2;
        ctx.fillText(box.text, textX, textY);
    });
}

function getClickedBox(x, y) {
    return boxes.find(box => 
        x >= box.x && x <= box.x + box.width &&
        y >= box.y && y <= box.y + box.height
    );
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedBox = getClickedBox(x, y);
    if (clickedBox.value === bet){
        return;
    }
    if(clickedBox) {
        boxes.forEach(box => {
            box.color = (box === clickedBox) ? 'green' : 'grey';
        });
    }
    if (clickedBox.text === 'Waiting for players ...') {
        return;
    }
    drawBoxes();
    bet = clickedBox.value;
    sendBetToServer(clickedBox.value);
});


