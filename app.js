// ==========================================================================
// CampusRide RIT - Core Application JavaScript
// ==========================================================================

// Global state database
const ROUTES = [
    { id: 'R1', name: 'Downtown Transit Hub ⇄ Main Campus', baseFare: 40, stations: ['Downtown Hub', 'West Gate', 'PG Block', 'Science Block', 'Main Campus'] },
    { id: 'R2', name: 'Hostel Zone ⇄ Academic Tech Park', baseFare: 30, stations: ['Hostel Block A', 'Library Central', 'PG Block', 'Academic Center', 'Tech Park Hub'] },
    { id: 'R3', name: 'Metro Link Station ⇄ South Campus Gate', baseFare: 35, stations: ['Metro Station', 'South Toll Gate', 'MBA Block', 'Humanities Wing', 'South Campus Gate'] },
    { id: 'R4', name: 'Sports Arena Loop ⇄ North Campus Gate', baseFare: 25, stations: ['Sports Arena', 'Gymnasium Lane', 'Football Arena', 'North Toll Gate', 'North Campus Gate'] },
    { id: 'R5', name: 'City Suburbs Terminal ⇄ Central Library', baseFare: 50, stations: ['Suburbs Depot', 'City Center Mall', 'Main Gate Terminal', 'Civil Block', 'Central Library'] },
    { id: 'R6', name: 'Tech Corridor Express ⇄ Academic Row', baseFare: 45, stations: ['Tech Corridor', 'Innovation Center', 'PG Block', 'Central Lab', 'Academic Row'] },
    { id: 'R7', name: 'Airport Junction Link ⇄ East Campus Gate', baseFare: 60, stations: ['Airport Junction', 'Highway Plaza', 'East Toll Plaza', 'Aero Space Block', 'East Campus Gate'] },
    { id: 'R8', name: 'Green Valley Hostels ⇄ Research Labs', baseFare: 30, stations: ['Green Valley', 'Lake View Block', 'PG Block', 'Bio Tech Lab', 'Research Labs'] },
    { id: 'R9', name: 'University Station Depot ⇄ Pharmacy Block', baseFare: 35, stations: ['Depot Terminal', 'Pharmacy Junction', 'Dental Clinic', 'Ayurveda Wing', 'Pharmacy Block'] },
    { id: 'R10', name: 'Medical Center Annex ⇄ Innovation Center', baseFare: 40, stations: ['Medical Annex', 'Health Center', 'Dental Clinic', 'IT Incubator', 'Innovation Center'] }
];

const BUS_CONFIGS = {
    standard: { name: 'Standard Shuttle (3x2 Layout)', totalSeats: 35, cols: 5, fareMultiplier: 1.0 },
    express: { name: 'Electric Express (3x2 Layout)', totalSeats: 30, cols: 5, fareMultiplier: 1.2 },
    coach: { name: 'Volvo Multi-Axle (3x2 Layout)', totalSeats: 45, cols: 5, fareMultiplier: 1.5 }
};

// Database storage for booked seats
// Format: { "R1_morning_express_2026-06-24": ["A1", "B4", "C5"] }
let bookedSeatsDatabase = {};
let studentTicketsList = [];
let studentWallets = {};
let boardingLogs = [];

const STUDENT_PROFILES = [
    { name: 'Nisha Sharma', id: 'RIT-2026-889', dept: 'CSE', avatarClass: 'avatar-c1', avatarIcon: 'fa-user-graduate' },
    { name: 'Amit Patel', id: 'RIT-2026-104', dept: 'CSBS', avatarClass: 'avatar-c2', avatarIcon: 'fa-user-ninja' },
    { name: 'Rahul Sen', id: 'RIT-2026-412', dept: 'IT', avatarClass: 'avatar-c3', avatarIcon: 'fa-user-tie' }
];
let currentProfileIndex = 0;

// Active selections state
let state = {
    currentRoute: ROUTES[0],
    currentShift: 'morning',
    currentBusType: 'express',
    currentDate: '',
    selectedSeats: new Set(),
    adminFareMultiplier: 1.0,
    activeTrackingBusId: 'BUS-101',
    simulators: {}
};

// ==========================================================================
// Premium Custom Modal Dialog Logic (Replaces blocking alert/confirm)
// ==========================================================================
let activeModalResolve = null;

function showCustomAlert(message, title = "System Notification", type = "info") {
    return new Promise((resolve) => {
        const dialog = document.getElementById('custom-modal-dialog');
        const titleEl = document.getElementById('custom-modal-title');
        const msgEl = document.getElementById('custom-modal-message');
        const iconEl = document.getElementById('custom-modal-icon');
        const okBtn = document.getElementById('custom-modal-ok-btn');
        const cancelBtn = document.getElementById('custom-modal-cancel-btn');
        const iconContainer = iconEl.parentElement;

        if (!dialog) {
            alert(message);
            resolve();
            return;
        }

        titleEl.innerText = title;
        msgEl.innerText = message;

        iconContainer.className = "custom-modal-icon-container " + type;
        if (type === "warning") {
            iconEl.className = "fa-solid fa-triangle-exclamation";
        } else if (type === "danger") {
            iconEl.className = "fa-solid fa-circle-xmark";
        } else if (type === "success") {
            iconEl.className = "fa-solid fa-circle-check";
        } else {
            iconEl.className = "fa-solid fa-circle-info";
        }

        cancelBtn.style.display = 'none';
        okBtn.innerText = 'OK';
        okBtn.className = 'custom-modal-btn primary';
        okBtn.style.display = 'block';

        activeModalResolve = () => {
            dialog.classList.remove('active');
            resolve();
        };

        dialog.classList.add('active');
    });
}

function showCustomConfirm(message, title = "System Confirmation", type = "warning") {
    return new Promise((resolve) => {
        const dialog = document.getElementById('custom-modal-dialog');
        const titleEl = document.getElementById('custom-modal-title');
        const msgEl = document.getElementById('custom-modal-message');
        const iconEl = document.getElementById('custom-modal-icon');
        const okBtn = document.getElementById('custom-modal-ok-btn');
        const cancelBtn = document.getElementById('custom-modal-cancel-btn');
        const iconContainer = iconEl.parentElement;

        if (!dialog) {
            const result = confirm(message);
            resolve(result);
            return;
        }

        titleEl.innerText = title;
        msgEl.innerText = message;

        iconContainer.className = "custom-modal-icon-container " + type;
        if (type === "warning") {
            iconEl.className = "fa-solid fa-triangle-exclamation";
        } else if (type === "danger") {
            iconEl.className = "fa-solid fa-circle-xmark";
        } else if (type === "success") {
            iconEl.className = "fa-solid fa-circle-check";
        } else {
            iconEl.className = "fa-solid fa-circle-info";
        }

        cancelBtn.style.display = 'block';
        cancelBtn.innerText = 'Cancel';
        okBtn.innerText = 'Confirm';
        okBtn.className = 'custom-modal-btn primary';
        okBtn.style.display = 'block';

        const handleConfirm = () => {
            dialog.classList.remove('active');
            resolve(true);
        };

        const handleCancel = () => {
            dialog.classList.remove('active');
            resolve(false);
        };

        okBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;

        dialog.classList.add('active');
    });
}

