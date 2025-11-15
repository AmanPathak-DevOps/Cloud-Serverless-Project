
        var fetchStudentData = () => {
            //API Gateway endpoint for fetching student data
            var endpoint = '<API_GET_ENDPOINT>'; // Replace with your actual endpoint
            // Make API call to fetch student data
            fetch(endpoint)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    updateTable(data);
                })
                .catch(error => console.error('Error fetching student data:', error));
        }

        // Function to update the table with fetched student data
        var updateTable = (data) => {
            var tbody = document.getElementById('studentTableBody');
            tbody.innerHTML = "";

            if (Array.isArray(data)) {
                data.forEach(student => {
                    var row = tbody.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            cell1.innerHTML = student.roll_number;
            cell2.innerHTML = student.student_name;
            cell3.innerHTML = student.student_class;
        });
            } else if (data.statusCode && data.body) {
                console.error('Error response from API:', data.body);
            } else {
                console.error('Unexpected response from API:', data);
            }
        }



        // callAPI function that takes the base and exponent numbers as parameters
        var addStudent = (rollNumber, studentName, className) => {
            
            if (!rollNumber || !studentName || className === 'Select') {
                // alert('Please fill out all fields');
                document.getElementById('customModal').style.display = 'block';
                document.getElementById('rollNumber').disabled = true;
            document.getElementById('studentName').disabled = true;
            document.getElementById('class').disabled = true;

                return;
            }

            closeModal();
            
            var endpoint = '<API_POST_ENDPOINT>';

            // Instantiate a headers object
            var myHeaders = new Headers();
            // Add content type header to object
            myHeaders.append("Content-Type", "application/json");

            // Using built-in JSON utility package to turn object to string and store in a variable
            var raw = JSON.stringify({
                "roll_number": rollNumber,
                "student_name": studentName,
                "student_class": className
            });

            // Create a JSON object with parameters for API call and store in a variable
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            fetch(endpoint, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    // Clear input fields on success
                    document.getElementById('rollNumber').value = '';
                    document.getElementById('studentName').value = '';
                    document.getElementById('class').value = 'Select';
                    return response.text();
                })
                .then(result => {
                    // alert(JSON.parse(result).body);
                    fetchStudentData();
                })
                .catch(error => console.log('error', error));
        }
        function closeModal() {
            document.getElementById('customModal').style.display = 'none';
            enableTextFields();
        }
        function enableTextFields() {
        document.getElementById('rollNumber').disabled = false;
        document.getElementById('studentName').disabled = false;
        document.getElementById('class').disabled = false;
    }


        window.addEventListener('load', fetchStudentData);
    

// preserve original functions above. Add UI glue without changing API logic:
document.getElementById('year').textContent = new Date().getFullYear();

// form handling: keep original data keys and call addStudent (preserves backend contract)
document.getElementById('studentForm').addEventListener('submit', function(e){
    e.preventDefault();
    var roll = document.getElementById('rollNumber').value.trim();
    var name = document.getElementById('studentName').value.trim();
    var cls = document.getElementById('class').value;
    // basic client validation same as before
    addStudent(roll, name, cls);
});

// theme toggle
const themeToggle = document.getElementById('themeToggle');
function setTheme(theme){
    if(theme === 'light') document.documentElement.setAttribute('data-theme','light');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
}
themeToggle.addEventListener('click', function(){
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
});
(function(){
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
})();

// accessible modal management (ARIA)
function openModal(){
    const modal = document.getElementById('customModal');
    modal.setAttribute('aria-hidden','false');
    modal.style.display='flex';
}
function closeModal(){
    const modal = document.getElementById('customModal');
    modal.setAttribute('aria-hidden','true');
    modal.style.display='none';
    enableTextFields();
}
window.closeModal = closeModal; // expose for inline handlers if any

// loading indicator management
const loadingIndicator = document.getElementById('loadingIndicator');
function showLoading(){ loadingIndicator.style.display='block'; loadingIndicator.setAttribute('aria-hidden','false'); }
function hideLoading(){ loadingIndicator.style.display='none'; loadingIndicator.setAttribute('aria-hidden','true'); }

// wrap fetchStudentData to show skeleton
const _origFetch = fetchStudentData;
fetchStudentData = function(){
    showLoading();
    return _origFetch().finally(()=>{ hideLoading(); });
}

// service worker registration for PWA (non-blocking)
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{/*fail silently*/});
}
