
/*  */
let DIRECTORY_MAP = {};
let GLOBAL_SUBJECT_CODE_MAP = {};

let ALL_STUDENTS = [];
let ALL_STUDENTS_FOR_SUBJECT_DETAIL = [];
let ALL_SUBJECTS = [];

let GLOBAL_ANALYTICS_DATA = {};
let GLOBAL_SUBJECT_ANALYSIS = {};
let GLOBAL_TOP_PERFORMERS_SGPA = [];
let GLOBAL_TOP_PERFORMERS_CGPA = [];
let selectedRow = null;

// Result view filters
let selectedSchool = '';
let selectedDepartment = '';
let selectedProgram = '';
let selectedBatch = '';
let selectedSemester = '';

// Landing page filters
let landingSelectedSchool = '';
let landingSelectedDepartment = '';
let landingSelectedProgram = '';
let landingSelectedBatch = '';
let landingSelectedSemester = '';

// specialization filters
let selectedProgramType = 'ALL';
let selectedSpecialization = null;

// UI Containers
let landingViewContainer = null;
let resultsViewContainer = null;
let studentListContainer = null;
let analyticsContainer = null;
let subjectListContainer = null;
let subjectDetailsContainer = null;


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



    const perfPanel = document.getElementById('performance-classification-tool-container');
    const tagline2 = document.getElementById('performance-classification-tagline-2');

    const categoryRanges = {
        "EXCELLENT": "90% and above",
        "VERY GOOD": "80% - 90%",
        "GOOD": "70% - 79%",
        "ABOVE AVERAGE": "60% - 69%",
        "AVERAGE": "50% - 59%",
        "FAIL": "Subject Backlog"
    };

    perfPanel.addEventListener('click', (event) => {
        const item = event.target.closest('.selection-tool-item');
        if (!item) return;

        const category = item.textContent.trim();

        perfPanel.querySelectorAll('.selection-tool-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (tagline2) {
            tagline2.textContent = categoryRanges[category] || "";
        }

        filterPerformanceClassification(category);
    });


    /*
    * DEBUG CODE
    */

});

/**
 * PYTHON CALLS
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
window.buildDashboard = function (jsonData) {
    try {
        const data = JSON.parse(jsonData);
        ALL_STUDENTS = data.students;
        ALL_SUBJECTS = data.subjects;

        GLOBAL_ANALYTICS_DATA = data.analytics;
        GLOBAL_SUBJECT_ANALYSIS = data.subject_wise_analysis;
        GLOBAL_SUBJECT_CODE_MAP = data.subject_map;
        GLOBAL_TOP_PERFORMERS_SGPA = data.top_performers_sgpa;
        GLOBAL_TOP_PERFORMERS_CGPA = data.top_performers_cgpa;

        createHeaders(ALL_SUBJECTS);
        createPerformanceClassificationHeaders(ALL_SUBJECTS);

        applyAllFilters(); /* this function applies filter and calls renderStudentRows() */
        buildOverallAnalysis();

        const excelBtn = Array.from(document.querySelectorAll('#performance-classification-tool-container .selection-tool-item'))
            .find(el => el.textContent.trim() === "EXCELLENT");

        if (excelBtn) {
            excelBtn.click();
        }

        const studentListBody = document.getElementById('student-list-body');
        studentListBody.classList.remove('animate-slide-up-body');
        requestAnimationFrame(() => {
            studentListBody.classList.add('animate-slide-up-body');
        });

    } catch (error) {
        console.error("JavaScript Error building dashboard:", error);
        document.getElementById("student-list-body").innerHTML = `<div class="loading">Error building dashboard.</div>`;
    }
};
window.showLoadingError = function(error) {
    document.getElementById("student-list-body").innerHTML = `<div class="loading">Error: ${error}</div>`;
}


/**
 * LANDING PAGE
 */
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


/**
 * FILTERING
 */
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


