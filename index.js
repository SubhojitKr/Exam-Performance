
// Global Variables
let ALL_STUDENTS = [];
let ALL_SUBJECTS = [];
let GLOBAL_ANALYTICS_DATA = {};
let GLOBAL_SUBJECT_ANALYSIS = {};
let GLOBAL_SUBJECT_CODE_MAP = {};
let GLOBAL_TOP_PERFORMERS = [];
let selectedRow = null;
let DIRECTORY_MAP = {};

// filters for the main page
let selectedSchool = '';
let selectedDepartment = '';
let selectedProgram = '';
let selectedBatch = '';
let selectedSemester = '';

// filters for the landing page
let landingSelectedSchool = '';
let landingSelectedDepartment = '';
let landingSelectedProgram = '';
let landingSelectedBatch = '';
let landingSelectedSemester = '';

// specialization filters
let selectedProgramType = 'ALL';
let selectedSpecialization = null;

let landingViewContainer = null;
let resultsViewContainer = null;
let studentListContainer = null;
let analyticsContainer = null;
let subjectListContainer = null;
let subjectDetailsContainer = null;



/*
*  Initialization
*/
window.startApp = function(jsonMap) {
    try {
        console.log("Starting ...");
        DIRECTORY_MAP = JSON.parse(jsonMap);
        populateLandingSchoolDropdown();
        const schoolMenu = document.getElementById('department-dropdown-menu');
        schoolMenu.innerHTML = '';

        for (const school in DIRECTORY_MAP) {
            const schoolItem = document.createElement('li');
            schoolItem.className = 'general-dropdown-item school-item';
            schoolItem.textContent = school.replace(/_/g, ' ');
            schoolItem.dataset.school = school;
            schoolMenu.appendChild(schoolItem);
        }
    } catch (e) {
        console.error("Failed to parse directory map:", e);
        showLoadingError("Could not initialize selectors.");
    }
};




function navigateTo(viewToShow) {
    const homeBtn = document.getElementById('top-header-home-btn');
    const resultBtn = document.getElementById('top-header-result-btn');

    if(viewToShow.toUpperCase() === 'RESULT') {
        landingViewContainer.classList.add('hidden');
        resultsViewContainer.classList.remove('hidden');
        homeBtn.classList.remove('active');
        resultBtn.classList.add('active');
    }
    else {
        landingViewContainer.classList.remove('hidden');
        resultsViewContainer.classList.add('hidden');
        homeBtn.classList.add('active');
        resultBtn.classList.remove('active');
    }
}
function resetLandingPageSelections() {
    landingSelectedSchool = '';
    landingSelectedDepartment = '';
    landingSelectedProgram = '';
    landingSelectedBatch = '';
    landingSelectedSemester = '';

    document.getElementById('landing-selected-department-text').textContent = 'Select Department';
    document.getElementById('landing-selected-program-text').textContent = 'Select Program';
    document.getElementById('landing-selected-batch-text').textContent = 'Select Batch';
    document.getElementById('landing-selected-semester-text').textContent = 'Select Semester';

    document.getElementById('landing-program-dropdown-menu').innerHTML = '';
    document.getElementById('landing-batch-dropdown-menu').innerHTML = '';
    document.getElementById('landing-semester-dropdown-menu').innerHTML = '';
}
function populateLandingSchoolDropdown() {
    try {
        const schoolMenu = document.getElementById('landing-department-dropdown-menu');
        schoolMenu.innerHTML = '';
        for (const school in DIRECTORY_MAP) {
            const schoolItem = document.createElement('li');
            schoolItem.className = 'general-dropdown-item school-item';
            schoolItem.textContent = school.replace(/_/g, ' ');
            schoolItem.dataset.school = school;
            schoolMenu.appendChild(schoolItem);
        }
    } catch (e) {
        console.error("Failed to populate landing page dropdown:", e);
    }
}
function updateLandingProgramDropdown() {
    const programMenu = document.getElementById('landing-program-dropdown-menu');
    programMenu.innerHTML = '';
    if (landingSelectedSchool && landingSelectedDepartment && DIRECTORY_MAP[landingSelectedSchool]?.[landingSelectedDepartment]) {
        const programs = Object.keys(DIRECTORY_MAP[landingSelectedSchool][landingSelectedDepartment]);
        programs.forEach(prog => {
            const item = document.createElement('div');
            item.className = 'general-dropdown-item';
            item.textContent = prog.replace(/_/g, ' ');
            item.dataset.value = prog;
            programMenu.appendChild(item);
        });
    }
}
function updateLandingBatchDropdown() {
    const batchMenu = document.getElementById('landing-batch-dropdown-menu');
    batchMenu.innerHTML = '';
    if (landingSelectedProgram && DIRECTORY_MAP[landingSelectedSchool]?.[landingSelectedDepartment]?.[landingSelectedProgram]) {
        const batches = Object.keys(DIRECTORY_MAP[landingSelectedSchool][landingSelectedDepartment][landingSelectedProgram]);
        batches.forEach(batch => {
            const item = document.createElement('div');
            item.className = 'general-dropdown-item';
            item.textContent = batch;
            item.dataset.value = batch;
            batchMenu.appendChild(item);
        });
    }
}
function updateLandingSemesterDropdown() {
    const semesterMenu = document.getElementById('landing-semester-dropdown-menu');
    semesterMenu.innerHTML = '';
    if (landingSelectedBatch && DIRECTORY_MAP[landingSelectedSchool]?.[landingSelectedDepartment]?.[landingSelectedProgram]?.[landingSelectedBatch]) {
        const semesters = DIRECTORY_MAP[landingSelectedSchool][landingSelectedDepartment][landingSelectedProgram][landingSelectedBatch];
        semesters.forEach(semFile => {
            const item = document.createElement('div');
            item.className = 'general-dropdown-item';
            const semText = semFile.match(/\d+/)?.[0] || semFile.replace('.csv','').replace('_',' ');
            item.textContent = `Semester ${semText}`;
            item.dataset.value = semFile;
            semesterMenu.appendChild(item);
        });
    }
}



