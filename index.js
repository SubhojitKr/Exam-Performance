
// Global Variables
let ALL_STUDENTS = [];
let ALL_SUBJECTS = [];
let GLOBAL_ANALYTICS_DATA = {};
let GLOBAL_TOP_PERFORMERS = [];
let selectedRow = null;

document.addEventListener('DOMContentLoaded', () => {

    const mainContainer = document.querySelector('.main-container');
    const semContainer = document.querySelector('.semester-container');
    const semSelectedText = semContainer.querySelector('.selected-semester');
    const semMenu = semContainer.querySelector('.dropdown-semester-menu');
    const studentListBody = document.getElementById('student-list-body');

    const viewContainer = document.querySelector('.view-container');
    const viewSelectedText = viewContainer.querySelector('.selected-view');
    const viewMenu = viewContainer.querySelector('.dropdown-view-menu');

    // Toggle dropdown
    viewContainer.addEventListener('click', (e) => {
        if (!viewMenu.contains(e.target)) {
            viewContainer.classList.toggle('open');
        }
    });

    // Handles selecting an item from the menu
    viewMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const newViewText = e.target.textContent;
            const viewName = e.target.dataset.view;

            if (newViewText === viewSelectedText.textContent) {
                viewContainer.classList.remove('open');
                return;
            }

            viewSelectedText.textContent = newViewText;
            viewContainer.classList.remove('open');

            // TODO: switchDashboardView(viewName);
        }
    });

    mainContainer.addEventListener('click', (e) => {
        if (!selectedRow) {
            return;
        }
        if (studentListBody.contains(e.target) || semContainer.contains(e.target) || viewContainer.contains(e.target)) {
            return;
        }
        selectedRow.classList.remove('selected-student-row');
        selectedRow = null;
        buildOverallAnalysis();
    });

    semContainer.addEventListener('click', (e) => {
        if (!semMenu.contains(e.target)) {
            semContainer.classList.toggle('open');
        }
    });

    semMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();

            const newSemesterText = e.target.textContent;
            const filename = e.target.dataset.filename;

            if (newSemesterText === semSelectedText.textContent || !filename) {
                semContainer.classList.remove('open');
                return;
            }

            semSelectedText.textContent = newSemesterText;
            semContainer.classList.remove('open');

            clearDashboardForLoading();

            try {
                window.pyLoadSemester(filename);
            } catch (err) {
                console.error("JavaScript Error couldn't call Python Function:", err);
                showLoadingError(err);
            }
        }
    });


    window.addEventListener('click', (e) => {
        if (!semContainer.contains(e.target)) {
            semContainer.classList.remove('open');
        }
        if (!viewContainer.contains(e.target)) {
            viewContainer.classList.remove('open');
        }
    });


    /*
    * Row Click
    */
    let selectedRow = null;
    studentListBody.addEventListener('click', (event) => {
        const clickedRow = event.target.closest('.student-data-row');
        if (!clickedRow) { return; }
        if (selectedRow && selectedRow !== clickedRow) {
            selectedRow.classList.remove('selected-student-row');
        }
        clickedRow.classList.toggle('selected-student-row');
        selectedRow = clickedRow.classList.contains('selected-student-row') ? clickedRow : null;
        if (selectedRow) {
            const enrollment = selectedRow.dataset.enrollment;
            const student = ALL_STUDENTS.find(s => s.Enrollment === enrollment);
            if (student) {
                buildStudentAnalysis(student);
            }
        } else {
            buildOverallAnalysis();
        }
    });


    /*
    * SEARCH BAR
    */
    const searchBar = document.getElementById('search-bar');
    const clearBtn = document.getElementById('search-clear-btn');

    searchBar.addEventListener('input', (event) => {
        const query = event.target.value.trim().toLowerCase();

        if (query.length > 0) {
            clearBtn.style.display = 'block';
            performSearch(query);
        } else {
            clearBtn.style.display = 'none';
            renderStudentRows(ALL_STUDENTS);
        }
    });
    clearBtn.addEventListener('click', clearSearch);
});


function clearDashboardForLoading() {
    document.getElementById("student-list-body").innerHTML = '<div class="loading">Loading student data...</div>';
    document.getElementById("subject-header-container").innerHTML = '';
    document.getElementById("analytics-body").innerHTML = '';
    document.querySelector('.analytics-header').textContent = 'Loading...';
    selectedRow = null;
    clearSearch();
}

window.showLoadingError = function(error) {
    document.getElementById("student-list-body").innerHTML = `<div class="loading">Error loading data: ${error}</div>`;
}