// Global click handler to close alerts on OK click
document.addEventListener('DOMContentLoaded', () => {
    const okBtn = document.getElementById('custom-modal-ok-btn');
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            if (activeModalResolve) {
                const resolveFn = activeModalResolve;
                activeModalResolve = null;
                resolveFn();
            }
        });
    }
});

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('rit_theme_mode');
    if (savedTheme === 'sparkles') {
        document.body.classList.add('sparkles-mode');
        const btn = document.getElementById('theme-btn');
        if (btn) btn.innerHTML = `<i class="fa-solid fa-cloud-moon"></i> Cyber Mode`;
    }

    // 1. Initialize Default Travel Date to Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowYear = tomorrow.getFullYear();
    const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
    const dateStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
    const dateInput = document.getElementById('date-select');
    if (dateInput) {
        dateInput.value = dateStr;
        state.currentDate = dateStr;
        
        // Set min date of picker to today
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
        const todayDay = String(today.getDate()).padStart(2, '0');
        const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
        dateInput.setAttribute('min', todayStr);
    }

    // 2. Render Route Selection Cards
    renderRouteCards();

    // 3. Load database from LocalStorage
    loadFromLocalStorage();

    // 4. Register UI Event Listeners
    setupEventListeners();

    // 5. Initialize Live Route Simulation
    initRouteSimulation();

    // 6. Initial render of seating grid
    syncStateFromForm();
    renderSeatingMap();
    updateCheckoutSummary();
    renderBookingsHistory();
    renderAdminConsole();
    renderAdminLedger();
    
    // Select first profile by default
    switchProfile(0);
});

// Seed some initial bookings so the app doesn't look empty
function generateMockBookings() {
    ROUTES.forEach(route => {
        ['morning', 'afternoon', 'evening'].forEach(shift => {
            ['standard', 'express', 'coach'].forEach(bus => {
                // Generate a key
                const key = `${route.id}_${shift}_${bus}_${state.currentDate}`;
                // Pick a random array of seats to pre-book (between 4 and 10 seats)
                const config = BUS_CONFIGS[bus];
                const totalRows = config.totalSeats / config.cols;
                const preBookedCount = Math.floor(Math.random() * 6) + 4;
                const bookedList = [];
                for(let i = 0; i < preBookedCount; i++) {
                    const r = Math.floor(Math.random() * totalRows);
                    const c = Math.floor(Math.random() * config.cols) + 1;
                    const seatName = `${String.fromCharCode(65 + r)}${c}`;
                    // Avoid Staff reserved (A3, A4) and duplicate seats
                    if (seatName !== 'A3' && seatName !== 'A4' && !bookedList.includes(seatName)) {
                        bookedList.push(seatName);
                    }
                }
                bookedSeatsDatabase[key] = bookedList;
            });
        });
    });
}

// Sync selections state from search control inputs
function syncStateFromForm() {
    const routeId = document.getElementById('route-select').value;
    state.currentRoute = ROUTES.find(r => r.id === routeId);
    state.currentShift = document.getElementById('shift-select').value;
    state.currentBusType = document.getElementById('bus-type').value;
    state.currentDate = document.getElementById('date-select').value;
    state.selectedSeats.clear(); // Reset selections when configurations change
    
    // Update selected card state styling
    renderRouteCards();
}