function applyAllFilters() {
    let filteredStudents = [...ALL_STUDENTS];
    let isGroupedView = false;

    if (selectedProgramType === 'REGULAR') {
        filteredStudents = filteredStudents.filter(student => student.Program_Type === 'Regular');
    } else if (selectedProgramType === 'SPECIALIZATION') {
        const allSpecializations = ['DS-AI', 'AIML', 'IOT'];
        if (selectedSpecialization) {
            filteredStudents = filteredStudents.filter(student => student.Program_Type === selectedSpecialization);
        } else {
            filteredStudents = filteredStudents.filter(student => allSpecializations.includes(student.Program_Type));
            isGroupedView = true;
        }
    }

    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    if (query) {
        filteredStudents = filteredStudents.filter(student => {
            return student.Name.toLowerCase().includes(query) || student.Enrollment.toLowerCase().includes(query);
        });
        isGroupedView = false;
    }
    renderStudentRows(filteredStudents, isGroupedView);
}

document.addEventListener('DOMContentLoaded', () => {
    const schoolMenu = document.getElementById('department-dropdown-menu');
    const deptSubmenu = document.getElementById('department-submenu');
    const programMenu = document.getElementById('program-dropdown-menu');
    const batchMenu = document.getElementById('batch-dropdown-menu');
    const semesterMenu = document.getElementById('semester-dropdown-menu');
    const searchBar = document.getElementById('search-bar');
    const clearBtn = document.getElementById('search-clear-btn');
    const mainContainer = document.querySelector('.main-container');
    const studentListBody = document.getElementById('student-list-body');
    const backToListBtn = document.getElementById('back-to-list-btn');

    studentListContainer = document.getElementById('student-list-container');
    analyticsContainer = document.getElementById('analytics-container');
    subjectListContainer = document.getElementById('subject-list-container');

    landingViewContainer = document.getElementById('landing-view-container');
    resultsViewContainer = document.getElementById('results-view-container');
    const projectTitleBtn = document.querySelector('.top-header-title');
    const homeBtn = document.getElementById('top-header-home-btn');
    const resultBtn = document.getElementById('top-header-result-btn');
    const viewResultBtn = document.getElementById('landing-view-result-btn');

    projectTitleBtn.addEventListener('click', () => {
        navigateTo('home');
        resetLandingPageSelections();
    });
    homeBtn.addEventListener('click', () => {
        navigateTo('home');
    });
    resultBtn.addEventListener('click', () => {
        navigateTo('result');
    });

    viewResultBtn.addEventListener('click', () => {
        if (!landingSelectedSchool || !landingSelectedDepartment || !landingSelectedProgram || !landingSelectedBatch || !landingSelectedSemester) {
            alert("Please make a selection for all fields.");
            return;
        }
        // landing page to the main page
        selectedSchool = landingSelectedSchool;
        selectedDepartment = landingSelectedDepartment;
        selectedProgram = landingSelectedProgram;
        selectedBatch = landingSelectedBatch;
        selectedSemester = landingSelectedSemester;

        document.getElementById('selected-department-text').textContent = document.getElementById('landing-selected-department-text').textContent;
        document.getElementById('selected-program-text').textContent = document.getElementById('landing-selected-program-text').textContent;
        document.getElementById('selected-batch-text').textContent = document.getElementById('landing-selected-batch-text').textContent;
        document.getElementById('selected-semester-text').textContent = document.getElementById('landing-selected-semester-text').textContent;

        updateProgramDropdown(true);
        updateBatchDropdown(true);
        updateSemesterDropdown(true);

        navigateTo('result');
        loadSelectedData();
    });

    const landingSchoolMenu = document.getElementById('landing-department-dropdown-menu');
    const landingDeptSubmenu = document.getElementById('landing-department-submenu');
    const landingProgramMenu = document.getElementById('landing-program-dropdown-menu');
    const landingBatchMenu = document.getElementById('landing-batch-dropdown-menu');
    const landingSemesterMenu = document.getElementById('landing-semester-dropdown-menu');
    const landingDeptToolContainer = document.getElementById('landing-department-tool-container');

    landingDeptToolContainer.addEventListener('mouseleave', () => {
        landingDeptSubmenu.style.display = "none";
        document.querySelectorAll('#landing-department-dropdown-menu .school-item').forEach(item => {
            item.classList.remove('active');
        });
    });

    landingSchoolMenu.addEventListener('mouseover', (event) => {
        const schoolItem = event.target.closest('.school-item');
        if (!schoolItem) return;

        if (schoolItem.classList.contains('active')) {
            return;
        }
        document.querySelectorAll('#landing-department-dropdown-menu .school-item').forEach(item => {
            item.classList.remove('active');
        });
        schoolItem.classList.add('active');

        const schoolName = schoolItem.dataset.school;
        const departments = Object.keys(DIRECTORY_MAP[schoolName]);
        landingDeptSubmenu.innerHTML = '';
        departments.forEach(dept => {
            const deptItem = document.createElement('div');
            deptItem.className = 'general-dropdown-item department-item';
            deptItem.textContent = dept.replace(/_/g, ' ');
            deptItem.dataset.school = schoolName;
            deptItem.dataset.department = dept;
            landingDeptSubmenu.appendChild(deptItem);
        });
        const parentRect = landingSchoolMenu.getBoundingClientRect();
        const itemRect = schoolItem.getBoundingClientRect();
        const offsetTop = itemRect.top - parentRect.top;

        landingDeptSubmenu.style.top = (landingSchoolMenu.offsetTop + offsetTop) + "px";
        landingDeptSubmenu.style.left = landingSchoolMenu.offsetWidth + "px";

        landingDeptSubmenu.style.display = "block";
    });

    landingDeptSubmenu.addEventListener('click', (event) => {
        const deptItem = event.target.closest('.department-item');
        if (!deptItem) return;
        landingSelectedSchool = deptItem.dataset.school;
        landingSelectedDepartment = deptItem.dataset.department;
        document.getElementById('landing-selected-department-text').textContent = deptItem.textContent;

        document.getElementById('landing-department-tool-container').classList.remove('open');
        landingDeptSubmenu.style.display = "none";

        landingSelectedProgram = '';
        landingSelectedBatch = '';
        landingSelectedSemester = '';
        document.getElementById('landing-selected-program-text').textContent = 'Select Program';
        document.getElementById('landing-selected-batch-text').textContent = 'Select Batch';
        document.getElementById('landing-selected-semester-text').textContent = 'Select Semester';
        updateLandingProgramDropdown();
    });

    landingProgramMenu.addEventListener('click', (event) => {
        const progItem = event.target.closest('.general-dropdown-item');
        if (!progItem) return;
        landingSelectedProgram = progItem.dataset.value;
        document.getElementById('landing-selected-program-text').textContent = progItem.textContent;
        document.getElementById('landing-program-tool-container').classList.remove('open');
        updateLandingBatchDropdown();
    });

    landingBatchMenu.addEventListener('click', (event) => {
        const batchItem = event.target.closest('.general-dropdown-item');
        if (!batchItem) return;
        landingSelectedBatch = batchItem.dataset.value;
        document.getElementById('landing-selected-batch-text').textContent = batchItem.textContent;
        document.getElementById('landing-batch-tool-container').classList.remove('open');
        updateLandingSemesterDropdown();
    });

    landingSemesterMenu.addEventListener('click', (event) => {
        const semItem = event.target.closest('.general-dropdown-item');
        if (!semItem) return;
        landingSelectedSemester = semItem.dataset.value;
        document.getElementById('landing-selected-semester-text').textContent = semItem.textContent;
        document.getElementById('landing-semester-tool-container').classList.remove('open');
    });




    // Dropdowns
    const allDropdowns = document.querySelectorAll('.custom-dropdown-container');
    allDropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (event) => {
            if (event.target.closest('.general-dropdown-item')) return;
            allDropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
        });
    });
    schoolMenu.addEventListener('mouseover', (event) => {
        const schoolItem = event.target.closest('.school-item');
        if (!schoolItem) return;

        if (schoolItem.classList.contains('active')) {
            return;
        }
        document.querySelectorAll('#department-dropdown-menu .school-item').forEach(item => {
            item.classList.remove('active');
        });
        schoolItem.classList.add('active');

        const schoolName = schoolItem.dataset.school;
        const departments = Object.keys(DIRECTORY_MAP[schoolName]);
        deptSubmenu.innerHTML = '';
        departments.forEach(dept => {
            const deptItem = document.createElement('div');
            deptItem.className = 'general-dropdown-item department-item';
            deptItem.textContent = dept.replace(/_/g, ' ');
            deptItem.dataset.school = schoolName;
            deptItem.dataset.department = dept;
            deptSubmenu.appendChild(deptItem);
        });

        const parentRect = schoolMenu.getBoundingClientRect();
        const itemRect = schoolItem.getBoundingClientRect();
        const offsetTop = itemRect.top - parentRect.top;
        deptSubmenu.style.top = (schoolMenu.offsetTop + offsetTop) + "px";
        deptSubmenu.style.left = schoolMenu.offsetWidth + "px";
        deptSubmenu.style.display = "block";
    });
    deptSubmenu.addEventListener('click', (event) => {
        const deptItem = event.target.closest('.department-item');
        if (!deptItem) return;

        selectedSchool = deptItem.dataset.school;
        console.log(selectedSchool)
        selectedDepartment = deptItem.dataset.department;

        selectedProgram = '';
        selectedBatch = '';
        selectedSemester = '';

        document.getElementById('selected-department-text').textContent = deptItem.textContent;
        document.getElementById('department-tool-container').classList.remove('open');

        deptSubmenu.style.display = "none";
        updateProgramDropdown();
    });

    const departmentToolContainer = document.getElementById('department-tool-container');
    departmentToolContainer.addEventListener('mouseleave', () => {
        deptSubmenu.style.display = "none";
        document.querySelectorAll('.school-item').forEach(item => item.classList.remove('active'));
    });
    programMenu.addEventListener('click', (event) => {
        const progItem = event.target.closest('.general-dropdown-item');
        if (!progItem || progItem.classList.contains('disabled')) return;
        selectedProgram = progItem.dataset.value;
        selectedBatch = '';
        selectedSemester = '';
        document.getElementById('selected-program-text').textContent = progItem.textContent;
        document.getElementById('program-tool-container').classList.remove('open');
        updateBatchDropdown();
    });
    batchMenu.addEventListener('click', (event) => {
        const batchItem = event.target.closest('.general-dropdown-item');
        if (!batchItem || batchItem.classList.contains('disabled')) return;
        selectedBatch = batchItem.dataset.value;
        selectedSemester = '';
        document.getElementById('selected-batch-text').textContent = batchItem.textContent;
        document.getElementById('batch-tool-container').classList.remove('open');
        updateSemesterDropdown();
    });
    semesterMenu.addEventListener('click', (event) => {
        const semItem = event.target.closest('.general-dropdown-item');
        if (!semItem || semItem.classList.contains('disabled')) return;
        selectedSemester = semItem.dataset.value;
        document.getElementById('selected-semester-text').textContent = semItem.textContent;
        document.getElementById('semester-tool-container').classList.remove('open');
        loadSelectedData();
    });

    /*
    * SEARCH BAR
    */
    searchBar.addEventListener('input', (event) => {
        const query = event.target.value.trim().toLowerCase();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        applyAllFilters();
    });
    clearBtn.addEventListener('click', clearSearch);

    mainContainer.addEventListener('click', (e) => {
        if (!selectedRow || studentListBody.contains(e.target)) return;
        selectedRow.classList.remove('selected-student-row');
        selectedRow = null;
        buildOverallAnalysis();
    });

    /*
    * Row Click
    */
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
    * TOOLTIP
    */
    const tooltip = document.getElementById('tooltip');
    const toolContents = document.querySelectorAll('.general-tool-content');
    let tooltipTimeout;
    toolContents.forEach(content => {
        content.addEventListener('mouseenter', (event) => {
            const targetDiv = event.currentTarget;
            const textSpan = targetDiv.querySelector('span');
            if (!textSpan) return;
            const isOverflowing = textSpan.scrollWidth > textSpan.clientWidth;

            if (isOverflowing) {
                tooltipTimeout = setTimeout(() => {
                    tooltip.textContent = textSpan.textContent;

                    const rect = targetDiv.getBoundingClientRect();
                    const leftPosition = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                    const topPosition = rect.top - tooltip.offsetHeight - 5;

                    tooltip.style.left = `${leftPosition}px`;
                    tooltip.style.top = `${topPosition}px`;
                    tooltip.classList.add('visible');
                }, 100);
            }
        });
        content.addEventListener('mouseleave', () => {
            clearTimeout(tooltipTimeout);
            tooltip.classList.remove('visible');
        });
    });

    /*
    * VERTICAL DROPDOWN
    */
    const allVerticalDropdowns = document.querySelectorAll('.vertical-dropdown-wrapper');
    allVerticalDropdowns.forEach(dropdown => {
        const content = dropdown.querySelector('.vertical-tool-content');
        const menu = dropdown.querySelector('.vertical-dropdown-menu');
        const selectedText = content.querySelector('span:first-child');

        if (!content || !menu || !selectedText) return;

        content.addEventListener('click', (event) => {
            event.stopPropagation();
            allVerticalDropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('open');
                }
            });
            dropdown.classList.toggle('open');
        });

        let specializationOpen = false;
        menu.addEventListener('click', (event) => {
            if (event.target.classList.contains('vertical-dropdown-item')) {
                const newText = event.target.textContent.trim();
                selectedText.textContent = newText;
                dropdown.classList.remove('open');

                if (dropdown.parentElement.id === 'view-tool-container') {
                    switchView(newText);
                }

                if (dropdown.parentElement.id === 'program-type-tool-container') {
                    const specializationTool = document.getElementById('specialization-tool-container');
                    selectedProgramType = newText;

                    if (newText === 'SPECIALIZATION') {
                        if(!specializationOpen) {
                            specializationTool.classList.remove('hidden');
                            specializationOpen = true;

                            const items = specializationTool.querySelectorAll('.selection-tool-item');
                            items.forEach((item, index) => {
                                item.classList.remove('animate-in');
                                setTimeout(() => {
                                    item.classList.add('animate-in');
                                }, index * 20);
                            });
                        }
                        const currentActive = specializationTool.querySelector('.selection-tool-item.active');
                        if (currentActive) currentActive.classList.remove('active');
                        selectedSpecialization = null;
                    } else {
                        specializationTool.classList.add('hidden');
                        specializationOpen = false;
                        selectedSpecialization = null;
                    }
                    applyAllFilters();
                }
            }
        });
    });

    /*
    * SELECTION PANEL TOOL
    */
    const specializationTool = document.getElementById('specialization-tool-container');
    if (specializationTool) {
        specializationTool.addEventListener('click', (event) => {
            const item = event.target.closest('.selection-tool-item');
            if (item) {
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                    selectedSpecialization = null;
                } else {
                    const currentActive = specializationTool.querySelector('.selection-tool-item.active');
                    if (currentActive) currentActive.classList.remove('active');
                    item.classList.add('active');
                    selectedSpecialization = item.textContent.trim();
                }
                applyAllFilters();
            }
        });
    }

    /*
    * SUBJECT ROW CLICK
    */
    subjectDetailsContainer = document.getElementById('subject-details-container');
    const subjectListBody = document.getElementById('subject-list-body');
    subjectListBody.addEventListener('click', handleSubjectRowClick)
    backToListBtn.addEventListener('click', () => {
        subjectDetailsContainer.classList.add('hidden');
        subjectListContainer.classList.remove('hidden');
    });

    window.addEventListener('click', (e) => {
        // Logic for the horizontal dropdowns
        if (!e.target.closest('.custom-dropdown-container')) {
            allDropdowns.forEach(dropdown => dropdown.classList.remove('open'));
            deptSubmenu.style.display = 'none';
            landingDeptSubmenu.style.display = 'none';
        }

        // Logic for the vertical dropdown
        if (!e.target.closest('.vertical-dropdown-wrapper')) {
            allVerticalDropdowns.forEach(d => d.classList.remove('open'));
        }
    });

    /*
    * DEBUG CODE
    */

});

