// ==========================================================================
// 1. GLOBAL SYSTEM CONFIGURATIONS
// ==========================================================================
const BACKEND_URL = "https://script.google.com/macros/s/AKfycby_6MWD8vGJHd6OJOkg1xlEW3r2oQwOkyEwnVpObOop5nUGcCInDIiA5WehrONQjNk0/exec"; 

let currentUser = { name: "", email: "", role: "" }; 
let currentLead = null; 

window.onload = function() {
    clearLeadUI();
};

// ==========================================================================
// 🚀 PREMIUM CUSTOM ALERT ALGORITHMS UTILITY
// (TIPPANI: Borring browser alert ko luxury modal window me transform karne ka engine)
// ==========================================================================
function showCustomAlert(title, message, isSuccess = true) {
    document.getElementById('modalAlertTitle').innerText = title;
    document.getElementById('modalAlertMsg').innerText = message;
    
    const iconDiv = document.getElementById('modalAlertIcon');
    if(isSuccess) {
        iconDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
        iconDiv.style.color = "#16a34a"; // Green Color
        document.getElementById('customAlertModal').children[0].style.borderTopColor = "#16a34a";
    } else {
        iconDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i>`;
        iconDiv.style.color = "#ef4444"; // Red Color
        document.getElementById('customAlertModal').children[0].style.borderTopColor = "#ef4444";
    }
    
    document.getElementById('customAlertModal').classList.remove('hidden');
}

function closeCustomAlert() {
    document.getElementById('customAlertModal').classList.add('hidden');
}

// ==========================================================================
// 2. SECURE PORTAL ACCESS LOGIN GATEWAY
// ==========================================================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    const err = document.getElementById('loginError');
    err.style.display = "none"; 

    try {
        const response = await fetch(`${BACKEND_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`);
        const res = await response.json();

        if (res.success) {
            currentUser = { name: res.name, email: email, role: res.role };
            document.getElementById('loginScreen').classList.add('hidden'); 
            
            if (res.role === "Admin") {
                document.getElementById('adminDashboard').classList.remove('hidden'); 
                loadAdminData(); 
            } else {
                document.getElementById('agentDashboard').classList.remove('hidden'); 
                document.getElementById('agentNameDisplay').innerText = "Agent: " + res.name;
                fetchNextLead(); 
            }
        } else {
            err.innerText = "Error: Invalid System Credentials.";
            err.style.display = "block";
        }
    } catch(e) {
        err.innerText = "Network Error: Apps script API un-reachable.";
        err.style.display = "block";
    }
});

// ==========================================================================
// 3. AUTO-LOCKING ADAPTIVE AGENT DIALER (SUPERSONIC RENDERING SPEED)
// ==========================================================================
async function fetchNextLead() {
    try {
        document.getElementById('currentLeadName').innerText = "LOADING NEXT FRESH POOL LEAD...";
        
        const res = await fetch(`${BACKEND_URL}?action=getNextLead&agentEmail=${encodeURIComponent(currentUser.email)}`);
        const result = await res.json();

        if (result && result.success && result.id) {
            const data = result.lead;
            currentLead = data; 

            document.getElementById('leadIdDisplay').innerText = result.id;
            
            const realName = data.customer_name || data.name || data.naam || "UNNAMED CUSTOMER";
            document.getElementById('currentLeadName').innerText = realName;
            document.getElementById('currentLeadPhone').innerText = data.mobail_number || data.phone || "----------";
            document.getElementById('dialBtn').href = `tel:${data.mobail_number || data.phone || ''}`;

            // MICRO-SECONDS RENDERING PROCESSING (AUTO HIDE/SHOW CHECKS)
            handleFieldVisibility('box_phone', 'currentLeadPhone', data.mobail_number || data.phone);
            handleFieldVisibility('box_pan', 'customerPan', data.pan_card_number || data.pan);
            handleFieldVisibility('box_roi', 'customerCompany', data.roi);
            handleFieldVisibility('box_tenure', 'customerTenure', data.tenure);
            handleFieldVisibility('box_location', 'customerLocation', data.location || data.city);
            handleFieldVisibility('box_designation', 'customerDesignation', data.designation);
            handleFieldVisibility('box_company', 'customerCompanyName', data.company_name || data.company);
            handleFieldVisibility('box_loantype', 'loanType', data.loan_type);

            let dateVal = data.loan_date || data.date;
            if(dateVal && !isNaN(Date.parse(dateVal))) {
                dateVal = new Date(dateVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            handleFieldVisibility('box_date', 'customerLoanDate', dateVal);

            handleCurrencyVisibility('box_amount', 'existingLoanAmount', data.loan_amount || data.amount);
            handleCurrencyVisibility('box_emi', 'customerEmi', data.emi);
            handleCurrencyVisibility('box_salary', 'customerSalary', data.salary);

            // DYNAMIC EXTRA COLOUMNS CONTAINER CLEANUP 
            const container = document.getElementById('dynamicFieldsContainer');
            const extraBoxes = container.querySelectorAll('.custom-dynamic-box');
            extraBoxes.forEach(box => box.remove());

            const standardKeys = ["rowindex", "id", "customer_name", "name", "naam", "mobail_number", "phone", "number", "pan_card_number", "pan", "loan_amount", "amount", "roi", "emi", "tenure", "location", "city", "loan_date", "date", "salary", "designation", "company_name", "company", "loan_type", "assigned_to", "status", "remarks"];

            Object.keys(data).forEach(key => {
                const val = data[key] ? data[key].toString().trim() : "";
                let safeKey = key.toLowerCase();

                if (!standardKeys.includes(safeKey)) {
                    if (val !== "" && val !== "0" && val !== "---" && val.toLowerCase() !== "n/a") {
                        let cleanLabel = key.replace(/_/g, ' ').toUpperCase();
                        const newBox = document.createElement('div');
                        newBox.className = 'detail-box custom-dynamic-box';
                        newBox.innerHTML = `<label><i class="fa-solid fa-folder-plus"></i> ${cleanLabel}</label><div class="detail-value font-bold text-blue">${val}</div>`;
                        container.appendChild(newBox);
                    }
                }
            });

        } else {
            document.getElementById('currentLeadName').innerText = "BOHOT BADHIYA! SAARI LEADS KHATAM.";
            currentLead = null;
            clearLeadUI();
        }
    } catch(e) {
        console.error("Critical Dialer Interface Render Crash:", e);
    }
}

function handleFieldVisibility(boxId, valueId, value) {
    const box = document.getElementById(boxId);
    const textElement = document.getElementById(valueId);
    let cleanVal = value ? value.toString().trim() : "";
    if(cleanVal !== "" && cleanVal !== "0" && cleanVal !== "---" && cleanVal.toLowerCase() !== "n/a") {
        textElement.innerText = cleanVal;
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

function handleCurrencyVisibility(boxId, valueId, value) {
    const box = document.getElementById(boxId);
    const textElement = document.getElementById(valueId);
    let cleanVal = value ? value.toString().trim() : "";
    if(cleanVal !== "" && cleanVal !== "0" && !isNaN(cleanVal) && cleanVal.toLowerCase() !== "n/a") {
        textElement.innerText = "₹" + parseInt(cleanVal).toLocaleString('en-IN');
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

// ==========================================================================
// 4. COMMIT LOG AND LOAD NEXT DATA STREAM DISPATCHER
// ==========================================================================
document.getElementById('remarkForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    if(!currentLead) { 
        showCustomAlert("Action Revoked", "Active pool instance missing ya data end ho chuka hai.", false); 
        return; 
    }

    const status = document.getElementById('callStatus').value;
    const remarks = document.getElementById('callRemark').value;

    try {
        const url = `${BACKEND_URL}?action=saveFeedback&rowIndex=${currentLead.rowindex}&status=${encodeURIComponent(status)}&remarks=${encodeURIComponent(remarks)}&agentName=${encodeURIComponent(currentUser.name)}&customerName=${encodeURIComponent(currentLead.customer_name || currentLead.name || "UNNAMED")}&phone=${encodeURIComponent(currentLead.mobail_number || currentLead.phone)}`;
        const response = await fetch(url);
        const res = await response.json();

        if(res.success) {
            document.getElementById('remarkForm').reset();
            let tc = document.getElementById('todayCalls');
            tc.innerText = parseInt(tc.innerText) + 1;
            fetchNextLead(); 
        }
    } catch(e) { 
        showCustomAlert("Network Error", "Feedback save network breakdown framework.", false); 
    }
});

// ==========================================================================
// 5. ADMINISTRATIVE LIVE REAL ANALYTICS REPORTS
// ==========================================================================
async function loadAdminData() {
    try {
        const response = await fetch(`${BACKEND_URL}?action=getAdminReports`);
        const res = await response.json();

        if (res.success) {
            document.getElementById('adminUncalledCount').innerText = res.uncalledCount + " Leads";
            document.getElementById('adminTotalCalls').innerText = res.totalCalls + " Calls";
            
            const reportTable = document.getElementById('reportTableBody');
            if (res.logs && res.logs.length > 0) {
                reportTable.innerHTML = "";
                res.logs.forEach(log => {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `<td>${log[0] || '---'}</td><td>${log[1] || '---'}</td><td>${log[2] || '---'}</td><td>${log[3] || '---'}</td><td><span class="lead-tag-new">${log[4] || '---'}</span></td><td>${log[5] || '---'}</td>`;
                    reportTable.appendChild(tr);
                });
            } else {
                reportTable.innerHTML = `<tr><td colspan="6" class="td-empty">Filhal koi calling report maujood nahi hai.</td></tr>`;
            }

            const poolTable = document.getElementById('leadsPoolTableBody');
            if (res.leads && res.leads.length > 0) {
                poolTable.innerHTML = "";
                res.leads.forEach(lead => {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `<td>${lead[0] || '---'}</td><td>${lead[1] || '---'}</td><td>${lead[2] || '---'}</td><td>${lead[3] || 'Unassigned'}</td><td><span class="lead-tag-new">${lead[4] || 'New'}</span></td>`;
                    poolTable.appendChild(tr);
                });
            } else {
                poolTable.innerHTML = `<tr><td colspan="5" class="td-empty">Lead pool khali hai.</td></tr>`;
            }
        }
    } catch (err) { console.error("Admin central tracking exception:", err); }
}

// ==========================================================================
// 6. ADMIN EXCEL DATA IMPORT PARSER LOADER ENGINE
// ==========================================================================
async function handleBulkUpload() {
    const fileInput = document.getElementById('excelFileInput');
    if (fileInput.files.length === 0) { 
        showCustomAlert("Selection Required", "Kripya valid Excel file choose karein.", false); 
        return; 
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    reader.onload = async function(e) {
        let cleanLeads = [];
        try {
            if (isExcel) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                cleanLeads = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            } else {
                const text = e.target.result;
                cleanLeads = text.split("\n").map(r => r.split(",")).filter(r => r.length > 1 && r[0].trim() !== "");
            }

            if (cleanLeads.length <= 1) { 
                showCustomAlert("Validation Error", "Selected sheet data parameters empty hain.", false); 
                return; 
            }

            document.body.style.cursor = 'wait';
            const response = await fetch(BACKEND_URL, {
                method: "POST",
                body: JSON.stringify({ action: "bulkUpload", data: cleanLeads })
            });
            const res = await response.json();
            
            if(res.success) {
                showCustomAlert("Upload Success", `Boom! Total ${res.count} leads database system me map ho gayi hain!`, true);
                fileInput.value = "";
                loadAdminData(); 
            } else {
                showCustomAlert("Upload Rejected", "Database Error: " + res.error, false);
            }
        } catch (err) { 
            showCustomAlert("Fatal Crash", "File extraction pipeline failures.", false); 
        } finally { 
            document.body.style.cursor = 'default'; 
        }
    };

    if (isExcel) reader.readAsArrayBuffer(file); else reader.readAsText(file);
}

// ==========================================================================
// 7. TEMPLATE EXPORTER LINK UTILITY FOR ADMIN DOWNLOADS
// ==========================================================================
function downloadCRMTemplate() {
    const headers = ["Customer Name", "Mobail Number", "Pan Card Number", "Loan Amount", "ROI", "EMI", "Tenure", "Location", "Loan Date", "Salary", "Designation", "Company Name", "Loan Type"];
    const sampleRow = ["Amit Kumar", "9876543210", "ABCDE1234F", "500000", "10.5", "12000", "60", "Noida", "2026-06-07", "50000", "Manager", "Housing.com", "Home Loan"];
    
    const csvRows = [headers.join(","), sampleRow.join(",")];
    const csvString = csvRows.join("\r\n");
    const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "CRM_Click_To_Call_Template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ==========================================================================
// 8. ID GENERATOR ACCOUNT MANAGER FORM CONTROLLER
// ==========================================================================
document.getElementById('createAgentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const role = document.getElementById('newUserRole').value;
    const name = document.getElementById('newAgentName').value;
    const email = document.getElementById('newAgentEmail').value;
    const pass = document.getElementById('newAgentPass').value;

    try {
        const url = `${BACKEND_URL}?action=createUser&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}&role=${encodeURIComponent(role)}`;
        const response = await fetch(url);
        const res = await response.json();
        if(res.success) {
            showCustomAlert("Account Created", `Success: Generated system profile verified access for ${name}`, true);
            document.getElementById('createAgentForm').reset();
        }
    } catch(e) { 
        showCustomAlert("Error Logs", "Identity factory token generation exception.", false); 
    }
});

// ==========================================================================
// 9. AUXILIARY TAB NAVIGATION CONTROLLERS & CLEAR UI
// ==========================================================================
function switchAdminTab(tabId, event) {
    const contents = document.querySelectorAll('.admin-tab-content');
    contents.forEach(c => c.classList.add('hidden'));
    const buttons = document.querySelectorAll('.admin-tab-btn');
    buttons.forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    event.currentTarget.classList.add('active');
}

function logout() {
    location.reload(); 
}

function clearLeadUI() {
    document.getElementById('leadIdDisplay').innerText = "------";
    document.getElementById('currentLeadPhone').innerText = "----------";
    document.getElementById('customerPan').innerText = "---";
    document.getElementById('customerCompany').innerText = "---";
    document.getElementById('customerSalary').innerText = "₹0";
    document.getElementById('customerCibil').innerText = "---";
    document.getElementById('loanType').innerText = "---";
    document.getElementById('existingBank').innerText = "---";
    document.getElementById('existingLoanAmount').innerText = "₹0";
    document.getElementById('dialBtn').href = "#";
}