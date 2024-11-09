const container = document.querySelector('.container');
const connectionsCanvas = document.querySelector('#connectionsCanvas');
const tempCanvas = document.querySelector('#tempCanvas');
const checkButton = document.querySelector('#checkButton');
const resetButton = document.querySelector('#resetButton');
let selectedItem = null;
let isDrawing = false;
let connections = new Map();
let totalItems = document.querySelectorAll('.item');


// تهيئة الكانفاس
function initializeCanvas() {
  connectionsCanvas.width = container.offsetWidth;
  connectionsCanvas.height = container.offsetHeight;
  tempCanvas.width = container.offsetWidth;
  tempCanvas.height = container.offsetHeight;
}
initializeCanvas();
window.addEventListener('resize', initializeCanvas);

// إضافة مستمعي الأحداث للعناصر
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('mousedown', startConnection);
  item.addEventListener('mouseup', endConnection);
});

// رسم خط مؤقت أثناء السحب
container.addEventListener('mousemove', (e) => {
  if (!selectedItem) return;

  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

  const rect = container.getBoundingClientRect();
  const startX = selectedItem.offsetLeft + (selectedItem.offsetWidth / 2);
  const startY = selectedItem.offsetTop + (selectedItem.offsetHeight / 2);
  const endX = e.clientX - rect.left;
  const endY = e.clientY - rect.top;

  drawLine(tempCtx, startX, startY, endX, endY);
});

function startConnection(e) {
  const item = e.target;
  if (selectedItem === item) return;

  selectedItem = item;
  item.classList.add('selected');
  isDrawing = true;
}

function endConnection(e) {
  if (!selectedItem || !isDrawing) return;

  const endItem = e.target;
  if (selectedItem === endItem ||
    selectedItem.parentElement === endItem.parentElement) {
    resetConnection();
    return;
  }

  const startFromLeft = selectedItem.parentElement.id === 'leftColumn';
  const leftItem = startFromLeft ? selectedItem : endItem;
  const rightItem = startFromLeft ? endItem : selectedItem;

  // حذف الاتصالات السابقة للعناصر
  connections.forEach((value, key) => {
    if (key === leftItem || value === rightItem) {
      connections.delete(key);
    }
  });

  connections.set(leftItem, rightItem);
  drawConnections();
  resetConnection();
}

function resetConnection() {
  if (selectedItem) {
    selectedItem.classList.remove('selected');
  }
  selectedItem = null;
  isDrawing = false;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
}

function drawLine(ctx, startX, startY, endX, endY) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawConnections() {
  const ctx = connectionsCanvas.getContext('2d');
  ctx.clearRect(0, 0, connectionsCanvas.width, connectionsCanvas.height);

  connections.forEach((rightItem, leftItem) => {
    const startX = leftItem.offsetLeft + leftItem.offsetWidth;
    const startY = leftItem.offsetTop + (leftItem.offsetHeight / 2);
    const endX = rightItem.offsetLeft;
    const endY = rightItem.offsetTop + (rightItem.offsetHeight / 2);

    drawLine(ctx, startX, startY, endX, endY);
  });
}

let score = 0;
const maxScore = 10;

checkButton.addEventListener('click', () => {
  score = 0;
  connections.forEach((rightItem, leftItem) => {
    const isCorrect = leftItem.dataset.match === rightItem.dataset.match;
    leftItem.classList.remove('correct', 'incorrect');
    rightItem.classList.remove('correct', 'incorrect');
    leftItem.classList.add(isCorrect ? 'correct' : 'incorrect');
    rightItem.classList.add(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      score++;
    }
  });
  let finalScore = Math.round(score * 10 / (totalItems.length / 2));
  document.getElementById('scoreDisplay').textContent = `${finalScore}/${maxScore}`;
  // document.querySelector(".score-container").classList.add("show");
  document.querySelector(".score-container").style.visibility = "visible"
});

resetButton.addEventListener('click', () => {
  connections.clear();
  drawConnections();
  document.querySelectorAll('.item').forEach(item => {
    item.classList.remove('correct', 'incorrect', 'selected');
  });
  // الكود السابق هنا
  score = 0;
  document.getElementById('scoreDisplay').textContent = `0/${maxScore}`;
  // document.querySelector(".score-container").classList.remove("show")
  document.querySelector(".score-container").style.visibility = "hidden"
});