function switchView(view) {
    if (view === 'RESULT') {
        studentListContainer.classList.remove('hidden');
        analyticsContainer.classList.remove('hidden');
        subjectListContainer.classList.add('hidden');
        subjectDetailsContainer.classList.add('hidden')
    } else if (view === 'SUBJECTS') {
        studentListContainer.classList.add('hidden');
        analyticsContainer.classList.add('hidden');
        subjectListContainer.classList.remove('hidden');
        subjectDetailsContainer.classList.add('hidden');

        if (GLOBAL_SUBJECT_ANALYSIS) {
            renderSubjectRows(GLOBAL_SUBJECT_ANALYSIS);
        } else {
            document.getElementById('subject-list-body').innerHTML = '<div class="loading">No subject data available. Load a semester first.</div>';
        }
    }
}

function renderSubjectRows(subjectData) {
    const body = document.getElementById("subject-list-body");
    if (!subjectData || Object.keys(subjectData).length === 0) {
        body.innerHTML = '<div class="loading">No subject data found.</div>';
        return;
    }
    const allRowsHtml = Object.values(subjectData).map(stats => {
        return `
        <div class="subject-data-row" data-subject-code="${stats.code}">
            <div class="subject-name-container">
                <div class="subject-name">${stats.name.replace(/_/g, ' ')}</div>
                <div class="subject-code">${stats.code}</div>
            </div>
            <div class="subject-appeared">${stats.appeared}</div>
            <div class="subject-rate-container">
                <div id="subject-pass-rate" class="subject-rate-percentage">${formatPercentage(stats.pass_percentage)}</div>
                <div class="subject-rate-count">${stats.pass_count}</div>
            </div>
            <div class="subject-rate-container">
                <div id="subject-fail-rate" class="subject-rate-percentage">${formatPercentage(stats.fail_percentage)}</div>
                <div class="subject-rate-count">${stats.fail_count}</div>
            </div>
        </div>
        `;
    }).join('');
    body.innerHTML = allRowsHtml;
}

