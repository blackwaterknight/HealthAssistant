// Mock Data
const patients = [
    { id: 1, name: "Eleanor Pena", condition: "Post-op Observation", time: "09:00 AM", status: "In Progress" },
    { id: 2, name: "Arlene McCoy", condition: "Cardiac Arrhythmia", time: "09:30 AM", status: "Waiting" },
    { id: 3, name: "Wade Warren", condition: "Routine Checkup", time: "10:15 AM", status: "Completed" },
    { id: 4, name: "Jacob Jones", condition: "Migraine Assessment", time: "11:00 AM", status: "Waiting" },
    { id: 5, name: "Jane Cooper", condition: "Orthopedic Review", time: "11:45 AM", status: "Waiting" },
];



class CareFlowApp {
    constructor() {
        this.init();
    }

    init() {
        // Initialize Icons
        lucide.createIcons();
        
        // Render Data
        this.renderPatientTable();
        
        // Setup Event Listeners
        this.setupEventListeners();
        
        // Initialize Map
        this.initMap();
    }
    
    initMap() {
        if (!document.getElementById('ambulance-map') || typeof L === 'undefined') return;
        
        const map = L.map('ambulance-map').setView([22.5839, 88.4638], 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);
        
        const ambulances = [
            { id: "AMB-01", lat: 22.5839, lng: 88.4638, status: "On Call", driver: "John Doe", eta: 12 },
            { id: "AMB-02", lat: 22.5920, lng: 88.4510, status: "Available", driver: "Mike Smith", eta: 0 },
            { id: "AMB-03", lat: 22.5750, lng: 88.4730, status: "Available", driver: "Sarah Lee", eta: 0 }
        ];

        const renderAmbulanceList = () => {
            const list = document.getElementById('ambulance-list');
            if (!list) return;
            list.innerHTML = ambulances.map(amb => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm);">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <strong>${amb.id} &bull; <span style="font-weight: 400">${amb.driver}</span></strong>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">ETA: ${amb.eta > 0 ? amb.eta + ' mins' : 'N/A'}</span>
                    </div>
                    <span class="status-badge ${amb.status === 'On Call' ? 'in-progress' : 'completed'}">${amb.status}</span>
                </div>
            `).join('');
        };

        const activeMarkers = ambulances.map(amb => {
            const marker = L.marker([amb.lat, amb.lng]).addTo(map)
                .bindTooltip(`<b>${amb.id}</b><br>Status: ${amb.status}`);
            return marker;
        });

        renderAmbulanceList();

        // Simulate smooth movement every 2 seconds
        setInterval(() => {
            activeMarkers.forEach((marker, index) => {
                ambulances[index].lat += (Math.random() - 0.5) * 0.001;
                ambulances[index].lng += (Math.random() - 0.5) * 0.001;
                if (ambulances[index].eta > 0 && Math.random() > 0.8) ambulances[index].eta--;
                marker.setLatLng([ambulances[index].lat, ambulances[index].lng]);
            });
            renderAmbulanceList();
        }, 2000);

        // Sample Route: Hospital to Patient
        const hospitalPos = [22.5800, 88.4600];
        const patientPos = [22.5880, 88.4750];
        
        L.marker(hospitalPos).addTo(map).bindTooltip('<b>CareFlow Hospital</b>', { permanent: true, direction: 'right' });
        L.marker(patientPos).addTo(map).bindTooltip('<b>Patient Request</b>', { permanent: true, direction: 'left' });
        
        const routeCoords = [
            hospitalPos,
            [22.5820, 88.4650],
            [22.5850, 88.4700],
            patientPos
        ];
        
        L.polyline(routeCoords, { 
            color: '#4F46E5', 
            weight: 4, 
            dashArray: '8, 8', 
            opacity: 0.9 
        }).addTo(map);
    }

    renderPatientTable() {
        const tbody = document.getElementById('patient-table-body');
        tbody.innerHTML = '';
        
        patients.forEach((patient, index) => {
            const statusClass = patient.status.toLowerCase().replace(' ', '-');
            const tr = document.createElement('tr');
            tr.style.opacity = '0';
            tr.style.animation = `fadeIn 0.3s ease-out ${index * 0.1}s forwards`;
            tr.innerHTML = `
                <td>
                    <div class="patient-name-cell">
                        <div class="patient-avatar">${patient.name.split(' ').map(n => n[0]).join('')}</div>
                        <strong>${patient.name}</strong>
                    </div>
                </td>
                <td>${patient.condition}</td>
                <td><strong>${patient.time}</strong></td>
                <td><span class="status-badge ${statusClass}">${patient.status}</span></td>
                <td><button class="icon-btn" title="View Details"><i data-lucide="chevron-right"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
        
        // Re-initialize icons for newly added DOM elements
        lucide.createIcons();
    }

    setupEventListeners() {
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        
        sendBtn.addEventListener('click', () => this.handleChatInput());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleChatInput();
        });
        