// ==========================================================================
// Interactive Event Handlers & State Sync
// ==========================================================================
function setupEventListeners() {
    // Inputs sync trigger
    const syncInputs = ['route-select', 'shift-select', 'bus-type', 'date-select'];
    syncInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            syncStateFromForm();
            renderSeatingMap();
            updateCheckoutSummary();
            renderAdminConsole();
        });
    });

    // Sparkles Mode styling button
    document.getElementById('theme-btn').addEventListener('click', () => {
        document.body.classList.toggle('sparkles-mode');
        const sparklesActive = document.body.classList.contains('sparkles-mode');
        const btn = document.getElementById('theme-btn');
        if (sparklesActive) {
            btn.innerHTML = `<i class="fa-solid fa-cloud-moon"></i> Cyber Mode`;
            localStorage.setItem('rit_theme_mode', 'sparkles');
        } else {
            btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Sparkles Mode`;
            localStorage.setItem('rit_theme_mode', 'cyber');
        }
        playBeep('click');
    });

    // Checkout Reservation submit
    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        processBooking();
    });

    // Close Ticket Modal
    document.getElementById('close-ticket-btn').addEventListener('click', () => {
        document.getElementById('ticket-modal').classList.remove('active');
    });
    document.getElementById('book-again-btn').addEventListener('click', () => {
        document.getElementById('ticket-modal').classList.remove('active');
    });

    // Print boarding pass
    document.getElementById('print-ticket-btn').addEventListener('click', () => {
        window.print();
    });

    // Admin toggling link
    document.getElementById('admin-nav-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        const adminSection = document.getElementById('admin-section');
        const navLink = document.getElementById('admin-nav-toggle');
        
        adminSection.classList.toggle('hidden');
        navLink.classList.toggle('active');
        if (!adminSection.classList.contains('hidden')) {
            adminSection.scrollIntoView({ behavior: 'smooth' });
            renderAdminConsole();
        }
    });

    // Dropdown toggles
    document.getElementById('bell-toggle-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('notifications-drawer').classList.toggle('active');
        document.getElementById('profile-selector-dropdown').classList.remove('active');
    });

    document.getElementById('profile-pill-trigger').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('profile-selector-dropdown').classList.toggle('active');
        document.getElementById('notifications-drawer').classList.remove('active');
    });

    document.addEventListener('click', () => {
        const drawer = document.getElementById('notifications-drawer');
        const prof = document.getElementById('profile-selector-dropdown');
        if (drawer) drawer.classList.remove('active');
        if (prof) prof.classList.remove('active');
    });
}

// ==========================================================================
// Rendering Seating Map Grid
// ==========================================================================
function renderSeatingMap() {
    const seatsContainer = document.getElementById('bus-seats-container');
    const busConfig = BUS_CONFIGS[state.currentBusType];
    
    // Update labels
    document.getElementById('selected-bus-name').innerText = `${busConfig.name} — RIT Transit`;
    
    // Retrieve already booked list for current configuration key
    const dbKey = `${state.currentRoute.id}_${state.currentShift}_${state.currentBusType}_${state.currentDate}`;
    if (!bookedSeatsDatabase[dbKey]) {
        bookedSeatsDatabase[dbKey] = [];
    }
    const currentBookedList = bookedSeatsDatabase[dbKey];

    seatsContainer.innerHTML = '';
    
    // Create column headers (WIN, AISLE, AISLE, MID, WIN)
    const headerLabels = [
        { text: 'Row', class: 'seat-header-label' },
        { text: 'Win', class: 'seat-header-label' },
        { text: 'Aisle', class: 'seat-header-label' },
        { text: 'Aisle', class: 'seat-header-label' },
        { text: 'Mid', class: 'seat-header-label' },
        { text: 'Win', class: 'seat-header-label' }
    ];
    
    headerLabels.forEach(label => {
        const headerDiv = document.createElement('div');
        headerDiv.className = label.class;
        headerDiv.innerText = label.text;
        seatsContainer.appendChild(headerDiv);
    });

    // Total Seats
    let availableCount = 0;
    const totalRows = busConfig.totalSeats / busConfig.cols;

    for (let r = 0; r < totalRows; r++) {
        const rowLetter = String.fromCharCode(65 + r); // A, B, C...
        
        // 1. Render Row Label Cell
        const labelCell = document.createElement('div');
        labelCell.className = 'row-label-cell';
        labelCell.innerText = rowLetter;
        seatsContainer.appendChild(labelCell);

        // 2. Render 5 Seats for this Row
        for (let c = 1; c <= busConfig.cols; c++) {
            const seatName = `${rowLetter}${c}`;
            
            // Decide status of seat
            let seatClass = 'seat seat-available';
            
            // Staff seats are A3 and A4 on the right side next to the driver
            const isStaff = (seatName === 'A3' || seatName === 'A4');
            
            if (currentBookedList.includes(seatName)) {
                seatClass = 'seat seat-booked';
            } else if (state.selectedSeats.has(seatName)) {
                seatClass = 'seat seat-selected';
            } else if (isStaff) {
                seatClass = 'seat seat-staff';
            } else {
                availableCount++;
            }

            const seatBtn = document.createElement('div');
            seatBtn.className = seatClass;

            // Generate student-focused tooltips explaining seat layout positions
            let seatTooltip = '';
            if (c === 1) seatTooltip = `Window Seat (Left) — Seat ${seatName}`;
            else if (c === 2) seatTooltip = `Aisle Seat (Left) — Seat ${seatName}`;
            else if (c === 3) seatTooltip = `Aisle Seat (Right) — Seat ${seatName}`;
            else if (c === 4) seatTooltip = `Middle Seat (Right) — Seat ${seatName}`;
            else if (c === 5) seatTooltip = `Window Seat (Right) — Seat ${seatName}`;
            
            if (isStaff) {
                seatTooltip += ' [Staff Reserved]';
            }
            
            seatBtn.setAttribute('title', seatTooltip);
            
            // Inner realistic visual elements (headrest, armrests, label)
            seatBtn.innerHTML = `
                <span class="seat-head"></span>
                <span class="seat-num">${c}</span>
                <span class="seat-arm left"></span>
                <span class="seat-arm right"></span>
            `;
            
            if (seatClass !== 'seat seat-booked') {
                seatBtn.addEventListener('click', () => handleSeatClick(seatName, isStaff));
            }

            seatsContainer.appendChild(seatBtn);
        }
    }

    // Update available seats text counters
    document.getElementById('available-counter').innerHTML = `<i class="fa-solid fa-chair"></i> ${availableCount} Available`;

    // Battery health visibility
    const batteryMeter = document.getElementById('electric-battery-meter');
    if (batteryMeter) {
        if (state.currentBusType === 'express') {
            batteryMeter.style.display = 'flex';
            const batteryVal = Math.round(85 - (Math.random() * 15));
            const fillBar = document.getElementById('bus-battery-fill');
            const pctText = document.getElementById('bus-battery-percent');
            if (fillBar) fillBar.style.width = `${batteryVal}%`;
            if (pctText) pctText.innerText = `${batteryVal}%`;
        } else {
            batteryMeter.style.display = 'none';
        }
    }
}

// Handle clicking of individual seats
async function handleSeatClick(seatName, isStaff) {
    // Custom logic warning for staff
    if (isStaff) {
        const confirmStaff = await showCustomConfirm(`This seat (${seatName}) is reserved for College Faculty and Staff. Do you hold a faculty authorization?`, "Faculty Seat Reserved", "warning");
        if(!confirmStaff) return;
    }

    // Toggle seat selection
    if (state.selectedSeats.has(seatName)) {
        state.selectedSeats.delete(seatName);
    } else {
        // Enforce rule limit: max 4 seats per student ID
        if (state.selectedSeats.size >= 4) {
            showCustomAlert('Booking Policy Limit: A student ID can reserve a maximum of 4 seats per booking transaction.', "Booking Policy Alert", "warning");
            return;
        }
        state.selectedSeats.add(seatName);
    }

    // Re-draw grid & update checkout panel
    renderSeatingMap();
    updateCheckoutSummary();
}

// Update pricing details panel
function updateCheckoutSummary() {
    const summarySeatsText = document.getElementById('summary-seats');
    const summaryTotalText = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('confirm-booking-btn');

    if (state.selectedSeats.size === 0) {
        summarySeatsText.innerText = 'None';
        summaryTotalText.innerText = 'Rs. 0.00';
        checkoutBtn.disabled = true;
        return;
    }

    const selectedArr = Array.from(state.selectedSeats).sort();
    summarySeatsText.innerText = selectedArr.join(', ');

    // Pricing calculation
    const baseFare = state.currentRoute.baseFare;
    const busTypeMultiplier = BUS_CONFIGS[state.currentBusType].fareMultiplier;
    const finalFarePerSeat = baseFare * busTypeMultiplier * state.adminFareMultiplier;
    
    // Rate detail text
    document.getElementById('summary-rate').innerText = `Rs. ${finalFarePerSeat.toFixed(2)} / seat`;
    
    // Total calculation
    const grandTotal = finalFarePerSeat * selectedArr.length;
    summaryTotalText.innerText = `Rs. ${grandTotal.toFixed(2)}`;
    
    checkoutBtn.disabled = false;
}

// ==========================================================================
// Checkout & Ticket Generation
// ==========================================================================
function processBooking() {
    const studentName = document.getElementById('student-name').value;
    const studentId = document.getElementById('student-id').value;
    const studentDept = document.getElementById('student-dept').value;

    const dbKey = `${state.currentRoute.id}_${state.currentShift}_${state.currentBusType}_${state.currentDate}`;
    const selectedArr = Array.from(state.selectedSeats);
    
    if (selectedArr.length === 0) return;

    // Calculate grandTotal
    const baseFare = state.currentRoute.baseFare;
    const busTypeMultiplier = BUS_CONFIGS[state.currentBusType].fareMultiplier;
    const finalFarePerSeat = baseFare * busTypeMultiplier * state.adminFareMultiplier;
    const grandTotal = finalFarePerSeat * selectedArr.length;

    // Retrieve active student's wallet balance
    const activeProfile = STUDENT_PROFILES[currentProfileIndex];
    const currentBalance = studentWallets[activeProfile.id] !== undefined ? studentWallets[activeProfile.id] : 0;

    // Verify balance
    if (currentBalance < grandTotal) {
        playBeep('error');
        showCustomAlert(`Insufficient Funds: Booking total is Rs. ${grandTotal.toFixed(2)}, but ${activeProfile.name}'s wallet only has Rs. ${currentBalance.toFixed(2)}.\n\nPlease top up the wallet using the Recharge form in the checkout panel.`, "Insufficient Funds", "danger");
        return;
    }

    // Deduct fare
    studentWallets[activeProfile.id] -= grandTotal;
    
    // Play success chime
    playBeep('success');

    // Save newly booked seats to virtual database
    if (!bookedSeatsDatabase[dbKey]) {
        bookedSeatsDatabase[dbKey] = [];
    }
    bookedSeatsDatabase[dbKey] = bookedSeatsDatabase[dbKey].concat(selectedArr);

    // Generate random pass id
    const passId = `RIT-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalFareStr = `Rs. ${grandTotal.toFixed(2)}`;

    const formattedShift = state.currentShift.charAt(0).toUpperCase() + state.currentShift.slice(1);
    const departureTime = state.currentShift === 'morning' ? '07:30 AM' : state.currentShift === 'afternoon' ? '01:30 PM' : '05:30 PM';
    const shiftText = `${formattedShift} Shift — ${departureTime}`;

    // Create ticket database receipt
    const newTicketReceipt = {
        passId: passId,
        passengerName: studentName,
        studentId: studentId,
        dept: studentDept,
        routeId: state.currentRoute.id,
        routeName: state.currentRoute.name,
        shiftVal: state.currentShift,
        shift: shiftText,
        busType: state.currentBusType,
        seats: selectedArr,
        date: state.currentDate,
        totalFare: totalFareStr,
        fareAmount: grandTotal,
        status: 'Verified'
    };

    // Push & Save
    studentTicketsList.push(newTicketReceipt);
    saveToLocalStorage();
    
    // Show pass modal
    reprintTicket(passId);

    // Trigger visual confetti
    launchConfetti();

    // Reset local selections and form inputs
    state.selectedSeats.clear();

    // Re-draw map and update numbers
    renderSeatingMap();
    switchProfile(currentProfileIndex); // updates header and checkout wallets
    renderBookingsHistory();
    renderAdminConsole();
    
    // Update total occupied counts widget
    let totalBooked = parseInt(document.getElementById('stat-occupied-seats').innerText);
    document.getElementById('stat-occupied-seats').innerText = totalBooked + selectedArr.length;
}

// CSS-based simple particles simulation
function launchConfetti() {
    const container = document.getElementById('confetti-holder');
    container.innerHTML = '';
    const colors = ['#00F2FE', '#4FACFE', '#F53F85', '#00E676', '#FFAB00', '#7E57C2'];

    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `-10px`;
        particle.style.width = `${Math.random() * 6 + 6}px`;
        particle.style.height = particle.style.width;
        
        // Add random speed and delay
        const duration = Math.random() * 2 + 1.5;
        const delay = Math.random() * 0.5;
        particle.style.animation = `rain ${duration}s ${delay}s linear forwards`;
        
        container.appendChild(particle);
    }
}

// ==========================================================================
// Live Tracking Map Simulation
// ==========================================================================
const SIMULATED_VEHICLES = [
    { id: 'BUS-101', name: 'Electric Express E-04', routeId: 'R1', speed: '45 km/h', next: 'Science Block', eta: '4 min', load: '24/32', startNode: 2, progress: 62 },
    { id: 'BUS-102', name: 'RIT Coach Standard S-08', routeId: 'R2', speed: '38 km/h', next: 'Academic Center', eta: '8 min', load: '18/40', startNode: 1, progress: 38 },
    { id: 'BUS-103', name: 'Volvo Multi-Axle V-12', routeId: 'R5', speed: '55 km/h', next: 'Civil Block', eta: '12 min', load: '36/48', startNode: 3, progress: 80 }
];

function initRouteSimulation() {
    const busListContainer = document.getElementById('tracker-bus-list');
    busListContainer.innerHTML = '';

    SIMULATED_VEHICLES.forEach(vehicle => {
        const route = ROUTES.find(r => r.id === vehicle.routeId);
        
        const busItem = document.createElement('div');
        busItem.className = `tracker-bus-item ${vehicle.id === state.activeTrackingBusId ? 'active' : ''}`;
        busItem.setAttribute('id', `list-${vehicle.id}`);
        
        busItem.innerHTML = `
            <div class="bus-info-left">
                <h4>${vehicle.name}</h4>
                <p>${route.name.split(' ⇄ ')[0]} ⇄ Campus</p>
            </div>
            <div class="status-indicator en-route">
                <span class="circle"></span> En-Route
            </div>
        `;
        
        busItem.addEventListener('click', () => selectTrackingBus(vehicle.id));
        busListContainer.appendChild(busItem);
    });

    // Populate stations row for active tracker
    updateStationMapNodes();

    // Start simulation ticks
    setInterval(updateSimulationTick, 3000);
}

function selectTrackingBus(vehicleId) {
    // Update active class in sidebar
    document.querySelectorAll('.tracker-bus-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`list-${vehicleId}`).classList.add('active');

    state.activeTrackingBusId = vehicleId;
    
    // Update map overlays
    const vehicle = SIMULATED_VEHICLES.find(v => v.id === vehicleId);
    const route = ROUTES.find(r => r.id === vehicle.routeId);

    document.getElementById('tracking-bus-name').innerText = vehicle.name;
    document.getElementById('tracking-bus-route').innerText = route.name;

    updateStationMapNodes();
    renderTrackingDetails(vehicle);
}

function updateStationMapNodes() {
    const vehicle = SIMULATED_VEHICLES.find(v => v.id === state.activeTrackingBusId);
    const route = ROUTES.find(r => r.id === vehicle.routeId);
    const stationsRow = document.getElementById('stations-row');
    
    stationsRow.innerHTML = '';
    
    // Render the station stop points along the tracker path
    route.stations.forEach((station, index) => {
        const node = document.createElement('div');
        node.className = 'station-node';
        
        // Decide status of active node dot
        // If bus progress indicates it passed this node index
        const nodeProgressPercent = (index / (route.stations.length - 1)) * 100;
        
        if (vehicle.progress >= nodeProgressPercent) {
            node.classList.add('completed');
        } else if (index === Math.ceil((vehicle.progress / 100) * (route.stations.length - 1))) {
            node.classList.add('active');
        }

        node.innerHTML = `
            <div class="node-circle"></div>
            <span class="node-label">${station}</span>
        `;
        stationsRow.appendChild(node);
    });
}

function renderTrackingDetails(vehicle) {
    // Update progress elements
    document.getElementById('route-progress-line').style.width = `${vehicle.progress}%`;
    document.getElementById('moving-bus').style.left = `${vehicle.progress}%`;

    // Telemetry items
    document.getElementById('telemetry-speed').innerText = vehicle.speed;
    document.getElementById('telemetry-next').innerText = vehicle.next;
    document.getElementById('telemetry-eta').innerText = vehicle.eta;
    document.getElementById('telemetry-load').innerText = vehicle.load;
}

// Simulates real-time updates to bus location speeds and ETAs
function updateSimulationTick() {
    SIMULATED_VEHICLES.forEach(vehicle => {
        // 1. Advance bus progress percentage slightly
        let nextProgress = vehicle.progress + (Math.random() * 4 + 1);
        if (nextProgress > 100) {
            nextProgress = 0; // wrap around back to depot
        }
        vehicle.progress = Math.round(nextProgress);

        // 2. Adjust ETA
        const currentEtaVal = parseInt(vehicle.eta);
        let newEta = currentEtaVal - 1;
        if (newEta <= 0 || nextProgress < 5) {
            newEta = Math.floor(Math.random() * 15) + 3;
        }
        vehicle.eta = `${newEta} min`;

        // 3. Adjust Speed slightly
        const randomSpeed = Math.floor(Math.random() * 20) + 35; // between 35 and 55
        vehicle.speed = `${randomSpeed} km/h`;

        // 4. Update next stop name based on progress
        const route = ROUTES.find(r => r.id === vehicle.routeId);
        const nodeIndex = Math.ceil((vehicle.progress / 100) * (route.stations.length - 1));
        const nextStationName = route.stations[nodeIndex] || route.stations[route.stations.length - 1];
        vehicle.next = nextStationName;
    });

    // Refresh display details for the active tracking bus
    const activeVehicle = SIMULATED_VEHICLES.find(v => v.id === state.activeTrackingBusId);
    updateStationMapNodes();
    renderTrackingDetails(activeVehicle);
}

// ==========================================================================
// Admin Controls & Simulation Tweaks
// ==========================================================================
function renderAdminConsole() {
    const list = document.getElementById('admin-occupancy-list');
    list.innerHTML = '';

    // Show percentage calculations for all routes on the selected shift
    ROUTES.forEach(route => {
        const dbKey = `${route.id}_${state.currentShift}_${state.currentBusType}_${state.currentDate}`;
        const bookedCount = bookedSeatsDatabase[dbKey] ? bookedSeatsDatabase[dbKey].length : 0;
        const totalCapacity = BUS_CONFIGS[state.currentBusType].totalSeats;
        const percent = Math.round((bookedCount / totalCapacity) * 100);

        const row = document.createElement('div');
        row.className = 'occupancy-stat-row';
        row.innerHTML = `
            <div class="occupancy-label-info">
                <span class="route-name">${route.name.split(' ⇄ ')[0]}</span>
                <span class="numbers">${bookedCount} / ${totalCapacity} Seats (${percent}%)</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
            </div>
        `;
        list.appendChild(row);
    });
}

function setAdminFareMultiplier(value) {
    state.adminFareMultiplier = value;
    
    // Toggle active classes on admin buttons
    const btns = document.querySelectorAll('.toggle-group button');
    btns.forEach(btn => btn.classList.remove('active'));
    
    // Simple helper based on value
    if (value === 1.0) btns[0].classList.add('active');
    if (value === 1.5) btns[1].classList.add('active');
    if (value === 0.8) btns[2].classList.add('active');

    // Instantly refresh pricing details on frontend
    updateCheckoutSummary();
    showCustomAlert(`Global ticket price multiplier adjusted to ${value}x.`, "System Admin Alert", "success");
}

function overrideSystemStatus(statusValue) {
    const banner = document.querySelector('.broadcast-banner p');
    if (!banner) return;

    if (statusValue === 'Operational') {
        banner.innerHTML = `All campus shuttle networks are operating normally. Seat allocation online is active.`;
        document.querySelector('.broadcast-banner').style.borderColor = 'var(--color-border)';
    } else if (statusValue === 'Delay') {
        banner.innerHTML = `Caution: Heavy rush traffic on Route A near Main Gate. Shuttle departures may experience 10-minute delay.`;
        document.querySelector('.broadcast-banner').style.borderColor = 'var(--color-warning)';
    } else if (statusValue === 'Storm') {
        banner.innerHTML = `Emergency Protocol: Slow driving guidelines activated due to sudden rainfall. Watch out for modified speeds.`;
        document.querySelector('.broadcast-banner').style.borderColor = 'var(--color-accent-pink)';
    }
    
    showCustomAlert(`College Transit Broadcast Status modified to "${statusValue}".`, "System Admin Alert", "success");
}

async function resetAllBookings() {
    const confirmClear = await showCustomConfirm('Are you sure you want to purge all active bookings in the system? This action resets the occupancy data lists.', "Purge Bookings Database", "danger");
    if (!confirmClear) return;

    // Reset database to empty
    bookedSeatsDatabase = {};
    generateMockBookings(); // re-generate initial baseline layout
    
    state.selectedSeats.clear();
    renderSeatingMap();
    updateCheckoutSummary();
    renderAdminConsole();
    
    showCustomAlert('Transit database flushed successfully. Baseline random seat layouts seeded.', "Database Purge Success", "success");
}

// Simulates a booking from an external terminal or other student
function triggerRandomBooking() {
    const randomRoute = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    const shifts = ['morning', 'afternoon', 'evening'];
    const randomShift = shifts[Math.floor(Math.random() * shifts.length)];
    const types = ['standard', 'express', 'coach'];
    const randomBus = types[Math.floor(Math.random() * types.length)];
    
    const dbKey = `${randomRoute.id}_${randomShift}_${randomBus}_${state.currentDate}`;
    if (!bookedSeatsDatabase[dbKey]) {
        bookedSeatsDatabase[dbKey] = [];
    }

    const config = BUS_CONFIGS[randomBus];
    const totalRows = config.totalSeats / config.cols;
    
    // Find an empty seat
    let attempts = 0;
    let formattedSeatName = '';
    
    do {
        const r = Math.floor(Math.random() * totalRows);
        const c = Math.floor(Math.random() * config.cols) + 1;
        formattedSeatName = `${String.fromCharCode(65 + r)}${c}`;
        attempts++;
    } while (bookedSeatsDatabase[dbKey].includes(formattedSeatName) && attempts < 100);

    if (attempts < 100) {
        bookedSeatsDatabase[dbKey].push(formattedSeatName);
        
        // If it affects current layout, reload
        if (randomRoute.id === state.currentRoute.id && randomShift === state.currentShift && randomBus === state.currentBusType) {
            renderSeatingMap();
            updateCheckoutSummary();
        }
        
        renderAdminConsole();
        
        // Show simulated toast on screen
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = 'var(--color-bg-card-hover)';
        toast.style.border = '1px solid var(--color-accent-teal)';
        toast.style.boxShadow = '0 4px 12px var(--color-accent-teal-glow)';
        toast.style.color = 'var(--color-text-primary)';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '1000';
        toast.style.fontFamily = 'var(--font-primary)';
        toast.style.fontSize = '0.85rem';
        toast.innerHTML = `<i class="fa-solid fa-bell" style="color:var(--color-accent-teal);"></i> Booking Alert: Seat ${formattedSeatName} just reserved on Route ${randomRoute.id} (${randomShift}).`;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

// ==========================================================================
// LocalStorage Backend Sync and Extra Features
// ==========================================================================
function loadFromLocalStorage() {
    try {
        const storedBookings = localStorage.getItem('rit_booked_seats');
        if (storedBookings) {
            bookedSeatsDatabase = JSON.parse(storedBookings);
        } else {
            bookedSeatsDatabase = {};
            generateMockBookings();
            saveToLocalStorage();
        }
        
        const storedTickets = localStorage.getItem('rit_student_tickets');
        if (storedTickets) {
            studentTicketsList = JSON.parse(storedTickets);
        } else {
            studentTicketsList = [];
        }

        const storedWallets = localStorage.getItem('rit_student_wallets');
        if (storedWallets) {
            studentWallets = JSON.parse(storedWallets);
        } else {
            studentWallets = {
                'RIT-2026-889': 500.00,
                'RIT-2026-104': 350.00,
                'RIT-2026-412': 120.00
            };
        }

        const storedLogs = localStorage.getItem('rit_boarding_logs');
        if (storedLogs) {
            boardingLogs = JSON.parse(storedLogs);
        } else {
            boardingLogs = [];
        }
    } catch (e) {
        console.error("LocalStorage load failed: ", e);
        bookedSeatsDatabase = {};
        generateMockBookings();
        studentTicketsList = [];
        studentWallets = {
            'RIT-2026-889': 500.00,
            'RIT-2026-104': 350.00,
            'RIT-2026-412': 120.00
        };
        boardingLogs = [];
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('rit_booked_seats', JSON.stringify(bookedSeatsDatabase));
        localStorage.setItem('rit_student_tickets', JSON.stringify(studentTicketsList));
        localStorage.setItem('rit_student_wallets', JSON.stringify(studentWallets));
        localStorage.setItem('rit_boarding_logs', JSON.stringify(boardingLogs));
    } catch (e) {
        console.error("LocalStorage save failed: ", e);
    }
}

function switchProfile(index) {
    currentProfileIndex = index;
    const profile = STUDENT_PROFILES[index];
    const balance = studentWallets[profile.id] !== undefined ? studentWallets[profile.id] : 0;
    
    // Update header pill
    document.getElementById('header-profile-name').innerText = profile.name;
    document.getElementById('header-profile-avatar').innerHTML = `<i class="fa-solid ${profile.avatarIcon}"></i>`;
    document.getElementById('header-profile-wallet').innerText = `Rs. ${balance.toFixed(2)}`;
    
    // Update portal dashboard greeting name & wallet balance
    const greetingName = document.getElementById('portal-greeting-name');
    if (greetingName) greetingName.innerText = profile.name;
    
    const portalWallet = document.getElementById('portal-wallet-stat');
    if (portalWallet) portalWallet.innerText = `Rs. ${balance.toFixed(2)}`;
    
    // Update checkout card wallet balance
    const checkoutWallet = document.getElementById('checkout-wallet-balance');
    if (checkoutWallet) {
        checkoutWallet.innerText = `Rs. ${balance.toFixed(2)}`;
        checkoutWallet.style.color = balance < 40 ? 'var(--color-danger)' : 'var(--color-success)';
    }
    
    // Auto-fill checkout fields
    document.getElementById('student-name').value = profile.name;
    document.getElementById('student-id').value = profile.id;
    document.getElementById('student-dept').value = profile.dept;
    
    // Populate profile dropdown list
    populateProfileDropdown();
    
    // Hide profile dropdown
    document.getElementById('profile-selector-dropdown').classList.remove('active');
    
    // Trigger checkout button enabled check
    updateCheckoutSummary();
}

function populateProfileDropdown() {
    const listContainer = document.getElementById('header-profile-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    STUDENT_PROFILES.forEach((profile, idx) => {
        const balance = studentWallets[profile.id] !== undefined ? studentWallets[profile.id] : 0;
        const opt = document.createElement('div');
        opt.className = `profile-option ${idx === currentProfileIndex ? 'active' : ''}`;
        opt.innerHTML = `
            <span class="avatar ${profile.avatarClass}"><i class="fa-solid ${profile.avatarIcon}"></i></span>
            <div class="opt-body">
                <strong>${profile.name}</strong>
                <small>${profile.id} • ${profile.dept}</small>
                <small style="color:var(--color-success); font-weight:700; margin-top:2px;">Wallet: Rs. ${balance.toFixed(2)}</small>
            </div>
        `;
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            switchProfile(idx);
        });
        listContainer.appendChild(opt);
    });
}

function renderBookingsHistory() {
    const container = document.getElementById('booking-history-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (studentTicketsList.length === 0) {
        container.innerHTML = `<p class="empty-history-text">No active reservations found.</p>`;
        return;
    }
    
    // Render list elements reverse order (newest first)
    studentTicketsList.slice().reverse().forEach(ticket => {
        const item = document.createElement('div');
        item.className = `history-item ${ticket.status === 'Boarded' ? 'boarded' : ''}`;
        
        let actionsHtml = '';
        if (ticket.status === 'Boarded') {
            actionsHtml = `
                <button class="hist-btn view" onclick="reprintTicket('${ticket.passId}')" style="flex:1;">
                    <i class="fa-solid fa-ticket"></i> View Pass
                </button>
                <span class="boarded-stamp-mini" style="font-size:0.75rem; color:var(--color-warning); font-weight:700; display:flex; align-items:center; gap:4px; padding:6px 10px; border:1px solid var(--color-warning); border-radius:4px; background:hsla(38,92%,50%,0.08);"><i class="fa-solid fa-circle-check"></i> Boarded</span>
            `;
        } else {
            actionsHtml = `
                <button class="hist-btn view" onclick="reprintTicket('${ticket.passId}')">
                    <i class="fa-solid fa-ticket"></i> View
                </button>
                <button class="hist-btn checkin" onclick="boardTicket('${ticket.passId}')" style="border-color: var(--color-success); color: var(--color-success); background: hsla(142,70%,45%,0.05);">
                    <i class="fa-solid fa-qrcode"></i> Check-in
                </button>
                <button class="hist-btn cancel" onclick="cancelTicket('${ticket.passId}')">
                    <i class="fa-solid fa-ban"></i> Cancel
                </button>
            `;
        }

        item.innerHTML = `
            <div class="history-item-top">
                <h5>${ticket.routeName.split(' ⇄ ')[0]} ⇄ Campus</h5>
                <span class="pass-id">${ticket.passId}</span>
            </div>
            <div class="history-item-body">
                <span>Seats: <strong>${ticket.seats.join(', ')}</strong></span>
                <span>Date: <strong>${ticket.date}</strong></span>
                <span>Shift: <strong>${ticket.shift.split(' Shift')[0]}</strong></span>
                <span>Fare: <strong>${ticket.totalFare}</strong></span>
                <span>Status: <strong style="color:${ticket.status === 'Boarded' ? 'var(--color-warning)' : 'var(--color-accent-teal)'};">${ticket.status || 'Verified'}</strong></span>
            </div>
            <div class="history-item-actions" style="display:flex; gap:8px; margin-top:8px;">
                ${actionsHtml}
            </div>
        `;
        container.appendChild(item);
    });
}

async function cancelTicket(passId) {
    const confirmCancel = await showCustomConfirm(`Are you sure you want to cancel booking ticket ${passId}? This releases your reserved seats.`, "Cancel Booking Reservation", "warning");
    if (!confirmCancel) return;
    
    // Find ticket index
    const ticketIndex = studentTicketsList.findIndex(t => t.passId === passId);
    if (ticketIndex === -1) return;
    
    const ticket = studentTicketsList[ticketIndex];
    
    // Release seats in bookedSeatsDatabase
    const dbKey = `${ticket.routeId}_${ticket.shiftVal}_${ticket.busType}_${ticket.date}`;
    if (bookedSeatsDatabase[dbKey]) {
        bookedSeatsDatabase[dbKey] = bookedSeatsDatabase[dbKey].filter(seat => !ticket.seats.includes(seat));
    }
    
    // Refund wallet
    const ticketStudentId = ticket.studentId;
    let refundAmount = 0;
    if (ticket.fareAmount !== undefined) {
        refundAmount = ticket.fareAmount;
    } else {
        const cleanStr = ticket.totalFare.replace(/[^\d.]/g, '');
        refundAmount = parseFloat(cleanStr) || 0;
    }
    
    if (studentWallets[ticketStudentId] !== undefined) {
        studentWallets[ticketStudentId] += refundAmount;
    } else {
        studentWallets[ticketStudentId] = refundAmount;
    }
    
    // Remove from tickets list
    studentTicketsList.splice(ticketIndex, 1);
    
    playBeep('click');
    
    // Save & Sync views
    saveToLocalStorage();
    renderSeatingMap();
    switchProfile(currentProfileIndex); // updates balances
    renderAdminConsole();
    renderBookingsHistory();
    
    showCustomAlert(`Ticket ${passId} cancelled successfully. Seats ${ticket.seats.join(', ')} are now available!\nRefund of Rs. ${refundAmount.toFixed(2)} has been credited to Student ID ${ticketStudentId}.`, "Booking Cancelled", "success");
}

function reprintTicket(passId) {
    const ticket = studentTicketsList.find(t => t.passId === passId);
    if (!ticket) return;
    
    // Populate Ticket Modal Pass details
    document.getElementById('ticket-pass-id').innerText = ticket.passId;
    document.getElementById('ticket-name-val').innerText = ticket.passengerName;
    document.getElementById('ticket-id-val').innerText = `${ticket.studentId} (${ticket.dept})`;
    document.getElementById('ticket-route-val').innerText = ticket.routeName;
    document.getElementById('ticket-shift-val').innerText = ticket.shift;
    document.getElementById('ticket-seats-val').innerText = ticket.seats.sort().join(', ');
    document.getElementById('ticket-date-val').innerText = ticket.date;

    const statusVal = document.getElementById('ticket-status-val');
    const boardBtn = document.getElementById('modal-board-btn');
    
    if (ticket.status === 'Boarded') {
        statusVal.innerText = 'BOARDED';
        statusVal.parentElement.className = 'ticket-status-stamp boarded';
        if (boardBtn) boardBtn.style.display = 'none';
    } else {
        statusVal.innerText = 'VERIFIED';
        statusVal.parentElement.className = 'ticket-status-stamp';
        if (boardBtn) boardBtn.style.display = 'inline-flex';
    }

    // Open Modal
    document.getElementById('ticket-modal').classList.add('active');
}

function clearNotifications() {
    document.getElementById('notifications-list-container').innerHTML = `
        <p style="text-align:center; padding:20px; font-size:0.75rem; color:var(--color-text-muted);">No unread transit warnings.</p>
    `;
    document.getElementById('bell-badge-count').style.display = 'none';
}

function adminCreateRoute() {
    const routeName = document.getElementById('admin-route-name').value;
    const routeFare = parseInt(document.getElementById('admin-route-fare').value);
    const routeStationsStr = document.getElementById('admin-route-stations').value;
    
    const stations = routeStationsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (stations.length === 0) {
        showCustomAlert("Please enter at least 1 valid route station.", "Validation Warning", "warning");
        return;
    }
    
    const nextId = `R${ROUTES.length + 1}`;
    const newRoute = {
        id: nextId,
        name: routeName,
        baseFare: routeFare,
        stations: stations
    };
    
    // Add to global state array
    ROUTES.push(newRoute);
    
    // Clear form inputs
    document.getElementById('admin-route-name').value = '';
    document.getElementById('admin-route-fare').value = '30';
    document.getElementById('admin-route-stations').value = '';
    
    // Refresh Route cards in booking search form
    renderRouteCards();
    
    // Select new route
    const routeSelect = document.getElementById('route-select');
    if (routeSelect) {
        routeSelect.value = nextId;
        routeSelect.dispatchEvent(new Event('change'));
    }
    syncStateFromForm();
    
    // Re-seed mock data for this new route
    ['morning', 'afternoon', 'evening'].forEach(shift => {
        ['standard', 'express', 'coach'].forEach(bus => {
            const key = `${nextId}_${shift}_${bus}_${state.currentDate}`;
            bookedSeatsDatabase[key] = [];
        });
    });
    
    saveToLocalStorage();
    
    // Update UI
    renderSeatingMap();
    updateCheckoutSummary();
    renderAdminConsole();
    
    // Update active routes stat card
    const activeStat = document.getElementById('stat-active-routes');
    if (activeStat) activeStat.innerText = `${ROUTES.length} Active`;
    
    showCustomAlert(`Route "${routeName}" has been added and selected!`, "Dynamic Deploy Success", "success");
}

function boardTicket(passId) {
    const ticket = studentTicketsList.find(t => t.passId === passId);
    if (!ticket) return;
    
    if (ticket.status === 'Boarded') {
        showCustomAlert("This boarding pass has already been scanned and boarded.", "Check-in Alert", "warning");
        return;
    }
    
    ticket.status = 'Boarded';
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    
    const logEntry = {
        passId: ticket.passId,
        passengerName: ticket.passengerName,
        dept: ticket.dept,
        routeName: ticket.routeName,
        seats: ticket.seats.join(', '),
        timestamp: timestamp
    };
    
    boardingLogs.push(logEntry);
    saveToLocalStorage();
    playBeep('success');
    
    const ticketModal = document.getElementById('ticket-modal');
    if (ticketModal && ticketModal.classList.contains('active') && document.getElementById('ticket-pass-id').innerText === passId) {
        const statusVal = document.getElementById('ticket-status-val');
        if (statusVal) {
            statusVal.innerText = 'BOARDED';
            statusVal.parentElement.className = 'ticket-status-stamp boarded';
        }
        const boardBtn = document.getElementById('modal-board-btn');
        if (boardBtn) boardBtn.style.display = 'none';
    }
    
    renderBookingsHistory();
    renderAdminLedger();
    
    showCustomAlert(`Pass ID ${passId} scanned successfully. Stamp updated to Boarded.`, "Boarding Confirmed", "success");
}

function boardActiveTicket() {
    const activePassId = document.getElementById('ticket-pass-id').innerText;
    if (activePassId) {
        boardTicket(activePassId);
    }
}

function renderAdminLedger() {
    const logBody = document.getElementById('ledger-log-body');
    if (!logBody) return;
    
    logBody.innerHTML = '';
    
    if (boardingLogs.length === 0) {
        logBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding:20px; text-align:center; color:var(--color-text-muted);">No scan check-ins logged today.</td>
            </tr>
        `;
        return;
    }
    
    boardingLogs.slice().reverse().forEach(log => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--color-border)';
        tr.innerHTML = `
            <td style="padding:10px; color:var(--color-accent-teal); font-weight:700;">${log.passId}</td>
            <td style="padding:10px; font-weight:600;">${log.passengerName}</td>
            <td style="padding:10px; color:var(--color-text-muted);">${log.dept}</td>
            <td style="padding:10px; color:var(--color-text-primary); font-size:0.75rem;">${log.routeName.split(' ⇄ ')[0]}</td>
            <td style="padding:10px; color:var(--color-warning); font-weight:700;">${log.seats}</td>
            <td style="padding:10px; color:var(--color-text-muted); font-size:0.75rem;">${log.timestamp}</td>
        `;
        logBody.appendChild(tr);
    });
}