function handleSubjectRowClick(event) {
    const row = event.target.closest('.subject-data-row');
    if (!row) return;
    const subjectCode = row.dataset.subjectCode;
    const subjectData = GLOBAL_SUBJECT_ANALYSIS[subjectCode];
    if (subjectData) {
        displaySubjectDetails(subjectData);
    }
}

function displaySubjectDetails(subjectData) {
    subjectListContainer.classList.add('hidden');
    subjectDetailsContainer.classList.remove('hidden');

    const gradeCounts = {};
    let totalStudentsWithGrade = 0;
    ALL_STUDENTS.forEach(student => {
        const grade = student[subjectData.code];
        if (grade && (grade !== '-') && (grade !== 'RA')) {
            gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
            totalStudentsWithGrade++;
        }
    });

    const uniqueGrades = Object.keys(gradeCounts);
    const gradeRankMap = {
        'O': 1, 'A+': 2, 'A': 3, 'B+': 4, 'B': 5, 'C+': 6, 'C': 7,
        'D': 8, 'P': 9, 'E': 10, 'F': 11, 'FF': 12
    };
    uniqueGrades.sort((a, b) => {
        const rankA = gradeRankMap[a] || 99;
        const rankB = gradeRankMap[b] || 99;
        return rankA - rankB;
    });

    const gradeDistributionHtml = uniqueGrades.map(grade => {
        const count = gradeCounts[grade];
        const percentage = (count / totalStudentsWithGrade) * 100;
        return `
        <div class="grade-percentage-row">
            <div class="grade">${grade}</div>
            <div class="grade-progress-bar-container">
                <div class="grade-highlighted-progress-bar" style="width: ${formatPercentage(percentage)};"></div>
            </div>
            <div class="grade-percentage">${formatPercentage(percentage)}</div>
        </div>
        `;
    }).join('');

    const nameContainer = document.querySelector('.subject-details-name-container');
    if (nameContainer) {
        const titleEl = nameContainer.querySelector('.subject-details-title');
        const codeEl = nameContainer.querySelector('.subject-details-code');
        if (titleEl) titleEl.textContent = subjectData.name.replace(/_/g, ' ');
        if (codeEl) codeEl.textContent = subjectData.code;
    }

    const gradeBody = document.querySelector('#grade-distribution .details-body');
    if (gradeBody) {
        gradeBody.innerHTML = gradeDistributionHtml.length > 0 ? gradeDistributionHtml : '<p>No grade data to display.</p>';
    }
}