        this.setupSpeechRecognition();
        
        // Setup nav items to be clickable
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            document.getElementById('mic-btn').style.display = 'none';
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.isListening = false;
        
        const micBtn = document.getElementById('mic-btn');
        const chatInput = document.getElementById('chat-input');
        
        this.recognition.onstart = () => {
            this.isListening = true;
            micBtn.style.color = 'var(--danger)';
            chatInput.placeholder = "Listening...";
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value += (chatInput.value ? ' ' : '') + transcript;
            this.handleChatInput();
        };
        
        this.recognition.onerror = () => {
            this.showToast('Microphone Error', 'Could not process audio.', 'info');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            micBtn.style.color = '';
            chatInput.placeholder = "Ask about patients, schedules, or tasks...";
        };
        
        micBtn.addEventListener('click', () => {
            if (this.isListening) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        });
        
        this.voiceEnabled = true;
        const voiceBtn = document.getElementById('voice-toggle-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.voiceEnabled = !this.voiceEnabled;
                voiceBtn.innerHTML = `<i data-lucide="${this.voiceEnabled ? 'volume-2' : 'volume-x'}"></i>`;
                if (!this.voiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                lucide.createIcons();
            });
        }
    }
    
    speakText(text) {
        if (!this.voiceEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }

    handleChatInput() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.addChatMessage(message, 'user');
            input.value = '';
            
            this.simulateAIResponse(message);
        }
    }

    addChatMessage(text, sender, isTyping = false) {
        const container = document.getElementById('chat-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        let contentHtml = '';
        if (isTyping) {
            contentHtml = `
                <div class="message-content typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            contentHtml = `<div class="message-content">${text}</div>`;
        }
        
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="chat-avatar ai-avatar"><i data-lucide="bot"></i></div>
                <div class="message-body">
                    ${contentHtml}
                    ${!isTyping ? `<span class="chat-timestamp">${timeString}</span>` : ''}
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-body">
                    ${contentHtml}
                    <span class="chat-timestamp">${timeString}</span>
                </div>
                <img src="https://ui-avatars.com/api/?name=Dr.+Smith&background=E0E7FF&color=4F46E5" class="chat-avatar user-avatar" alt="Dr. Smith">
            `;
        }
        
        if (isTyping) {
            messageDiv.id = 'typing-indicator';
        }
        
        container.appendChild(messageDiv);
        lucide.createIcons();
        container.scrollTop = container.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async simulateExternalAICall(message) {
        return new Promise((resolve) => {
            const lowerMsg = message.toLowerCase();
            let intent = "general";
            let response = "I'm looking into that for you. Based on current hospital records, everything is operating normally. Is there a specific patient or department you want me to check?";
            let data = null;

            if (lowerMsg.includes('appointment')) {
                intent = "appointments";
                response = "I've pulled up the schedule and generated today's appointments. I've updated your dashboard table accordingly.";
                data = { action: "generate_appointments" };
            } else if (lowerMsg.includes('summary') || lowerMsg.includes('summarize') || lowerMsg.includes('patient')) {
                intent = "summary";
                response = "I have generated the clinical summary for Eleanor Pena. I will display it on your screen now.";
                data = { action: "show_summary", target: "Eleanor Pena" };
            } else if (lowerMsg.includes('bed')) {
                intent = "beds";
                response = "I've retrieved the latest ward census. I'll pull up the detailed bed availability view for you.";
                data = { action: "show_beds" };
            }

            // Simulate network delay to make it feel like a real external AI system call
            const delay = Math.floor(Math.random() * 1500) + 1000;
            setTimeout(() => {
                resolve({ intent, response, data });
            }, delay);
        });
    }

    async simulateAIResponse(userMessage) {
        this.addChatMessage('', 'ai', true);
        this.showToast('AI System', 'Processing request via CareFlow Model...', 'info');
        
        try {
            const result = await this.simulateExternalAICall(userMessage);
            
            this.removeTypingIndicator();
            this.addChatMessage(result.response, 'ai');
            this.speakText(result.response);
            
            // Update UI dynamically based on intent
            if (result.intent === 'appointments') {
                setTimeout(() => this.generateAppointments(), 800);
            } else if (result.intent === 'summary') {
                setTimeout(() => this.showPatientSummary(), 1200);
            } else if (result.intent === 'beds') {
                setTimeout(() => this.showBedAvailability(), 1200);
            }
        } catch (error) {
            this.removeTypingIndicator();
            this.addChatMessage("I'm sorry, I encountered an error connecting to the clinical knowledge base.", 'ai');
        }
    }

    triggerAction(actionName) {
        // Show Toast
        this.showToast(`Action Triggered`, `Initiated: ${actionName}`, 'success');
        
        // Send to AI Chat
        const input = document.getElementById('chat-input');
        input.value = actionName;
        this.handleChatInput();
    }

    generateAppointments() {
        this.showToast('Generating Appointments', 'Fetching the latest data...', 'info');
        
        // Show Skeleton Loaders
        const tbody = document.getElementById('patient-table-body');
        tbody.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="patient-name-cell">
                        <div class="skeleton skeleton-avatar"></div>
                        <div class="skeleton skeleton-text" style="width: 120px;"></div>
                    </div>
                </td>
                <td><div class="skeleton skeleton-text" style="width: 150px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 80px;"></div></td>
                <td><div class="skeleton skeleton-badge"></div></td>
                <td><div class="skeleton skeleton-avatar" style="width: 24px; height: 24px;"></div></td>
            `;
            tbody.appendChild(tr);
        }
        
        setTimeout(() => {
            const newPatients = [
                { id: 6, name: "Robert Fox", condition: "Orthopedic Surgery", time: "01:00 PM", status: "Waiting" },
                { id: 7, name: "Cody Fisher", condition: "Physical Therapy", time: "02:30 PM", status: "In Progress" },
                { id: 8, name: "Esther Howard", condition: "Dermatology Consult", time: "03:15 PM", status: "Waiting" },
                { id: 9, name: "Guy Hawkins", condition: "MRI Scan", time: "04:00 PM", status: "Completed" },
            ];
            
            patients.length = 0;
            patients.push(...newPatients);
            
            this.renderPatientTable();
            this.showToast('Success', 'Today\\'s appointments have been generated.', 'success');
        }, 1200);
    }

    showPatientSummary() {
        const title = "Patient Summary: Eleanor Pena";
        const content = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <p><strong>Age:</strong> 42 | <strong>Gender:</strong> Female | <strong>Blood Type:</strong> O+</p>
                <p><strong>Admission Reason:</strong> Admitted for elective laparoscopic appendectomy.</p>
                <p><strong>Current Status:</strong> Surgery was successful. Patient is in post-op observation. Vitals are stable (BP: 120/80, HR: 72 bpm, Temp: 98.6°F).</p>
                <p><strong>Medications:</strong> IV fluids, pain management (Acetaminophen 500mg as needed).</p>
                <p><strong>Next Steps:</strong> Monitor overnight. Expected discharge tomorrow morning if vitals remain stable.</p>
            </div>
        `;
        this.showModal(title, content);
    }

    showBedAvailability() {
        const title = "Hospital Bed Availability";
        const content = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
                    <strong>General Ward</strong>
                    <span style="color: var(--success); font-weight: 600;">12 Available</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
                    <strong>Intensive Care Unit (ICU)</strong>
                    <span style="color: var(--warning); font-weight: 600;">3 Available</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
                    <strong>Maternity Ward</strong>
                    <span style="color: var(--danger); font-weight: 600;">0 Available (Full)</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem;">
                    <strong>Pediatrics</strong>
                    <span style="color: var(--success); font-weight: 600;">8 Available</span>
                </div>
            </div>
        `;
        this.showModal(title, content);
    }

    showModal(title, htmlContent) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerHTML = htmlContent;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }


    showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'info';
        
        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${icon}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Initialize App
const app = new CareFlowApp();