function clearSearch() {
    document.getElementById('search-bar').value = '';
    document.getElementById('search-clear-btn').style.display = 'none';
    renderStudentRows(ALL_STUDENTS);
}

function performSearch(query) {
    const searchResults = ALL_STUDENTS.filter(student => {
        const nameMatch = student.Name.toLowerCase().includes(query);
        const enrollMatch = student.Enrollment.toLowerCase().includes(query);
        return nameMatch || enrollMatch;
    });

    // Render just the results (this could be 0 rows or 50)
    renderStudentRows(searchResults);
}

function renderStudentRows(arrayToRender) {
    const body = document.getElementById("student-list-body");

    if (arrayToRender.length === 0) {
        body.innerHTML = '<div class="loading">No students found.</div>';
        return;
    }

    const allRowsHtml = arrayToRender.map(student => {
        const subjectsHtml = ALL_SUBJECTS.map(subjectKey =>
            `<div class="subject-data">${student[subjectKey] || '-'}</div>`
        ).join('');

        const sgpa = (student.SGPA !== null && student.SGPA !== undefined) ? Number(student.SGPA).toFixed(2) : 'N/A';
        const cgpa = (student.CGPA !== null && student.CGPA !== undefined) ? Number(student.CGPA).toFixed(2) : 'N/A';


        return `
        <div class="student-data-row" data-enrollment="${student.Enrollment}">
            <div class="unskew-wrapper">
                <div class="studentinfo-data-container">
                    <div class="name-data">${student.Name}</div>
                    <div class="enrollment-data">${student.Enrollment}</div>
                </div>
                <div class="subject-data-container" style="--num-subjects: ${ALL_SUBJECTS.length};">
                    ${subjectsHtml}
                </div>
                <div class="grades-data-container">
                    <div class="sgpa-data">${sgpa}</div>
                    <div class="cgpa-data">${cgpa}</div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    body.innerHTML = allRowsHtml;
}

function buildStudentAnalysis(student) {
    const firstName = student.Name.split(' ')[0];
    document.querySelector('.analytics-header').textContent = `${firstName}'s Performance Analysis`;

    const analyticsBody = document.getElementById('analytics-body');

    const failingGrades = ['F', 'FF'];
    const subjectGrades = ALL_SUBJECTS.map(sub => student[sub]);
    const failCount = subjectGrades.filter(grade => failingGrades.includes(grade)).length;

    let statusText = '';
    let statusClass = '';
    if (failCount === 0) {
        statusText = 'Pass';
        statusClass = 'passed';
    } else if (failCount <= 5) {
        statusText = 'Promoted';
        statusClass = 'promoted';
    } else {
        statusText = 'Fail';
        statusClass = 'failed';
    }

    const sortedStudents = [...ALL_STUDENTS].sort((a, b) => b.SGPA - a.SGPA);
    const rank = sortedStudents.findIndex(s => s.Enrollment === student.Enrollment) + 1;

    const arrearsList = ALL_SUBJECTS.filter(sub => failingGrades.includes(student[sub]));
    const arrearsHtml = arrearsList.length > 0
        ? arrearsList.map(sub => `<li class="arrear-item">${sub}</li>`).join('')
        : '<li>No Backlog</li>';

    analyticsBody.innerHTML = `
        <div class="student-analysis-container">
            <div class="analysis-card">
                <div class="analysis-stat-row">
                    <span>Status:</span>
                    <span class="stat-value-main ${statusClass}">${statusText}</span>
                </div>
                <div class="analysis-stat-row">
                    <span>SGPA:</span>
                    <span class="stat-value-main">${Number(student.SGPA).toFixed(2)}</span>
                </div>
                <div class="analysis-stat-row">
                    <span>Class Rank:</span>
                    <span class="stat-value-main">#${rank}</span>
                </div>
                <div class="analysis-stat-row">
                    <span>Backlogs: (${failCount}):</span>
                    
                </div>
                <ul class="arrears-list">
                    ${arrearsHtml}
                </ul>
            </div>
        </div>
    `;
}


function buildOverallAnalysis() {
    document.querySelector('.analytics-header').textContent = 'OVERALL ANALYSIS';

    const analyticsBody = document.getElementById('analytics-body');
    analyticsBody.innerHTML = `
        <div id="pass-fail-container" class="pass-fail-container"></div>
        <div id="top-students-container" class="top-students-container"></div>
    `;

    createPassFailCards(GLOBAL_ANALYTICS_DATA);
    createTopStudentsList(GLOBAL_TOP_PERFORMERS);

    animateCountUp('percent-pass', GLOBAL_ANALYTICS_DATA.pass_percentage);
    animateCountUp('percent-promoted', GLOBAL_ANALYTICS_DATA.promoted_percentage);
    animateCountUp('percent-fail', GLOBAL_ANALYTICS_DATA.fail_percentage);

    const topPerfContainer = document.getElementById('top-students-container');
    topPerfContainer.classList.remove('start-top-performer-animation');

    requestAnimationFrame(() => {
        topPerfContainer.classList.add('start-top-performer-animation');
    });
}


window.buildDashboard = function (jsonData) {
    try {
        const data = JSON.parse(jsonData);
        ALL_STUDENTS = data.students;
        ALL_SUBJECTS = data.subjects;

        GLOBAL_ANALYTICS_DATA = data.analytics;
        GLOBAL_TOP_PERFORMERS = data.top_performers;

        createHeaders(ALL_SUBJECTS);
        renderStudentRows(ALL_STUDENTS);


        buildOverallAnalysis();

        document.getElementById('search-bar').value = '';
        document.getElementById('search-clear-btn').style.display = 'none';

        const studentListBody = document.getElementById('student-list-body');
        studentListBody.classList.remove('animate-slide-up-body');

        requestAnimationFrame(() => {
            studentListBody.classList.add('animate-slide-up-body');
        });
    }
    catch (error) {
        console.error("JavaScript Error building dashboard:", error);
        document.getElementById("student-list-body").innerHTML = `<div class="loading">Error building dashboard. See console.</div>`;
    }
};



function animateCountUp(targetId, finalValue, duration = 1500) {
    const element = document.getElementById(targetId);
    if (!element) return;

    let startTime = null;

    function animationLoop(currentTime) {
        if (startTime === null) {
            startTime = currentTime;
        }
        const elapsedTime = currentTime - startTime;

        if (elapsedTime >= duration) {
            element.textContent = finalValue.toFixed(1) + "%";
            return;
        }

        const progress = elapsedTime / duration;
        const easeOutProgress = 1 - Math.pow(1 - progress, 6);

        let currentValue = finalValue * easeOutProgress;
        // currentValue = Math.floor(currentValue / 0.2) * 0.2;

        element.textContent = currentValue.toFixed(1) + "%";

        requestAnimationFrame(animationLoop);
    }

    requestAnimationFrame(animationLoop);
}


/**
 * HEADERS
 */
function createHeaders(subjects) {
    const container = document.getElementById("subject-header-container");
    container.style.setProperty('--num-subjects', subjects.length);
    const html = subjects.map(subject => `<div class="subject-header">${subject}</div>`).join('');
    container.innerHTML = html;
}

/**
 * PASS/FAIL
 */
function createPassFailCards(analytics) {
    const container = document.getElementById("pass-fail-container");
    container.innerHTML = `
    <div class="pass-fail-container">
        <div class="stat-column">
            <div class="stat-item">
                <div class="stat-title">Pass</div>
                <div class="stat-value passed" id="percent-pass">0.0%</div>
            </div>
            <div class="stat-item">
                <div class="stat-title">Students Passed</div>
                <div class="stat-value passed" id="pass-student">${analytics.passed_students}<sub>${analytics.total_students}</sub></div>
            </div>
        </div>
        <div class="stat-column">
            <div class="stat-item">
                <div class="stat-title">Promoted</div>
                <div class="stat-value promoted" id="percent-promoted">0.0%</div>
            </div>
            <div class="stat-item">
                <div class="stat-title">Students Promoted</div>
                <div class="stat-value promoted" id="promoted-student">${analytics.promoted_students}<sub>${analytics.total_students}</sub></div>
            </div>
        </div>
        <div class="stat-column">
            <div class="stat-item">
                <div class="stat-title">Fail</div>
                <div class="stat-value failed" id="percent-fail">0.0%</div>
            </div>
            <div class="stat-item">
                <div class="stat-title">Students Failed</div>
                <div class="stat-value failed" id="fail-student">${analytics.failed_students}<sub>${analytics.total_students}</sub></div>
            </div>
        </div>
    </div>
    `;
}

/**
 * TOP PERFORMER
 */
function createTopStudentsList(topPerformers) {
    const container = document.getElementById("top-students-container");
    const performersHtml = topPerformers.map((student, index) => {
        return `
        <div class="top-performer-item">
            <div class="rank-box">#${index + 1}</div>
            <div class="student-info-section">
                <span class="student-name">${student.Name}</span>
                <span class="student-sgpa">${student.SGPA.toFixed(2)}</span>
            </div>
        </div>
        `;
    }).join('');
    container.innerHTML = `<div class="analytics-card-title">Top 3 Performers 🏆</div>${performersHtml}`;
}