function formatPercentage(num) {
    const roundedNum = Math.round(num * 100) / 100;
    return roundedNum.toString() + '%';
}

function updateProgramDropdown(preserveSelection = false) {
    const programMenu = document.getElementById('program-dropdown-menu');
    programMenu.innerHTML = '';
    if (!preserveSelection) {
        document.getElementById('selected-program-text').textContent = 'Select Program';
        document.getElementById('selected-batch-text').textContent = 'Select Batch';
        document.getElementById('selected-semester-text').textContent = 'Select Semester';
        clearDashboardForLoading("Please select a program.");
    }

    if (selectedSchool && selectedDepartment && DIRECTORY_MAP[selectedSchool]?.[selectedDepartment]) {
        const programs = Object.keys(DIRECTORY_MAP[selectedSchool][selectedDepartment]);

        if (programs.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'general-dropdown-item disabled';
            emptyItem.textContent = 'Nothing to select';
            programMenu.appendChild(emptyItem);
        } else {
            programs.forEach(prog => {
                const item = document.createElement('div');
                item.className = 'general-dropdown-item';
                item.textContent = prog.replace(/_/g, ' ');
                item.dataset.value = prog;
                programMenu.appendChild(item);
            });
        }
    }
}

function updateBatchDropdown(preserveSelection = false) {
    const batchMenu = document.getElementById('batch-dropdown-menu');
    batchMenu.innerHTML = '';
    if (!preserveSelection) {
        document.getElementById('selected-batch-text').textContent = 'Select Batch';
        document.getElementById('selected-semester-text').textContent = 'Select Semester';
        clearDashboardForLoading("Please select a batch.");
    }

    if (selectedProgram && DIRECTORY_MAP[selectedSchool]?.[selectedDepartment]?.[selectedProgram]) {
        const batches = Object.keys(DIRECTORY_MAP[selectedSchool][selectedDepartment][selectedProgram]);

        if (batches.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'general-dropdown-item disabled';
            emptyItem.textContent = 'Nothing to show';
            batchMenu.appendChild(emptyItem);
        } else {
            batches.forEach(batch => {
                const item = document.createElement('div');
                item.className = 'general-dropdown-item';
                item.textContent = batch;
                item.dataset.value = batch;
                batchMenu.appendChild(item);
            });
        }
    }
}