function playBeep(type) {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        if (type === 'success') {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05);
            osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 0.35);
            osc2.stop(ctx.currentTime + 0.35);
        } else if (type === 'error') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
            
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        }
    } catch (e) {
        console.warn("Web Audio API warning:", e);
    }
}

function rechargeWalletFromInput() {
    const rechargeInput = document.getElementById('recharge-amount');
    if (!rechargeInput) return;
    
    const amount = parseFloat(rechargeInput.value);
    if (isNaN(amount) || amount <= 0) {
        showCustomAlert("Please enter a valid positive amount to top up.", "Invalid Top Up Amount", "warning");
        playBeep('error');
        return;
    }
    
    const activeProfile = STUDENT_PROFILES[currentProfileIndex];
    if (!activeProfile) return;
    
    if (studentWallets[activeProfile.id] === undefined) {
        studentWallets[activeProfile.id] = 0;
    }
    studentWallets[activeProfile.id] += amount;
    
    saveToLocalStorage();
    playBeep('success');
    switchProfile(currentProfileIndex);
    
    showCustomAlert(`Rs. ${amount.toFixed(2)} has been added to ${activeProfile.name}'s wallet. New balance is Rs. ${studentWallets[activeProfile.id].toFixed(2)}.`, "Top Up Success", "success");
}

function renderRouteCards() {
    const container = document.getElementById('route-cards-container');
    if (!container) return;
    container.innerHTML = '';
    
    ROUTES.forEach(route => {
        const card = document.createElement('div');
        const isSelected = (state.currentRoute && state.currentRoute.id === route.id);
        card.className = `route-selection-card ${isSelected ? 'active' : ''}`;
        
        const stopsSummary = route.stations.slice(0, 3).join(' → ') + (route.stations.length > 3 ? '...' : '');
        
        card.innerHTML = `
            <div class="route-card-meta">
                <span class="route-id-tag">${route.id}</span>
                <span class="route-fare-badge">Rs. ${route.baseFare.toFixed(0)}</span>
            </div>
            <h4 class="route-card-title">${route.name.replace(' ⇄ ', ' ⇄ <br>')}</h4>
            <p class="route-card-stops"><i class="fa-solid fa-map-pin"></i> ${stopsSummary}</p>
        `;
        
        card.addEventListener('click', () => {
            const input = document.getElementById('route-select');
            if (input) {
                input.value = route.id;
                input.dispatchEvent(new Event('change'));
            }
            playBeep('click');
        });
        
        container.appendChild(card);
    });
}
