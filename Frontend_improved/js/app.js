
        var fetchStudentData = () => {
            //API Gateway endpoint for fetching student data
            var endpoint = 'https://sz624okgl4.execute-api.us-east-1.amazonaws.com/student-apistage/getStudent'; // Replace with your actual endpoint
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

            var endpoint = 'https://sz624okgl4.execute-api.us-east-1.amazonaws.com/student-apistage/addStudent';

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



// --- Additional UI features injected non-invasively ---

// Utility: toasts
const toastsRoot = document.createElement('div'); toastsRoot.className='toasts'; document.body.appendChild(toastsRoot);
function showToast(msg, timeout=3000){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; toastsRoot.appendChild(t); setTimeout(()=>{ t.style.opacity=0; setTimeout(()=>t.remove(),300) }, timeout)}

// Search / filter / sort / pagination variables
let allStudentsCache = []; // raw data
let filteredStudents = [];
let currentPage = 1;
let rowsPerPageEl = document.getElementById('rowsPerPage');
let rowsPerPage = parseInt(rowsPerPageEl.value || '10', 10);

// helper to render table rows with avatar and animations
function renderTable(data){
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML='';
    data.forEach((student, idx)=>{
        const tr = document.createElement('tr');
        tr.className='row-animate';
        // avatar cell + roll, name, class
        const td0 = document.createElement('td');
        const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.alignItems='center';
        const avatar = document.createElement('span');
        avatar.className='avatar'; avatar.textContent = (student.student_name || (student.name || '')).charAt(0).toUpperCase() || '?';
        wrapper.appendChild(avatar);
        const rollSpan = document.createElement('span'); rollSpan.style.marginLeft='8px'; rollSpan.textContent = student.roll_number || '';
        wrapper.appendChild(rollSpan);
        td0.appendChild(wrapper);
        const td1 = document.createElement('td'); td1.textContent = student.student_name || '';
        const td2 = document.createElement('td'); td2.textContent = student.student_class || '';
        tr.appendChild(td0); tr.appendChild(td1); tr.appendChild(td2);
        tbody.appendChild(tr);
        // reveal animation
        requestAnimationFrame(()=>{ setTimeout(()=>tr.classList.add('visible'), 20 + idx*30) });
    });
}

// basic export CSV
function exportToCSV(rows, filename='students.csv'){
    if(!rows || !rows.length){ showToast('No data to export'); return; }
    const headers = ['roll_number','student_name','student_class'];
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => '"'+String(r[h]||'').replace(/"/g,'""')+'"').join(','))).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
    showToast('Exported CSV');
}

// copy table to clipboard
function copyTableToClipboard(){
    if(!filteredStudents.length){ showToast('No data'); return; }
    const text = filteredStudents.map(s => `${s.roll_number}\t${s.student_name}\t${s.student_class}`).join('\n');
    navigator.clipboard.writeText(text).then(()=> showToast('Copied to clipboard')).catch(()=> showToast('Copy failed'));
}

// apply filters and pagination
function applyFiltersAndRender(){
    const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    const cls = document.getElementById('filterClass').value || '';
    filteredStudents = allStudentsCache.filter(s=>{
        const matchSearch = !search || (s.student_name||'').toLowerCase().includes(search) || (s.roll_number||'').toString().toLowerCase().includes(search);
        const matchClass = !cls || (s.student_class||'') === cls;
        return matchSearch && matchClass;
    });
    // pagination
    rowsPerPage = parseInt(rowsPerPageEl.value || '10', 10);
    const total = filteredStudents.length;
    const start = (currentPage-1)*rowsPerPage;
    const pageData = filteredStudents.slice(start, start+rowsPerPage);
    renderTable(pageData);
    renderPagination(Math.ceil(total/rowsPerPage));
}

// build pagination UI
function renderPagination(totalPages){
    let container = document.querySelector('.pagination');
    if(!container){ container = document.createElement('div'); container.className='pagination'; document.querySelector('.table-wrap').appendChild(container); }
    container.innerHTML='';
    for(let i=1;i<=Math.max(1,totalPages);i++){
        const b = document.createElement('button'); b.className='pager-btn'; b.textContent=i; if(i===currentPage) b.style.opacity=0.6;
        b.addEventListener('click', ()=>{ currentPage=i; applyFiltersAndRender(); });
        container.appendChild(b);
    }
}

// hook controls
document.getElementById('searchInput').addEventListener('input', ()=>{ currentPage=1; applyFiltersAndRender(); });
document.getElementById('filterClass').addEventListener('change', ()=>{ currentPage=1; applyFiltersAndRender(); });
document.getElementById('rowsPerPage').addEventListener('change', ()=>{ currentPage=1; applyFiltersAndRender(); });

// export/copy buttons
document.getElementById('exportCsv').addEventListener('click', ()=>exportToCSV(allStudentsCache));
document.getElementById('copyTable').addEventListener('click', ()=>copyTableToClipboard());

// sheet FAB handlers
const fab = document.getElementById('fabAdd');
const sheet = document.getElementById('bottomSheet');
const sheetForm = document.getElementById('sheetForm');
const sheetCancel = document.getElementById('sheetCancel');
fab.addEventListener('click', ()=>{ sheet.setAttribute('aria-hidden','false'); sheet.classList.add('open'); document.getElementById('sheetRoll').focus(); });
sheetCancel.addEventListener('click', ()=>{ sheet.setAttribute('aria-hidden','true'); });

// sync sheet form to main addStudent logic (preserve API contract)
sheetForm.addEventListener('submit', function(e){
    e.preventDefault();
    const roll = document.getElementById('sheetRoll').value.trim();
    const name = document.getElementById('sheetName').value.trim();
    const cls = document.getElementById('sheetClass').value;
    addStudent(roll, name, cls);
    sheet.setAttribute('aria-hidden','true');
    sheetForm.reset();
});

// autosave draft for main form and sheet form
function saveDraft(){ const draft = {}; ['rollNumber','studentName','class'].forEach(id=>{ const el=document.getElementById(id); if(el) draft[id]=el.value; }); localStorage.setItem('studentFormDraft', JSON.stringify(draft)); }
function restoreDraft(){ const d = JSON.parse(localStorage.getItem('studentFormDraft')||'{}'); if(d.rollNumber) document.getElementById('rollNumber').value = d.rollNumber; if(d.studentName) document.getElementById('studentName').value = d.studentName; if(d.class) document.getElementById('class').value = d.class; }
['rollNumber','studentName','class'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('input', saveDraft); });
restoreDraft();

// local cache and fetch wrapper: override existing fetchStudentData to cache results
const originalFetchStudentData = fetchStudentData;
fetchStudentData = function(){
    showLoading();
    return originalFetchStudentData().then(()=>{
        // read table rows into cache (attempt)
        const tbody = document.getElementById('studentTableBody');
        const rows = Array.from(tbody.querySelectorAll('tr')).map(tr=>{
            const tds = tr.querySelectorAll('td');
            // depending on structure: avatar+roll in first td
            const roll = (tds[0] && tds[0].querySelector('span:last-child')) ? tds[0].querySelector('span:last-child').textContent.trim() : (tds[1]?tds[1].textContent.trim():'');
            return { roll_number: roll, student_name: (tds[1]?tds[1].textContent.trim():''), student_class: (tds[2]?tds[2].textContent.trim():'')};
        });
        if(rows && rows.length) { allStudentsCache = rows; filteredStudents = rows; currentPage=1; applyFiltersAndRender(); localStorage.setItem('studentsCache', JSON.stringify(rows)); }
    }).catch(err=>{
        const cached = JSON.parse(localStorage.getItem('studentsCache')||'[]');
        if(cached && cached.length){ allStudentsCache = cached; filteredStudents = cached; applyFiltersAndRender(); showToast('Loaded cached data (offline)'); } else { showToast('Failed to load students'); }
    }).finally(()=>{ hideLoading(); });
}

// expose a hook so addStudent can call and refresh cache after success
function refreshAfterAdd(){ fetchStudentData(); }
window.refreshAfterAdd = refreshAfterAdd;

// keyboard shortcuts
window.addEventListener('keydown', function(e){
    if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ const submit = document.querySelector('#studentForm button[type=submit]'); if(submit) submit.click(); }
    if(e.key === '/'){ e.preventDefault(); document.getElementById('searchInput').focus(); }
    if(e.key === 'Escape'){ if(sheet.getAttribute('aria-hidden') === 'false') sheet.setAttribute('aria-hidden','true'); const modal = document.getElementById('customModal'); if(modal && modal.getAttribute('aria-hidden')==='false') closeModal(); }
});

// copy to clipboard helper exposed
window.copyTableToClipboard = copyTableToClipboard;

// initial cache population
(function(){ try{ const cached = JSON.parse(localStorage.getItem('studentsCache')||'[]'); if(cached && cached.length){ allStudentsCache = cached; filteredStudents = cached; applyFiltersAndRender(); } }catch(e){} })();