function updateSemesterDropdown(preserveSelection = false) {
    const semesterMenu = document.getElementById('semester-dropdown-menu');
    semesterMenu.innerHTML = '';
    if (!preserveSelection) {
        document.getElementById('selected-semester-text').textContent = 'Select Semester';
        clearDashboardForLoading("Please select a semester.");
    }

    if (selectedBatch && DIRECTORY_MAP[selectedSchool]?.[selectedDepartment]?.[selectedProgram]?.[selectedBatch]) {
        const semesters = DIRECTORY_MAP[selectedSchool][selectedDepartment][selectedProgram][selectedBatch];

        if (semesters.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'general-dropdown-item disabled';
            emptyItem.textContent = 'Nothing to show';
            semesterMenu.appendChild(emptyItem);
        } else {
            semesters.forEach(semFile => {
                const item = document.createElement('div');
                item.className = 'general-dropdown-item';
                const semText = semFile.match(/\d+/)?.[0] || semFile.replace('.csv','').replace('_',' ');
                item.textContent = `Semester ${semText}`;
                item.dataset.value = semFile;
                semesterMenu.appendChild(item);
            });
        }
    }
}

function loadSelectedData() {
    if (!selectedSchool || !selectedDepartment || !selectedProgram || !selectedBatch || !selectedSemester) {
        showLoadingError("Please complete all selections.");
        return;
    }
    const fullPath = `./Datasets/${selectedSchool}/${selectedDepartment}/${selectedProgram}/${selectedBatch}/${selectedSemester}`;

    switchView('RESULT');
    document.getElementById('selected-view-text').textContent = 'RESULT';
    clearDashboardForLoading("Loading student data...");
    try {
        window.pyLoadSemester(fullPath);
    } catch (err) {
        console.error("JavaScript Error calling Python:", err);
        showLoadingError(err.message);
    }
}