/**
 * RESULT SCREEN
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
function createPerformanceClassificationHeaders(subjects) {
    const container = document.getElementById("performance-classification-subject-header-container");
    if (!container) return;

    container.style.setProperty('--num-subjects', subjects.length);
    container.innerHTML = subjects.map(code => {
        const info = GLOBAL_SUBJECT_CODE_MAP[code] || {};
        return `<div class="subject-header">${info.short || code}</div>`;
    }).join('');
}
function getStudentPerformanceCategory(student) {
    const pointMap = { "A+": 10, "A": 9, "B+": 8, "B": 7, "C+": 6, "C": 5, "F": 0, "FF": 0, "RA": 0, "AB": 0 };
    const failingGrades = ["F", "FF", "RA", "AB", "UFM"];

    let totalPoints = 0;
    let hasFailedSubject = false;
    let actualSubjectCount = 0;

    ALL_SUBJECTS.forEach(sub => {
        const grade = student[sub];

        if (!grade || grade === '-' || grade === '?') return;

        totalPoints += (pointMap[grade] || 0);
        actualSubjectCount++;

        if (failingGrades.includes(grade)) {
            hasFailedSubject = true;
        }
    });

    if (hasFailedSubject || actualSubjectCount === 0) return "FAIL";

    const averageGradePoint = totalPoints / actualSubjectCount;
    const percentage = averageGradePoint * 10;

    if (percentage >= 90) return "EXCELLENT";      // 90 and above
    if (percentage >= 80) return "VERY GOOD";      // 80 - 89
    if (percentage >= 70) return "GOOD";           // 70 - 79
    if (percentage >= 60) return "ABOVE AVERAGE";  // 60 - 69
    if (percentage >= 50) return "AVERAGE";        // 50 - 59

    return "FAIL";
}
function filterPerformanceClassification(category) {
    const filtered = ALL_STUDENTS.filter(student => {
        return getStudentPerformanceCategory(student) === category;
    });

    const body = document.getElementById("performance-classification-student-list-body");
    if (!body) return;

    if (filtered.length === 0) {
        body.innerHTML = `<div class="loading">No students found in ${category}.</div>`;
    } else {
        body.innerHTML = filtered.map(student => getStudentRowHtml(student)).join('');
    }
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
function getStudentRowHtml(student) {
    const subjectsHtml = ALL_SUBJECTS.map(subjectKey => `<div class="subject-data">${student[subjectKey] || '-'}</div>`).join('');

    const sgpa = (student.SGPA !== null && student.SGPA !== undefined)
        ? Number(student.SGPA).toFixed(2)
        : 'N/A';
    const cgpa = (student.CGPA !== null && student.CGPA !== undefined)
        ? Number(student.CGPA).toFixed(2)
        : 'N/A';

    return `
    <div class="student-data-row" data-enrollment="${student.Enrollment}">
        <div class="row-content-wrapper">
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
function buildOverallAnalysis() {
    document.querySelector('.analytics-header').textContent = 'OVERALL ANALYSIS';

    const analyticsBody = document.getElementById('analytics-body');
    analyticsBody.innerHTML = `
        <div id="pass-fail-container" class="pass-fail-container"></div>
        <div id="top-students-sgpa-container" class="top-students-container"></div>
        <div id="top-students-cgpa-container" class="top-students-container"></div>
    `;

    createPassFailCards(GLOBAL_ANALYTICS_DATA);
    createTopStudentsList(GLOBAL_TOP_PERFORMERS_SGPA, GLOBAL_TOP_PERFORMERS_CGPA);

    animateCountUp('percent-pass', GLOBAL_ANALYTICS_DATA.pass_percentage);
    animateCountUp('percent-promoted', GLOBAL_ANALYTICS_DATA.promoted_percentage);
    animateCountUp('percent-fail', GLOBAL_ANALYTICS_DATA.fail_percentage);

    const topPerformerSgpaContainer = document.getElementById('top-students-sgpa-container');
    const topPerformerCgpaContainer = document.getElementById('top-students-cgpa-container');

    topPerformerSgpaContainer.classList.remove('start-top-performer-animation');
    topPerformerCgpaContainer.classList.remove('start-top-performer-animation');

    requestAnimationFrame(() => {
        topPerformerSgpaContainer.classList.add('start-top-performer-animation');
        topPerformerCgpaContainer.classList.add('start-top-performer-animation');
    });
}
function buildStudentAnalysis(student) {
    const firstName = student.Name.split(' ')[0];
    document.querySelector('.analytics-header').textContent = `${firstName}'s Performance Analysis`;
    const analyticsBody = document.getElementById('analytics-body');

    const currSGPA = parseFloat(student.SGPA) || 0;
    const failingGrades = ['F', 'FF', 'RA'];
    const subjectGrades = ALL_SUBJECTS.map(sub => student[sub]);
    const failCount = subjectGrades.filter(grade => failingGrades.includes(grade)).length;

    let statusText = failCount === 0 ? 'Pass' : (failCount <= 5 ? 'Promoted' : 'Fail');
    let statusClass = failCount === 0 ? 'passed' : (failCount <= 5 ? 'promoted' : 'failed');

    const sortedStudents = [...ALL_STUDENTS].sort((a, b) => b.SGPA - a.SGPA);
    const rank = sortedStudents.findIndex(s => s.Enrollment === student.Enrollment) + 1;

    // Merit and Average Logic
    const meritCategory = getStudentPerformanceCategory(student);
    const allSgpas = ALL_STUDENTS.map(s => parseFloat(s.SGPA)).filter(s => !isNaN(s));
    const batchAvg = allSgpas.length > 0 ? allSgpas.reduce((a, b) => a + b, 0) / allSgpas.length : 0;
    const diffFromAvg = (currSGPA - batchAvg).toFixed(2);
    const studentWidth = Math.min((currSGPA / 10) * 100, 100);

    // grade dist.
    const gradeOrder = ['O', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P', 'F', 'FF'];
    const gradeCounts = {};
    let totalGraded = 0;
    ALL_SUBJECTS.forEach(sub => {
        const g = student[sub];
        if (g && g !== '-' && g !== '?') {
            gradeCounts[g] = (gradeCounts[g] || 0) + 1;
            totalGraded++;
        }
    });

    const distRowsHtml = gradeOrder.map(grade => {
        if (!gradeCounts[grade]) return '';
        const pct = (gradeCounts[grade] / totalGraded) * 100;
        return `
            <div class="mini-dist-row">
                <div class="mini-dist-grade">${grade}</div>
                <div class="mini-dist-bar-wrapper">
                    <div class="mini-dist-label"><span>${gradeCounts[grade]} Subject(s)</span><span>${Math.round(pct)}%</span></div>
                    <div class="mini-dist-bar-bg"><div class="mini-dist-bar-fill" style="width: ${pct}%"></div></div>
                </div>
            </div>`;
    }).join('');

    // backlog list
    const arrearsHtml = ALL_SUBJECTS.filter(sub => failingGrades.includes(student[sub])).length > 0
        ? ALL_SUBJECTS.filter(sub => failingGrades.includes(student[sub])).map(s => `<li class="arrear-item">${s}</li>`).join('')
        : '<li style="color: #24A84C; font-size: 13px; list-style:none; font-family: \'Open Sans\';">✔ No Backlogs Found</li>';


    analyticsBody.innerHTML = `
        <div class="student-analysis-container">
            <div class="analysis-card">
                
                <div class="analysis-stat-row">
                    <span>Performance:</span>
                    <span class="stat-value-main" style="color: #16161D">${meritCategory}</span>
                </div>
                <div class="analysis-stat-row">
                    <span>Result Status:</span>
                    <span class="stat-value-main ${statusClass}">${statusText}</span>
                </div>
                <div class="analysis-stat-row">
                    <span>Current SGPA:</span>
                    <span class="stat-value-main">${currSGPA.toFixed(2)}</span>
                </div>
                <div class="analysis-stat-row">
                    <span>Batch Rank:</span>
                    <span class="stat-value-main">#${rank} / ${ALL_STUDENTS.length}</span>
                </div>

                <div class="mini-dist-container" style="margin-top:25px;">
                    <div class="mini-dist-title">Active Backlogs (${failCount})</div>
                    <ul class="arrears-list" style="margin-top: 10px;">
                        ${arrearsHtml}
                    </ul>
                </div>

                <div class="mini-dist-container" style="margin-top:25px;">
                    <div class="mini-dist-title">Semester Grade Distribution</div>
                    ${distRowsHtml || '<div class="loading">No grade data available.</div>'}
                </div>

                <div class="benchmark-container" style="margin-top: 35px; padding: 15px 12px 25px 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-bottom: 15px; font-family: 'Open Sans';">
                        <span style="color: #495057;">CLASS AVG: ${batchAvg.toFixed(2)}</span>
                        <span style="color: ${diffFromAvg >= 0 ? '#24A84C' : '#e67e22'}">
                            ${diffFromAvg >= 0 ? '▲ +' : '▼ '}${Math.abs(diffFromAvg)} pts
                        </span>
                    </div>
                    
                    <div class="benchmark-bar-bg" style="height: 10px; background: #dee2e6; position: relative; border-radius: 10px; overflow: visible;">
                        
                        <div class="student-score-fill" style="
                            width: ${studentWidth}%; 
                            height: 100%; 
                            background: ${currSGPA >= batchAvg ? '#FFE100' : '#ffc107'}; 
                            border-radius: 10px;
                            transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                            position: absolute;
                            z-index: 1;
                        "></div>

                        <div class="student-marker" style="
                            position: absolute; 
                            top: -4px; 
                            left: ${studentWidth}%; 
                            width: 3px; 
                            height: 18px; 
                            background: #16161D; 
                            border-radius: 2px;
                            transform: translateX(-50%);
                            transition: left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                            z-index: 3;
                        ">
                             <!--<span style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: bold; color: #16161D;">YOU</span>-->
                             <span style="
                                position: absolute; 
                                bottom: -18px; 
                                left: 50%; 
                                transform: translateX(-50%); 
                                font-size: 10px; 
                                font-weight: 900; 
                                color: white;
                                background: #16161D;
                                padding: 1px 5px;
                                border-radius: 3px;
                                white-space: nowrap;
                            ">${currSGPA.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>`;
}
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
function createTopStudentsList(topPerformersSgpa, topPerformersCgpa) {
    // SGPA
    const containerSgpa = document.getElementById("top-students-sgpa-container");
    const sgpaPerformersHtml = topPerformersSgpa.map((student, index) => {
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
    containerSgpa.innerHTML = `<div class="analytics-card-title">Top 3 Performers by SGPA 🏆</div>${sgpaPerformersHtml}`;

    // CGPA
    const containerCgpa = document.getElementById("top-students-cgpa-container");
    const cgpaPerformersHtml = topPerformersCgpa.map((student, index) => {
        return `
        <div class="top-performer-item">
            <div class="rank-box">#${index + 1}</div>
            <div class="student-info-section">
                <span class="student-name">${student.Name}</span>
                <span class="student-sgpa">${student.CGPA.toFixed(2)}</span>
            </div>
        </div>
        `;
    }).join('');
    containerCgpa.innerHTML = `<div class="analytics-card-title">Top 3 Performers by CGPA 🏆</div>${cgpaPerformersHtml}`;
}


/**
* SUBJECT SCREEN and SUBJECT DETAILS
*/
function renderSubjectRows(subjectData) {
    const listbody = document.getElementById("subject-list-body");
    if (!subjectData || Object.keys(subjectData).length === 0) {
        listbody.innerHTML = '<div class="loading">No subject data found.</div>';
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
    listbody.innerHTML = allRowsHtml;
}
function handleSubjectRowClick(event) {
    const row = event.target.closest('.subject-data-row');
    if (!row) return;
    const subjectCode = row.dataset.subjectCode;
    const selectedSubject = GLOBAL_SUBJECT_ANALYSIS[subjectCode];
    if (selectedSubject) {
        displaySubjectDetails(selectedSubject);
    }
}
function displaySubjectDetails(selectedSubject) {
    subjectListContainer.classList.add('hidden');
    subjectDetailsContainer.classList.remove('hidden');

    ALL_STUDENTS_FOR_SUBJECT_DETAIL = ALL_STUDENTS;
    const subjectCode = selectedSubject.code;

    // Subject Name and Code
    renderSubjectHeader(selectedSubject);
    // Subject Summary
    renderSubjectSummary(selectedSubject)
    // Subject Grade Distribution
    renderGradeDistribution(selectedSubject);
    // Subject Student List
    renderSubjectStudentList(subjectCode, ALL_STUDENTS, 'PASS');

    // PASS-FAIL row click
    setupSummaryFilterClicks(subjectCode);
}
function renderSubjectHeader(selectedSubject) {
    const nameContainer = document.querySelector('.subject-details-name-container');
    if (nameContainer) {
        const titleEl = nameContainer.querySelector('.subject-details-title');
        const codeEl = nameContainer.querySelector('.subject-details-code');
        if (titleEl) titleEl.textContent = selectedSubject.name.replace(/_/g, ' ');
        if (codeEl) codeEl.textContent = selectedSubject.code;
    }
}
function renderSubjectSummary(selectedSubject) {
    const summaryContainer = document.getElementById('subject-details-summary');
    if (summaryContainer) {
        summaryContainer.innerHTML = `
        <div id="subject-details-summary-row-appeared" class="subject-details-summary-row">
             <span class="subject-details-summary-label">Appeared</span>
             <div class="subject-details-summary-value-container">
                <span class="subject-details-summary-value">${selectedSubject.appeared}</span>
             </div> 
        </div>
        <div class="subject-details-summary-row" data-filter="PASS">
             <span class="subject-details-summary-label">Pass</span>
             <div class="subject-details-summary-value-container">
                <span class="subject-details-summary-value-percentage">${formatPercentage(selectedSubject.pass_percentage)}</span>
                <span class="subject-details-summary-value-number">${selectedSubject.pass_count}</span>
             </div>
        </div>
        <div class="subject-details-summary-row" data-filter="FAIL">
             <span class="subject-details-summary-label">Fail</span>
             <div class="subject-details-summary-value-container">
                <span class="subject-details-summary-value-percentage">${formatPercentage(selectedSubject.fail_percentage)}</span>
                <span class="subject-details-summary-value-number">${selectedSubject.fail_count}</span>
             </div>
        </div>
        `;
    }
}
function renderGradeDistribution(selectedSubject) {
    const subjectCode = selectedSubject.code;
    const gradeCounts = {};
    let totalStudentsWithGrade = 0;

    ALL_STUDENTS.forEach(student => {
        const grade = student[subjectCode];
        if (grade && (grade !== '-') && (grade !== 'RA')) {
            gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
            totalStudentsWithGrade++;
        }
    });

    const gradeRankMap = {
        'O': 1, 'A+': 2, 'A': 3, 'B+': 4, 'B': 5, 'C+': 6,
        'C': 7, 'D': 8, 'P': 9, 'E': 10, 'F': 11, 'FF': 12
    };
    const uniqueGrades = Object.keys(gradeCounts).sort((a, b) => {
        return (gradeRankMap[a] || 99) - (gradeRankMap[b] || 99);
    });

    const gradeDistributionContentHtml = uniqueGrades.map(grade => {
        const count = gradeCounts[grade];
        const percentage = (count / totalStudentsWithGrade) * 100;
        return `
        <div class="grade-percentage-row">
            <div class="grade">${grade}</div>
            <div class="grade-progress-bar-container">
                <div class="grade-rate-container">
                    <span class="grade-percentage">${formatPercentage(percentage)}</span>
                    <span class="grade-number">${count}</span>
                </div>
                <div class="grade-progress-bar-background">
                    <div class="grade-highlighted-progress-bar" style="width: ${formatPercentage(percentage)};"></div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    const contentTarget = document.querySelector('.grade-distribution-content');
    const contentToInject = gradeDistributionContentHtml.length > 0
        ? gradeDistributionContentHtml
        : '<div class="loading" style="padding: 10px;">No grade data to display.</div>';

    if (contentTarget) {
        contentTarget.innerHTML = contentToInject;
    }
}
function setupSummaryFilterClicks(subjectCode) {
    const summaryRows = document.querySelectorAll('.subject-details-summary-row');

    const passRow = document.querySelector('.subject-details-summary-row:nth-child(2)');
    if (passRow) {
        passRow.classList.add('selected-summary-row');
        passRow.dataset.selected = 'true';
    }

    for (let i = 1; i < summaryRows.length; i++) {
        const row = summaryRows[i];

        if (!row.dataset.filter) continue;

        row.onclick = (event) => {
            const currentFilterType = row.dataset.filter;
            const isCurrentlySelected = row.classList.contains('selected-summary-row');
            let newFilter = 'ALL';

            // 1. Reset all rows
            summaryRows.forEach(r => {
                r.classList.remove('selected-summary-row');
                r.dataset.selected = 'false';
            });

            if (!isCurrentlySelected) {
                row.classList.add('selected-summary-row');
                row.dataset.selected = 'true';
                newFilter = currentFilterType;
            }

            renderSubjectStudentList(subjectCode, ALL_STUDENTS_FOR_SUBJECT_DETAIL, newFilter);
        };
    }
}
function renderSubjectStudentList(subjectCode, students, filterType = 'PASS') {
    const listBody = document.getElementById('subject-student-list-body');
    if(!listBody) return;

    let filteredStudents = students;
    const failingGrades = ['RA', 'F', 'FF'];

    if (filterType === 'PASS') {
        filteredStudents = students.filter(student => !failingGrades.includes(student[subjectCode]));
    } else if (filterType === 'FAIL') {
        filteredStudents = students.filter(student => failingGrades.includes(student[subjectCode]));
    }

    if (filteredStudents.length === 0) {
        let message = "No students to show.";
        if (filterType === 'FAIL') {
            message = "No students failed this subject!";
        }
        listBody.innerHTML = `<div class="loading" style="padding: 15px;">${message}</div>`;
        return;
    }

    const rowsHtml = filteredStudents.map(student => {
        const grade = student[subjectCode] || '-';

        return `
        <div class="subject-student-row">
            <div class="name-data">${student.Name}</div>
            <div class="enrollment-data">${student.Enrollment}</div>
            <div class="student-row-grade">${grade}</div>
        </div>
        `;
    }).join('');

    listBody.innerHTML = rowsHtml;
}


/**
 * HELPER FUNCTIONS
 */
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
            document.getElementById('subject-list-body').innerHTML =
                '<div class="loading">No subject data available. Load a semester first.</div>';
        }
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
    GLOBAL_TOP_PERFORMERS_SGPA = [];
    GLOBAL_TOP_PERFORMERS_CGPA = [];
}
function clearSearch(applyFilters = true) {
    document.getElementById('search-bar').value = '';
    document.getElementById('search-clear-btn').style.display = 'none';
    if (applyFilters) {
        applyAllFilters();
    }
}
function animateCountUp(targetId, finalValue, duration = 1000) {
    const element = document.getElementById(targetId);
    if (!element) return;
    const startTime = performance.now();

    const step = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        element.textContent = (finalValue * ease).toFixed(1) + "%";

        if(progress < 1){
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}
function formatPercentage(num) {
    const roundedNum = Math.round(num * 100) / 100;
    return roundedNum.toString() + '%';
}
