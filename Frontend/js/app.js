/********************************************
 * FETCH STUDENT DATA (unchanged API logic)
 ********************************************/
var fetchStudentData = () => {
    var endpoint = 'https://vmgjhpngo6.execute-api.us-east-1.amazonaws.com/student-api/getStudent';

    return fetch(endpoint)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => updateTable(data))
        .catch(error => console.error('Error fetching student data:', error));
};


/********************************************
 * UPDATE TABLE (unchanged API response logic)
 ********************************************/
var updateTable = (data) => {
    var tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = "";

    if (Array.isArray(data)) {
        data.forEach(student => {
            var row = tbody.insertRow();

            row.insertCell(0).innerText = student.roll_number;
            row.insertCell(1).innerText = student.student_name;
            row.insertCell(2).innerText = student.student_class;
        });
    }
    else if (data.statusCode && data.body) {
        console.error('Error response from API:', data.body);
    }
    else {
        console.error('Unexpected response:', data);
    }
};


/********************************************
 * ADD STUDENT (core logic UNTOUCHED)
 ********************************************/
var addStudent = (rollNumber, studentName, className) => {

    // VALIDATION BLOCK
    if (!rollNumber || !studentName || className === 'Select') {
        openModal();  // NEW modal logic (fixed)
        disableTextFields();
        return;
    }

    closeModal(); // hide modal before submitting

    var endpoint = 'https://vmgjhpngo6.execute-api.us-east-1.amazonaws.com/student-api/addStudent';

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "roll_number": rollNumber,
        "student_name": studentName,
        "student_class": className
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(endpoint, requestOptions)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');

            // clear fields
            document.getElementById('rollNumber').value = '';
            document.getElementById('studentName').value = '';
            document.getElementById('class').value = 'Select';

            return response.text();
        })
        .then(() => fetchStudentData())
        .catch(error => console.log('error', error));
};


/********************************************
 * TEXT FIELDS ENABLE/DISABLE
 ********************************************/
function disableTextFields() {
    document.getElementById('rollNumber').disabled = true;
    document.getElementById('studentName').disabled = true;
    document.getElementById('class').disabled = true;
}

function enableTextFields() {
    document.getElementById('rollNumber').disabled = false;
    document.getElementById('studentName').disabled = false;
    document.getElementById('class').disabled = false;
}


/********************************************
 * MODAL HANDLING (FIXED + CLEAN)
 ********************************************/
function openModal() {
    const modal = document.getElementById("customModal");
    modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
    const modal = document.getElementById("customModal");
    modal.setAttribute("aria-hidden", "true");
    enableTextFields();
}

window.closeModal = closeModal; // required for inline &times; button


/********************************************
 * FORM SUBMISSION (unchanged behavior)
 ********************************************/
document.getElementById('studentForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var roll = document.getElementById('rollNumber').value.trim();
    var name = document.getElementById('studentName').value.trim();
    var cls = document.getElementById('class').value;

    addStudent(roll, name, cls);
});


/********************************************
 * THEME TOGGLE (UNCHANGED)
 ********************************************/
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
});

(function () {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
})();


/********************************************
 * LOADING INDICATOR HANDLING
 ********************************************/
const loadingIndicator = document.getElementById('loadingIndicator');

function showLoading() {
    loadingIndicator.style.display = 'block';
    loadingIndicator.setAttribute('aria-hidden', 'false');
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    loadingIndicator.setAttribute('aria-hidden', 'true');
}


// WRAP FETCH WITH LOADING
const _origFetchStudents = fetchStudentData;
fetchStudentData = function () {
    showLoading();
    return _origFetchStudents().finally(hideLoading);
};


/********************************************
 * INITIAL FETCH
 ********************************************/
window.addEventListener('load', fetchStudentData);


/********************************************
 * YEAR FOOTER
 ********************************************/
document.getElementById('year').textContent = new Date().getFullYear();


/********************************************
 * PWA SERVICE WORKER
 ********************************************/
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
}