function clearDashboardForLoading(message = "Loading student data...") {
    document.getElementById("student-list-body").innerHTML = `<div class="loading">${message}</div>`;
    document.getElementById("subject-header-container").innerHTML = '';
    document.getElementById("analytics-body").innerHTML = '';
    document.querySelector('.analytics-header').textContent = 'Overall Analysis';
    selectedRow = null;
    clearSearch(false);
    ALL_STUDENTS = [];
    ALL_SUBJECTS = [];
    GLOBAL_ANALYTICS_DATA = {};
    GLOBAL_SUBJECT_ANALYSIS = {};
    GLOBAL_TOP_PERFORMERS = [];
}

window.showLoadingError = function(error) {
    document.getElementById("student-list-body").innerHTML = `<div class="loading">Error: ${error}</div>`;
}

function clearSearch(applyFilters = true) {
    document.getElementById('search-bar').value = '';
    document.getElementById('search-clear-btn').style.display = 'none';
    if (applyFilters) {
        applyAllFilters();
    }
}

function getStudentRowHtml(student) {
    const subjectsHtml = ALL_SUBJECTS.map(subjectKey => `<div class="subject-data">${student[subjectKey] || '-'}</div>`).join('');
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
    </div>`;
}

function renderStudentRows(arrayToRender, isGrouped = false) {
    const body = document.getElementById("student-list-body");
    if (!arrayToRender || arrayToRender.length === 0) {
        body.innerHTML = '<div class="loading">No students found.</div>';
        return;
    }

    let allRowsHtml = '';

    if (isGrouped) {
        const groupedStudents = {};
        const specializationOrder = ['DS-AI', 'IOT', 'AIML'];

        arrayToRender.forEach(student => {
            if (!groupedStudents[student.Program_Type]) {
                groupedStudents[student.Program_Type] = [];
            }
            groupedStudents[student.Program_Type].push(student);
        });
        specializationOrder.forEach(spec => {
            if (groupedStudents[spec]) {
                allRowsHtml += `<div class="specialization-group-header">${spec}</div>`;
                allRowsHtml += groupedStudents[spec].map(student => getStudentRowHtml(student)).join('');
            }
        });
    } else {
        allRowsHtml = arrayToRender.map(student => getStudentRowHtml(student)).join('');
    }
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
        GLOBAL_SUBJECT_ANALYSIS = data.subject_wise_analysis;
        GLOBAL_SUBJECT_CODE_MAP = data.subject_map;
        GLOBAL_TOP_PERFORMERS = data.top_performers;

        createHeaders(ALL_SUBJECTS);
        applyAllFilters();
        buildOverallAnalysis();

        const studentListBody = document.getElementById('student-list-body');
        studentListBody.classList.remove('animate-slide-up-body');
        requestAnimationFrame(() => {
            studentListBody.classList.add('animate-slide-up-body');
        });
    }
    catch (error) {
        console.error("JavaScript Error building dashboard:", error);
        document.getElementById("student-list-body").innerHTML = `<div class="loading">Error building dashboard.</div>`;
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
    const html = subjects.map(subjectCode => {
        const subjectInfo = GLOBAL_SUBJECT_CODE_MAP[subjectCode] || {};
        const headerText = subjectInfo.short || subjectCode;
        return `<div class="subject-header">${headerText}</div>`
    }).join('');
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




