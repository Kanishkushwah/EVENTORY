const fs = require('fs');
const file = '/Users/tanish.kushwah/MAJOR MINOR PROJECT/EVENTHUB/booking.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Socket.io Client
if (!content.includes('socket.io.min.js')) {
    content = content.replace(
        '</head>',
        '    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>\n</head>'
    );
}

// 2. Add Snacks UI before the Proceed to Payment button
if (!content.includes('id="addPopcorn"')) {
    const snacksHTML = `
                    <div class="border-t pt-4 mt-4 space-y-3">
                        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-icons text-purple-600 text-[20px]">fastfood</span> Add Snacks
                        </h3>
                        <div class="flex items-center justify-between">
                            <label class="text-sm dark:text-gray-300 font-medium">🍿 Large Popcorn (+₹250)</label>
                            <input type="checkbox" id="addPopcorn" onchange="updateSummary()" class="rounded w-5 h-5 text-purple-600 focus:ring-purple-500 cursor-pointer">
                        </div>
                        <div class="flex items-center justify-between">
                            <label class="text-sm dark:text-gray-300 font-medium">🥤 Coca Cola (+₹150)</label>
                            <input type="checkbox" id="addCoke" onchange="updateSummary()" class="rounded w-5 h-5 text-purple-600 focus:ring-purple-500 cursor-pointer">
                        </div>
                        <div class="flex justify-between text-sm pt-2 text-purple-600 dark:text-purple-400 font-semibold hidden" id="snacksDisplayRow">
                            <span>Snacks Total</span>
                            <span id="snacksDisplay">₹0</span>
                        </div>
                    </div>
                    
                    <button onclick="proceedToPayment()"`;

    content = content.replace('<button onclick="proceedToPayment()"', snacksHTML);
}

// 3. Update updateSummary() to include Snacks logic
// Remove old updateSummary
const oldUpdateSummaryStrRegex = /function updateSummary\(\) {[\s\S]*?}/;
if (content.match(oldUpdateSummaryStrRegex)) {
    const newUpdateSummaryStr = `function updateSummary() {
            const subtotal = selectedSeats.reduce((s, x) => s + x.price, 0);
            const fee = Math.round(subtotal * 0.10);
            
            // Calculate Snacks
            let snacksTotal = 0;
            const popcornCb = document.getElementById('addPopcorn');
            const cokeCb = document.getElementById('addCoke');
            if (popcornCb && popcornCb.checked) snacksTotal += 250;
            if (cokeCb && cokeCb.checked) snacksTotal += 150;
            
            const snacksDisplayRow = document.getElementById('snacksDisplayRow');
            if(snacksTotal > 0) {
                snacksDisplayRow.classList.remove('hidden');
                document.getElementById('snacksDisplay').textContent = \`₹\${snacksTotal}\`;
            } else {
                if(snacksDisplayRow) snacksDisplayRow.classList.add('hidden');
            }

            const total = subtotal + fee + snacksTotal;

            document.getElementById("ticketCount").textContent = selectedSeats.length;
            document.getElementById("subtotalAmount").textContent = \`₹\${subtotal}\`;
            document.getElementById("subtotalDisplay").textContent = \`₹\${subtotal}\`;
            document.getElementById("bookingFee").textContent = \`₹\${fee}\`;
            document.getElementById("totalAmount").textContent = \`₹\${total}\`;
            document.getElementById("selectedSeatsText").textContent =
                selectedSeats.length ? selectedSeats.map(s => s.id).join(", ") : "No seats selected";
        }`;
    content = content.replace(oldUpdateSummaryStrRegex, newUpdateSummaryStr);
}

// 4. Update proceedToPayment() to send snacks data
content = content.replace(
    'event_type: currentEvent.category,',
    `event_type: currentEvent.category,
                snacks: {
                    popcorn: document.getElementById('addPopcorn') ? document.getElementById('addPopcorn').checked : false,
                    coke: document.getElementById('addCoke') ? document.getElementById('addCoke').checked : false
                },`
);

// 5. Add Socket.IO Live Locking Logic to Seat Clicks
// Add global socket variable near top of scripts
content = content.replace(
    'let selectedSeats = [];',
    `let selectedSeats = [];
        let socket;
        try {
            socket = io(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000' : 'https://eventory-backend.onrender.com'); // Match your backend domain
        } catch(e) { console.error("Socket IO failed to load"); }
        
        if (socket) {
            socket.on("seatLocked", ({seatId, by}) => {
                const btn = document.getElementById('seat-btn-' + seatId) || Array.from(document.querySelectorAll('.seat-icon')).find(svg => svg.parentElement.innerHTML.includes(seatId))?.parentElement;
                if(btn && !selectedSeats.find(s => s.id === seatId)) {
                    btn.classList.add('locked-by-other', 'bg-red-900', 'cursor-not-allowed', 'opacity-50');
                    btn.disabled = true;
                    btn.title = "This seat is currently being viewed/locked by someone else!";
                }
            });
            socket.on("seatUnlocked", ({seatId}) => {
                const btn = document.getElementById('seat-btn-' + seatId) || Array.from(document.querySelectorAll('.seat-icon')).find(svg => svg.parentElement.innerHTML.includes(seatId))?.parentElement;
                if(btn) {
                    btn.classList.remove('locked-by-other', 'bg-red-900', 'cursor-not-allowed', 'opacity-50');
                    btn.disabled = false;
                    btn.title = "";
                }
            });
        }
`
);

// We need to trigger socket "lockSeat" on click... Let's replace the select/deselect lines
// In movie seats
content = content.replace(
    /selectedSeats\.push\(\{ id: seatId, price: (.*?) \}\);/g,
    `selectedSeats.push({ id: seatId, price: $1 });
                                    if(socket && selectedShowtime) socket.emit("lockSeat", { showtimeId: selectedShowtime.id, seatId: seatId });`
);

content = content.replace(
    /selectedSeats = selectedSeats\.filter\(s => s\.id !== seatId\);/g,
    `selectedSeats = selectedSeats.filter(s => s.id !== seatId);
                                    if(socket && selectedShowtime) socket.emit("unlockSeat", { showtimeId: selectedShowtime.id, seatId: seatId });`
);

// Trigger joinShowtime when showtime is loaded
content = content.replace(
    /selectedShowtime = (.*?;)/,
    `selectedShowtime = $1
            if(socket && selectedShowtime) socket.emit("joinShowtime", selectedShowtime.id);`
);

fs.writeFileSync(file, content);
console.log('Successfully injected WebSocket live seat locking and F&B Upsell to booking.html');
