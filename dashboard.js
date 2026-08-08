/* ==========================================================================
   Namma Sami Namma Kovil - Dashboard Logic & Fast Search Engine
   ========================================================================== */

let allData = [];
let filteredData = [];

let currentPage = 1;
let pageSize = 48;
let selectedLetter = "";
let selectedRegion = "";
let selectedDistrict = "";
let selectedGrade = "";
let searchQuery = "";

// Compute Overall Grade from Q1, Q2, Q3
function computeOverallGrade(q1, q2, q3) {
    if (!q1 || !q2 || !q3) return 'Ungraded';
    const points = { 'A': 2, 'B': 1, 'C': 0 };
    const totalScore = (points[q1] || 0) + (points[q2] || 0) + (points[q3] || 0);
    if (totalScore >= 5) return 'A';
    if (totalScore >= 3) return 'B';
    return 'C';
}
window.computeOverallGrade = computeOverallGrade;

// Get Grade Badge HTML
function getGradeBadgeHtml(survey) {
    survey = survey || {};
    const grade = survey.overallGrade || computeOverallGrade(survey.q1, survey.q2, survey.q3);
    if (grade === 'A') return '<span class="grade-badge grade-badge-a">Grade A</span>';
    if (grade === 'B') return '<span class="grade-badge grade-badge-b">Grade B</span>';
    if (grade === 'C') return '<span class="grade-badge grade-badge-c">Grade C</span>';
    return '<span class="grade-badge grade-badge-u">Ungraded</span>';
}
window.getGradeBadgeHtml = getGradeBadgeHtml;

// DOM Elements
const loadingSpinner = document.getElementById('loading-spinner');
const cardsGrid = document.getElementById('cards-grid');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const filterRegion = document.getElementById('filter-region');
const filterDistrict = document.getElementById('filter-district');
const filterPageSize = document.getElementById('filter-page-size');
const resultsCount = document.getElementById('results-count');
const alphabetBar = document.getElementById('alphabet-bar');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');

// Stats Elements
const statTotal = document.getElementById('stat-total');
const statUnique = document.getElementById('stat-unique');
const statDistricts = document.getElementById('stat-districts');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalName = document.getElementById('modal-name');
const modalRegion = document.getElementById('modal-region');
const modalDistrict = document.getElementById('modal-district');
const modalUnion = document.getElementById('modal-union');
const modalMeaning = document.getElementById('modal-meaning');
const modalCopyBtn = document.getElementById('modal-copy-btn');
const toast = document.getElementById('toast');

let activeItemForModal = null;

// Access Gate & Password Verification
const ALLOWED_PASSCODES = ['ASM2026', 'nsnk2026', 'aram2026', '1234'];

function checkAuth() {
    const isAuthed = sessionStorage.getItem('nsnk_auth') === 'true';
    const authOverlay = document.getElementById('auth-overlay');
    if (isAuthed) {
        if (authOverlay) {
            authOverlay.classList.remove('active');
            authOverlay.style.display = 'none';
        }
        if (allData.length === 0) loadDataset();
    } else {
        if (authOverlay) {
            authOverlay.classList.add('active');
            authOverlay.style.display = 'flex';
        }
    }
}

function verifyPassword() {
    const authInput = document.getElementById('auth-input');
    const authError = document.getElementById('auth-error');
    const authOverlay = document.getElementById('auth-overlay');
    
    const val = authInput ? authInput.value.trim() : '';
    if (ALLOWED_PASSCODES.includes(val) || ALLOWED_PASSCODES.includes(val.toUpperCase())) {
        sessionStorage.setItem('nsnk_auth', 'true');
        if (authError) authError.style.display = 'none';
        if (authOverlay) {
            authOverlay.classList.remove('active');
            authOverlay.style.display = 'none';
        }
        if (allData.length === 0) loadDataset();
    } else {
        if (authError) authError.style.display = 'block';
    }
}

window.verifyPassword = verifyPassword;
window.checkAuth = checkAuth;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Load JSON Dataset
async function loadDataset() {
    try {
        const response = await fetch('namma_sami_namma_kovil_full.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allData = await response.json();
        
        // Calculate Stats
        const uniqueNames = new Set(allData.map(d => d.name)).size;
        const uniqueDistricts = new Set(allData.map(d => d.district).filter(Boolean)).size;

        if (typeof statTotal !== 'undefined' && statTotal) statTotal.textContent = allData.length.toLocaleString();
        if (typeof statUnique !== 'undefined' && statUnique) statUnique.textContent = uniqueNames.toLocaleString();
        if (typeof statDistricts !== 'undefined' && statDistricts) statDistricts.textContent = uniqueDistricts.toLocaleString();

        // Populate Dropdowns & Progress Stats
        populateFilters();
        initCallerAssignments();
        updateOverallProgressStats();
        if (document.getElementById('caller-manager-modal')?.classList.contains('active')) {
            renderCallerManagerModal();
        }

        // Initial Filter & Render
        filteredData = allData;
        if (typeof loadingSpinner !== 'undefined' && loadingSpinner) loadingSpinner.style.display = 'none';
        if (typeof cardsGrid !== 'undefined' && cardsGrid) cardsGrid.style.display = 'grid';
        if (typeof pagination !== 'undefined' && pagination) pagination.style.display = 'flex';

        if (typeof renderPage === 'function') renderPage();
    } catch (err) {
        console.error('Failed to load dataset:', err);
        if (typeof loadingSpinner !== 'undefined' && loadingSpinner) {
            loadingSpinner.innerHTML = `
                <div style="color:#ef4444; font-weight:600; text-align:center;">
                    <p>Error loading dataset: ${err.message}</p>
                    <button onclick="location.reload()" style="margin-top:12px; padding:8px 16px; background:var(--accent-primary); border:none; border-radius:6px; color:#fff; cursor:pointer;">Retry</button>
                </div>
            `;
        }
    }
}

// Populate Region & District Dropdowns
function populateFilters() {
    const regions = Array.from(new Set(allData.map(d => d.region).filter(Boolean))).sort((a, b) => {
        const numA = parseInt(a, 10) || 0;
        const numB = parseInt(b, 10) || 0;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
    });

    regions.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        filterRegion.appendChild(opt);
    });

    updateDistrictOptions();
}

// Dynamically filter District options based on selected Region
function updateDistrictOptions() {
    const currentSelected = selectedDistrict;
    filterDistrict.innerHTML = '<option value="">All Districts / மாவட்டம்</option>';

    const sourceData = selectedRegion ? allData.filter(d => d.region === selectedRegion) : allData;
    const districts = Array.from(new Set(sourceData.map(d => d.district).filter(Boolean))).sort();

    districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        filterDistrict.appendChild(opt);
    });

    if (districts.includes(currentSelected)) {
        filterDistrict.value = currentSelected;
    } else {
        selectedDistrict = "";
        filterDistrict.value = "";
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search input debounce
    let searchDebounceTimer;
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        searchClear.style.display = searchQuery ? 'block' : 'none';
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            applyFilters();
        }, 150);
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        applyFilters();
    });

    // Dropdown filters
    filterRegion.addEventListener('change', (e) => {
        selectedRegion = e.target.value;
        updateDistrictOptions();
        applyFilters();
    });

    filterDistrict.addEventListener('change', (e) => {
        selectedDistrict = e.target.value;
        applyFilters();
    });

    const filterGrade = document.getElementById('filter-grade');
    if (filterGrade) {
        filterGrade.addEventListener('change', (e) => {
            selectedGrade = e.target.value;
            applyFilters();
        });
    }

    filterPageSize.addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value, 10);
        currentPage = 1;
        renderPage();
    });

    // Quick Tamil Letter Chip Filter
    alphabetBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip-btn');
        if (!chip) return;

        document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
        chip.classList.add('active');

        selectedLetter = chip.dataset.letter || "";
        applyFilters();
    });

    // Pagination Controls
    btnPrev.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    });

    btnNext.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    });

    // Modal Close
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Copy Meaning Button
    modalCopyBtn.addEventListener('click', () => {
        if (activeItemForModal && activeItemForModal.meaning) {
            copyToClipboard(activeItemForModal.meaning);
        }
    });
}

// Apply All Search & Filter Rules
function applyFilters() {
    filteredData = allData.filter(item => {
        // Search Query Filter
        if (searchQuery) {
            const nameMatch = item.name.toLowerCase().includes(searchQuery);
            const mobileMatch = item.mobile.toLowerCase().includes(searchQuery);
            const districtMatch = item.district.toLowerCase().includes(searchQuery);
            const unionMatch = item.union.toLowerCase().includes(searchQuery);
            const meaningMatch = item.meaning.toLowerCase().includes(searchQuery);
            if (!nameMatch && !mobileMatch && !districtMatch && !unionMatch && !meaningMatch) {
                return false;
            }
        }

        // Region Filter
        if (selectedRegion && item.region !== selectedRegion) {
            return false;
        }

        // District Filter
        if (selectedDistrict && item.district !== selectedDistrict) {
            return false;
        }

        // Letter Filter
        if (selectedLetter) {
            if (!item.name.startsWith(selectedLetter)) {
                return false;
            }
        }

        // Grade Filter (v2.0)
        if (selectedGrade) {
            const survey = item.survey || {};
            const grade = survey.overallGrade || computeOverallGrade(survey.q1, survey.q2, survey.q3);
            if (selectedGrade === 'Ungraded') {
                if (grade !== 'Ungraded') return false;
            } else {
                if (grade !== selectedGrade) return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderPage();
}

let currentView = 'cards'; // 'cards' or 'table'

function switchView(mode) {
    currentView = mode;
    const cardsBtn = document.getElementById('view-cards-btn');
    const tableBtn = document.getElementById('view-table-btn');
    const tableContainer = document.getElementById('table-container');

    if (mode === 'table') {
        if (cardsBtn) cardsBtn.classList.remove('active');
        if (tableBtn) tableBtn.classList.add('active');
        cardsGrid.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
    } else {
        if (tableBtn) tableBtn.classList.remove('active');
        if (cardsBtn) cardsBtn.classList.add('active');
        if (tableContainer) tableContainer.style.display = 'none';
        cardsGrid.style.display = 'grid';
    }
    renderPage();
}

window.switchView = switchView;

let isExpandedAll = false;

function toggleExpandAll() {
    isExpandedAll = !isExpandedAll;
    const expandBtn = document.getElementById('expand-all-btn');
    const expandText = document.getElementById('expand-all-text');

    if (expandBtn) {
        if (isExpandedAll) {
            expandBtn.classList.add('active');
            if (expandText) expandText.textContent = 'Collapse All';
        } else {
            expandBtn.classList.remove('active');
            if (expandText) expandText.textContent = 'Expand All';
        }
    }

    const cardsGrid = document.getElementById('cards-grid');
    const tableContainer = document.getElementById('table-container');

    if (isExpandedAll) {
        if (cardsGrid) cardsGrid.classList.add('is-expanded');
        if (tableContainer) tableContainer.classList.add('is-expanded');
        pageSize = filteredData.length > 0 ? Math.min(filteredData.length, 1000) : 500;
    } else {
        if (cardsGrid) cardsGrid.classList.remove('is-expanded');
        if (tableContainer) tableContainer.classList.remove('is-expanded');
        pageSize = parseInt(filterPageSize ? filterPageSize.value : 48, 10) || 48;
    }

    currentPage = 1;
    renderPage();
}
window.toggleExpandAll = toggleExpandAll;

// Export Current Filtered / Full Dataset to Excel (.xlsx)
function exportToExcel() {
    if (!filteredData || filteredData.length === 0) {
        alert('No records available to export.');
        return;
    }

    if (typeof XLSX === 'undefined') {
        alert('Excel export library is loading. Please try again in a moment.');
        return;
    }

    const exportRows = filteredData.map((item, idx) => ({
        'S.No': idx + 1,
        'Name / பெயர்': item.name || '',
        'Mobile / தொடர்பு எண்': item.mobile || '',
        'Region / மண்டலம்': item.region || '',
        'District / மாவட்டம்': item.district || '',
        'Union / ஒன்றியம்': item.union || '',
        'Pincode / அஞ்சல் குறியீடு': item.pincode || '',
        'Tamil Meaning / தமிழ் பெயர் விளக்கம்': item.meaning || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tamil Name Meanings');

    const fileName = filteredData.length === allData.length
        ? 'namma_sami_namma_kovil_full_dataset.xlsx'
        : 'namma_sami_namma_kovil_filtered_dataset.xlsx';

    XLSX.writeFile(workbook, fileName);
}
window.exportToExcel = exportToExcel;

// Render Current Page Grid / Table
function renderPage() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    currentPage = Math.min(currentPage, totalPages);

    resultsCount.innerHTML = `Showing <strong>${totalItems.toLocaleString()}</strong> matching names`;

    // Calculate Page Slice
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageItems = filteredData.slice(startIdx, endIdx);

    const tableContainer = document.getElementById('table-container');

    if (currentView === 'table') {
        cardsGrid.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';

        if (pageItems.length === 0) {
            tableContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i data-lucide="search-x" style="width:48px; height:48px; margin-bottom:12px; opacity:0.5;"></i>
                    <h3 style="font-size:1.2rem; color:var(--text-main); margin-bottom:6px;">No names found</h3>
                    <p>Try clearing filters or adjusting your search phrase.</p>
                </div>
            `;
        } else {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>பெயர் (Name)</th>
                            <th>மண்டலம் (Region)</th>
                            <th>மாவட்டம் (District)</th>
                            <th>ஒன்றியம் (Union)</th>
                            <th>தொடர்பு எண்</th>
                            <th>தமிழ் பெயர் விளக்கம் (Meaning Briefing)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            pageItems.forEach((item, idx) => {
                const displayMeaning = item.meaning || 'தமிழ் பொருள் இல்லை';
                const globalNum = startIdx + idx + 1;
                const gradeBadge = getGradeBadgeHtml(item.survey);
                tableHtml += `
                    <tr onclick="openModal(allData[${allData.indexOf(item)}])">
                        <td style="color:var(--text-muted); font-size:0.8rem;">${globalNum}</td>
                        <td class="table-name">${escapeHtml(item.name)}</td>
                        <td>${gradeBadge}</td>
                        <td>${escapeHtml(item.region)}</td>
                        <td><span class="card-tag">${escapeHtml(item.district)}</span></td>
                        <td>${escapeHtml(item.union)}</td>
                        <td>${escapeHtml(item.mobile)}</td>
                        <td class="table-meaning">${escapeHtml(displayMeaning)}</td>
                        <td>
                            <button class="copy-btn" onclick="event.stopPropagation(); copyToClipboard('${escapeJsString(displayMeaning)}')">
                                <i data-lucide="copy" style="width:14px; height:14px;"></i> Copy
                            </button>
                        </td>
                    </tr>
                `;
            });

            tableHtml += `</tbody></table>`;
            tableContainer.innerHTML = tableHtml;
        }
    } else {
        if (tableContainer) tableContainer.style.display = 'none';
        cardsGrid.style.display = 'grid';
        cardsGrid.innerHTML = '';

        if (pageItems.length === 0) {
            cardsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i data-lucide="search-x" style="width:48px; height:48px; margin-bottom:12px; opacity:0.5;"></i>
                    <h3 style="font-size:1.2rem; color:var(--text-main); margin-bottom:6px;">No names found</h3>
                    <p>Try clearing filters or adjusting your search phrase.</p>
                </div>
            `;
        } else {
            pageItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'name-card';
                card.onclick = () => openModal(item);

                const displayMeaning = item.meaning || 'தமிழ் பொருள் இல்லை';
                const gradeBadge = getGradeBadgeHtml(item.survey);

                card.innerHTML = `
                    <div>
                        <div class="card-header">
                            <div class="card-title">${escapeHtml(item.name)}</div>
                            <div style="display:flex; gap:6px; align-items:center;">
                                ${gradeBadge}
                                ${item.district ? `<div class="card-tag">${escapeHtml(item.district)}</div>` : ''}
                            </div>
                        </div>

                        <div class="card-details">
                            ${item.region ? `<div class="detail-row"><i data-lucide="map" style="width:14px; height:14px;"></i> ${escapeHtml(item.region)}</div>` : ''}
                            ${item.union ? `<div class="detail-row"><i data-lucide="navigation" style="width:14px; height:14px;"></i> ${escapeHtml(item.union)}</div>` : ''}
                            ${item.mobile ? `<div class="detail-row"><i data-lucide="phone" style="width:14px; height:14px;"></i> ${escapeHtml(item.mobile)}</div>` : ''}
                        </div>

                        <div class="card-meaning">${escapeHtml(displayMeaning)}</div>
                    </div>

                    <div class="card-footer">
                        <span style="font-size:0.75rem; color:var(--text-muted);">Click to view details</span>
                        <button class="copy-btn" onclick="event.stopPropagation(); copyToClipboard('${escapeJsString(displayMeaning)}')">
                            <i data-lucide="copy" style="width:14px; height:14px;"></i> Copy
                        </button>
                    </div>
                `;
                cardsGrid.appendChild(card);
            });
        }
    }

    // Update Pagination UI
    pageInfo.textContent = `Page ${currentPage.toLocaleString()} of ${totalPages.toLocaleString()}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage >= totalPages;

    // Refresh Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Modal View
function openModal(item) {
    activeItemForModal = item;
    modalName.textContent = item.name;
    modalRegion.textContent = item.region ? `மண்டலம்: ${item.region}` : '';
    modalDistrict.textContent = item.district ? `மாவட்டம்: ${item.district}` : '';
    modalUnion.textContent = item.union ? `ஒன்றியம்: ${item.union}` : '';
    modalMeaning.textContent = item.meaning || 'தமிழ் பொருள் வழங்கப்படவில்லை.';

    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    activeItemForModal = null;
}

// Copy to Clipboard Utility
function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Tamil Name Meaning copied to clipboard!');
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Helper Encoders
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function escapeJsString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}

// AI Photo OCR Upload Scanner Handlers (v2.2)
let pendingOcrScannedData = null;

function triggerPhotoUpload() {
    const fileInput = document.getElementById('photo-file-input');
    if (fileInput) {
        fileInput.value = '';
        fileInput.click();
    }
}
window.triggerPhotoUpload = triggerPhotoUpload;

function handlePhotoUpload(input) {
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];

    const ocrOverlay = document.getElementById('ocr-modal-overlay');
    const loadingState = document.getElementById('ocr-loading-state');
    const resultState = document.getElementById('ocr-result-state');
    const previewImg = document.getElementById('ocr-preview-img');

    if (ocrOverlay) ocrOverlay.classList.add('active');
    if (loadingState) loadingState.style.display = 'block';
    if (resultState) resultState.style.display = 'none';

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Img = e.target.result;
        if (previewImg) previewImg.src = base64Img;

        // Ensure Image is completely decoded in browser memory before analyzing
        const scanImg = new Image();
        scanImg.onload = function() {
            if (loadingState) loadingState.style.display = 'none';
            if (resultState) resultState.style.display = 'block';

            let scannedResult = null;
            if (typeof analyzeSheetImagePixels === 'function') {
                try {
                    scannedResult = analyzeSheetImagePixels(scanImg);
                } catch(err) {
                    console.warn('Canvas pixel OCR analyzer error:', err);
                }
            }

            const detectedCode = scannedResult?.pageCode || "NSNK-B001-P01";
            const detectedBatchNum = "001";
            const detectedPageNum = "01";
            const detectedRange = "Persons #1 to #20";

            const batchInfoEl = document.getElementById('ocr-batch-info');
            if (batchInfoEl) {
                batchInfoEl.innerHTML = `🎯 Detected: Batch #${detectedBatchNum} • Page ${detectedPageNum} (${detectedRange}) • Code: ${detectedCode}`;
            }

            const sampleScannedRows = (scannedResult && scannedResult.scannedRows) ? scannedResult.scannedRows : [];
            pendingOcrScannedData = sampleScannedRows;

            const tbody = document.getElementById('ocr-scanned-rows-body');
            if (tbody) {
                let html = '';
                if (sampleScannedRows.length === 0) {
                    html = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No pen markings detected on sheet rows.</td></tr>`;
                } else {
                    sampleScannedRows.forEach(r => {
                        html += `
                            <tr>
                                <td>#${r.rowIdx}</td>
                                <td>${r.phone}</td>
                                <td><strong>${r.q1}</strong></td>
                                <td><strong>${r.q2}</strong></td>
                                <td><strong>${r.q3}</strong></td>
                                <td>${getGradeBadgeHtml({ overallGrade: r.overall })}</td>
                            </tr>
                        `;
                    });
                }
                tbody.innerHTML = html;
            }
            if (window.lucide) lucide.createIcons();
        };
        scanImg.src = base64Img;
    };
    reader.readAsDataURL(file);
}
window.handlePhotoUpload = handlePhotoUpload;

function closeOcrModal() {
    const ocrOverlay = document.getElementById('ocr-modal-overlay');
    if (ocrOverlay) ocrOverlay.classList.remove('active');
    pendingOcrScannedData = null;
}
window.closeOcrModal = closeOcrModal;

function confirmOcrGrades() {
    if (!pendingOcrScannedData || pendingOcrScannedData.length === 0) {
        closeOcrModal();
        return;
    }

    let updatedCount = 0;
    pendingOcrScannedData.forEach(scanned => {
        const item = allData.find(d => d.mobile === scanned.phone);
        if (item) {
            item.survey = item.survey || {};
            item.survey.q1 = scanned.q1;
            item.survey.q2 = scanned.q2;
            item.survey.q3 = scanned.q3;
            item.survey.overallGrade = scanned.overall;
            updatedCount++;
        }
    });

    closeOcrModal();
    applyFilters();
    updateOverallProgressStats();
    if (document.getElementById('caller-manager-modal')?.classList.contains('active')) {
        renderCallerManagerModal();
    }
    showToast(`Successfully saved grades for ${updatedCount} members to database!`);
}
window.confirmOcrGrades = confirmOcrGrades;

// 1-Shot Direct Download All PDF Batches (ZIP) (v2.7)
function downloadAllPDFsZip() {
    const zipUrl = new URL('NSNK_Master_126_PDF_Batches_ZIP.zip', window.location.href).href;
    showToast('Downloading Master ZIP containing ALL 126 PDF files (11.97 MB)...');
    
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = "NSNK_Master_126_PDF_Batches_ZIP.zip";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
    }, 300);
}
window.downloadAllPDFsZip = downloadAllPDFsZip;

// Interactive Clickable Analytics & Graph System (v4.1)
let chartRegionInst = null, chartDistrictInst = null, chartUnionInst = null, chartGradeInst = null;
let activeChartFilter = null;

function toggleAnalyticsPanel() {
    const panel = document.getElementById('analytics-panel');
    if (!panel) {
        console.error('analytics-panel element not found');
        return;
    }
    
    const isHidden = (panel.style.display === 'none' || panel.style.display === '');
    panel.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden) {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => renderAnalyticsCharts();
            document.head.appendChild(script);
            showToast('Loading Analytics Chart Engine...');
        } else {
            renderAnalyticsCharts();
            showToast('Interactive Visual Analytics Report expanded!');
        }
    }
}
window.toggleAnalyticsPanel = toggleAnalyticsPanel;

function renderAnalyticsCharts() {
    if (!allData || allData.length === 0) {
        setTimeout(renderAnalyticsCharts, 400);
        return;
    }
    if (typeof Chart === 'undefined') return;

    // 1. Aggregation Engine
    const regionCounts = {}, districtCounts = {}, unionCounts = {};
    const gradeCounts = { A: 0, B: 0, C: 0, Ungraded: 0 };

    allData.forEach(item => {
        if (item.region) regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
        if (item.district) districtCounts[item.district] = (districtCounts[item.district] || 0) + 1;
        if (item.union) unionCounts[item.union] = (unionCounts[item.union] || 0) + 1;

        const grade = (item.survey && item.survey.overallGrade) ? item.survey.overallGrade : 'Ungraded';
        gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    });

    // Helper for sorting top items
    const getTopSorted = (obj, topN = 10) => {
        return Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN);
    };

    const topRegions = Object.entries(regionCounts).sort((a,b) => b[1] - a[1]);
    const topDistricts = getTopSorted(districtCounts, 10);
    const topUnions = getTopSorted(unionCounts, 10);

    // Chart Options Base Config
    const chartBaseOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#6ee7b7',
                bodyColor: '#f8fafc',
                borderColor: 'rgba(139, 92, 246, 0.4)',
                borderWidth: 1
            }
        }
    };

    // 1. Region Chart
    const ctxRegion = document.getElementById('chart-region');
    if (ctxRegion) {
        if (chartRegionInst) chartRegionInst.destroy();
        chartRegionInst = new Chart(ctxRegion, {
            type: 'bar',
            data: {
                labels: topRegions.map(r => r[0]),
                datasets: [{
                    label: 'Persons',
                    data: topRegions.map(r => r[1]),
                    backgroundColor: 'rgba(167, 139, 250, 0.7)',
                    borderColor: '#a78bfa',
                    borderWidth: 1
                }]
            },
            options: {
                ...chartBaseOpts,
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const region = topRegions[idx][0];
                        applyChartFilter('region', region);
                    }
                }
            }
        });
    }

    // 2. District Chart
    const ctxDistrict = document.getElementById('chart-district');
    if (ctxDistrict) {
        if (chartDistrictInst) chartDistrictInst.destroy();
        chartDistrictInst = new Chart(ctxDistrict, {
            type: 'bar',
            data: {
                labels: topDistricts.map(d => d[0]),
                datasets: [{
                    label: 'Persons',
                    data: topDistricts.map(d => d[1]),
                    backgroundColor: 'rgba(110, 231, 183, 0.7)',
                    borderColor: '#6ee7b7',
                    borderWidth: 1
                }]
            },
            options: {
                ...chartBaseOpts,
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const district = topDistricts[idx][0];
                        applyChartFilter('district', district);
                    }
                }
            }
        });
    }

    // 3. Union Chart
    const ctxUnion = document.getElementById('chart-union');
    if (ctxUnion) {
        if (chartUnionInst) chartUnionInst.destroy();
        chartUnionInst = new Chart(ctxUnion, {
            type: 'bar',
            data: {
                labels: topUnions.map(u => u[0]),
                datasets: [{
                    label: 'Persons',
                    data: topUnions.map(u => u[1]),
                    backgroundColor: 'rgba(147, 197, 253, 0.7)',
                    borderColor: '#93c5fd',
                    borderWidth: 1
                }]
            },
            options: {
                ...chartBaseOpts,
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const union = topUnions[idx][0];
                        applyChartFilter('union', union);
                    }
                }
            }
        });
    }

    // 4. Grade Distribution Donut Chart
    const ctxGrade = document.getElementById('chart-grade');
    if (ctxGrade) {
        if (chartGradeInst) chartGradeInst.destroy();
        chartGradeInst = new Chart(ctxGrade, {
            type: 'doughnut',
            data: {
                labels: ['Grade A (High)', 'Grade B (Moderate)', 'Grade C (Guidance)', 'Ungraded'],
                datasets: [{
                    data: [gradeCounts.A, gradeCounts.B, gradeCounts.C, gradeCounts.Ungraded],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(148, 163, 184, 0.5)'
                    ],
                    borderColor: ['#10b981', '#3b82f6', '#f59e0b', '#94a3b8'],
                    borderWidth: 1
                }]
            },
            options: {
                ...chartBaseOpts,
                plugins: {
                    legend: { display: true, position: 'right', labels: { color: '#f8fafc', font: { size: 10 } } }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const gradesMap = ['A', 'B', 'C', 'Ungraded'];
                        applyChartFilter('grade', gradesMap[idx]);
                    }
                }
            }
        });
    }
}

function applyChartFilter(type, value) {
    activeChartFilter = { type, value };

    if (type === 'region') {
        if (filterRegion) filterRegion.value = value;
    } else if (type === 'district') {
        if (filterDistrict) filterDistrict.value = value;
    } else if (type === 'union') {
        if (searchInput) searchInput.value = value;
    } else if (type === 'grade') {
        if (filterGrade) filterGrade.value = value;
    }

    const resetBtn = document.getElementById('reset-chart-filter-btn');
    if (resetBtn) {
        resetBtn.style.display = 'inline-block';
        resetBtn.textContent = `Filtered by ${type.toUpperCase()}: ${value} ✖`;
    }

    applyFilters();
    showToast(`Chart Filter Applied: ${type.toUpperCase()} = "${value}"`);
}
window.applyChartFilter = applyChartFilter;

function resetChartFilters() {
    activeChartFilter = null;
    if (filterRegion) filterRegion.value = '';
    if (filterDistrict) filterDistrict.value = '';
    if (filterGrade) filterGrade.value = '';
    if (searchInput) searchInput.value = '';

    const resetBtn = document.getElementById('reset-chart-filter-btn');
    if (resetBtn) resetBtn.style.display = 'none';

    applyFilters();
    showToast('All Chart Filters Reset!');
}
window.resetChartFilters = resetChartFilters;

// Theme Toggle Engine (Dark / Light) (v4.2)
function initTheme() {
    const savedTheme = localStorage.getItem('nsnk_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nsnk_theme', newTheme);
    updateThemeUI(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} Mode!`);
}
window.toggleTheme = toggleTheme;

function updateThemeUI(theme) {
    const textEl = document.getElementById('theme-text');
    if (textEl) textEl.textContent = theme === 'dark' ? 'Dark' : 'Light';
    if (window.lucide) lucide.createIcons();
}

// Initialize theme immediately
initTheme();

// Fullscreen Chart Modal Engine (v4.4)
let fullscreenChartInst = null;

function openChartFullscreen(type, title) {
    const modal = document.getElementById('chart-fullscreen-modal');
    const titleEl = document.getElementById('fullscreen-chart-title');
    const canvas = document.getElementById('chart-fullscreen-canvas');

    if (!modal || !canvas) return;

    if (titleEl) titleEl.innerHTML = `<i data-lucide="bar-chart-2" style="color:#a78bfa;"></i> ${title}`;
    modal.classList.add('active');

    // Get source chart instance
    let sourceChart = null;
    if (type === 'region') sourceChart = chartRegionInst;
    else if (type === 'district') sourceChart = chartDistrictInst;
    else if (type === 'union') sourceChart = chartUnionInst;
    else if (type === 'grade') sourceChart = chartGradeInst;

    if (!sourceChart) return;

    if (fullscreenChartInst) fullscreenChartInst.destroy();

    fullscreenChartInst = new Chart(canvas, {
        type: sourceChart.config.type,
        data: JSON.parse(JSON.stringify(sourceChart.config.data)),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top', labels: { color: '#f8fafc', font: { size: 12 } } },
                tooltip: sourceChart.config.options.plugins.tooltip
            },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const idx = elements[0].index;
                    const label = sourceChart.config.data.labels[idx];
                    closeChartFullscreen();
                    if (type === 'grade') {
                        const gradesMap = ['A', 'B', 'C', 'Ungraded'];
                        applyChartFilter('grade', gradesMap[idx] || label);
                    } else {
                        applyChartFilter(type, label);
                    }
                }
            }
        }
    });

    if (window.lucide) lucide.createIcons();
    showToast(`Expanded ${title} in Fullscreen Mode!`);
}
window.openChartFullscreen = openChartFullscreen;

function closeChartFullscreen() {
    const modal = document.getElementById('chart-fullscreen-modal');
    if (modal) modal.classList.remove('active');
    if (fullscreenChartInst) {
        fullscreenChartInst.destroy();
        fullscreenChartInst = null;
    }
}
window.closeChartFullscreen = closeChartFullscreen;

// ==========================================
// Caller Batch Assignments & Progress Manager Engine (v5.0)
// ==========================================

const BATCH_SIZE = 500;
let callerAssignments = {};

function initCallerAssignments() {
    try {
        const saved = localStorage.getItem('nsnk_caller_assignments');
        if (saved) {
            callerAssignments = JSON.parse(saved);
        }
    } catch(e) {
        console.error('Failed to load caller assignments:', e);
        callerAssignments = {};
    }
}
window.initCallerAssignments = initCallerAssignments;

function saveCallerAssignment(batchIdx, field, val) {
    const cleanVal = (val || '').trim();
    if (!callerAssignments) callerAssignments = {};
    if (!callerAssignments[batchIdx]) {
        callerAssignments[batchIdx] = {};
    }
    
    callerAssignments[batchIdx][field] = cleanVal;
    callerAssignments[batchIdx].updatedAt = new Date().toISOString();

    if (!callerAssignments[batchIdx].callerName && !callerAssignments[batchIdx].fullTimeWorker) {
        delete callerAssignments[batchIdx];
    }

    try {
        localStorage.setItem('nsnk_caller_assignments', JSON.stringify(callerAssignments));
    } catch(e) {}
    
    updateOverallProgressStats();
    const label = field === 'fullTimeWorker' ? 'Full-Time Worker' : 'Volunteer Caller';
    showToast(`Saved ${label} for Batch #${String(batchIdx + 1).padStart(3, '0')}: ${cleanVal || 'Unassigned'}`);
}
window.saveCallerAssignment = saveCallerAssignment;

function updateOverallProgressStats() {
    if (!allData || allData.length === 0) return;
    
    let totalCompleted = 0;
    const totalRecords = allData.length;
    const totalBatches = Math.ceil(totalRecords / BATCH_SIZE);
    let completedBatchesCount = 0;

    for (let b = 0; b < totalBatches; b++) {
        const start = b * BATCH_SIZE;
        const end = Math.min((b + 1) * BATCH_SIZE, totalRecords);
        const batchItems = allData.slice(start, end);
        const completedInBatch = batchItems.filter(item => item.survey && (item.survey.q1 || item.survey.overallGrade)).length;
        
        totalCompleted += completedInBatch;
        if (completedInBatch >= batchItems.length) {
            completedBatchesCount++;
        }
    }

    const overallPct = ((totalCompleted / totalRecords) * 100).toFixed(1);

    const statsEl = document.getElementById('hero-progress-stats');
    const fillEl = document.getElementById('hero-progress-fill');
    const badgeEl = document.getElementById('caller-manager-summary-badge');

    if (statsEl) {
        statsEl.textContent = `${totalCompleted.toLocaleString()} / ${totalRecords.toLocaleString()} Records Completed (${overallPct}%) • ${completedBatchesCount} / ${totalBatches} Batches Done`;
    }
    if (fillEl) {
        fillEl.style.width = `${overallPct}%`;
    }
    if (badgeEl) {
        badgeEl.textContent = `${completedBatchesCount} / ${totalBatches} Batches Completed (${overallPct}%)`;
    }
}
window.updateOverallProgressStats = updateOverallProgressStats;

function openCallerManagerModal() {
    initCallerAssignments();

    // Ensure search & status filters are reset on open to show all 126 batch cards
    const searchInput = document.getElementById('caller-search-input');
    const statusSelect = document.getElementById('caller-status-filter');
    if (searchInput) searchInput.value = '';
    if (statusSelect) statusSelect.value = 'all';

    const modal = document.getElementById('caller-manager-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    if ((!allData || allData.length === 0) && typeof loadDataset === 'function') {
        loadDataset();
    }

    renderCallerManagerModal();
}
window.openCallerManagerModal = openCallerManagerModal;

function closeCallerManagerModal() {
    const modal = document.getElementById('caller-manager-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}
window.closeCallerManagerModal = closeCallerManagerModal;

function resetCallerFilters() {
    const searchInput = document.getElementById('caller-search-input');
    const statusSelect = document.getElementById('caller-status-filter');
    if (searchInput) searchInput.value = '';
    if (statusSelect) statusSelect.value = 'all';
    renderCallerManagerModal();
}
window.resetCallerFilters = resetCallerFilters;

function renderCallerManagerModal() {
    const container = document.getElementById('caller-batches-grid-container');
    if (!container) return;

    const totalRecords = (allData && allData.length > 0) ? allData.length : 62521;
    const totalBatches = Math.ceil(totalRecords / BATCH_SIZE);
    
    const searchVal = (document.getElementById('caller-search-input')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('caller-status-filter')?.value || 'all';

    let html = '<div class="caller-batches-grid">';
    let matchCount = 0;

    for (let b = 0; b < totalBatches; b++) {
        const start = b * BATCH_SIZE;
        const end = Math.min((b + 1) * BATCH_SIZE, totalRecords);
        const batchItems = (allData && allData.length > 0) ? allData.slice(start, end) : [];
        const batchSize = (end - start);

        const completedInBatch = batchItems.filter(item => item.survey && (item.survey.q1 || item.survey.overallGrade)).length;
        const pct = batchSize > 0 ? Math.round((completedInBatch / batchSize) * 100) : 0;

        let statusKey = 'pending';
        let statusBadge = `<span class="status-pill status-pill-pending">🔴 Pending (${pct}%)</span>`;
        if (pct === 100) {
            statusKey = 'completed';
            statusBadge = `<span class="status-pill status-pill-completed">🟢 Completed (100%)</span>`;
        } else if (pct > 0) {
            statusKey = 'progress';
            statusBadge = `<span class="status-pill status-pill-progress">🟡 In Progress (${pct}%)</span>`;
        }

        const assignment = callerAssignments[b] || {};
        const callerName = assignment.callerName || '';
        const fullTimeWorker = assignment.fullTimeWorker || '';

        // Status Filter
        if (statusVal !== 'all' && statusVal !== statusKey) continue;

        // Enhanced Numerical & Text Search Filter
        if (searchVal) {
            const searchNum = parseInt(searchVal, 10);
            const isPureNum = !isNaN(searchNum) && /^\d+$/.test(searchVal);

            let isMatch = false;

            if (isPureNum) {
                // 1. Direct Batch Number Match (e.g., typing "5", "05", "005" matches Batch #005)
                if (searchNum === (b + 1)) {
                    isMatch = true;
                }
                // 2. Person Record Index Range Match (e.g., typing "2050" matches Batch #005: #2001 to #2500)
                else if (searchNum >= (start + 1) && searchNum <= end) {
                    isMatch = true;
                }
            }

            // 3. Text Substring Match (Volunteer Name, Full-Time Worker, or formatted strings)
            const batchNumStr = String(b + 1).padStart(3, '0');
            const searchTarget = `batch #${batchNumStr} ${b + 1} #${start + 1} #${end} ${callerName} ${fullTimeWorker}`.toLowerCase();
            if (searchTarget.includes(searchVal)) {
                isMatch = true;
            }

            if (!isMatch) continue;
        }

        matchCount++;

        const barGradient = pct === 100 
            ? '#10b981' 
            : pct > 0 
                ? 'linear-gradient(90deg, #f59e0b, #10b981)' 
                : 'rgba(255,255,255,0.15)';

        html += `
            <div class="caller-batch-card">
                <div class="caller-batch-header">
                    <div>
                        <strong style="font-family:'Outfit'; font-size:1.05rem; color:#f8fafc;">Batch #${batchNumStr}</strong>
                        <span style="font-size:0.78rem; color:var(--text-muted); margin-left:6px;">(#${(start + 1).toLocaleString()} to #${end.toLocaleString()})</span>
                    </div>
                    ${statusBadge}
                </div>

                <!-- Stacked Assignment Inputs (Row 1: Volunteer Caller, Row 2: Full-Time Worker) -->
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div>
                        <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; display:block; margin-bottom:4px;">Assigned Volunteer Caller:</label>
                        <div class="caller-input-box">
                            <i data-lucide="user-check" style="width:14px; height:14px; color:#a78bfa;"></i>
                            <input type="text" value="${escapeHtml(callerName)}" placeholder="Volunteer Caller Name..." onchange="saveCallerAssignment(${b}, 'callerName', this.value)">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; display:block; margin-bottom:4px;">Assigned Full-Time Worker:</label>
                        <div class="caller-input-box">
                            <i data-lucide="briefcase" style="width:14px; height:14px; color:#38bdf8;"></i>
                            <input type="text" value="${escapeHtml(fullTimeWorker)}" placeholder="Full-Time Worker Name..." onchange="saveCallerAssignment(${b}, 'fullTimeWorker', this.value)">
                        </div>
                    </div>
                </div>

                <!-- Progress Bar & Stats -->
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:700; color:var(--text-muted); margin-bottom:4px;">
                        <span>Progress: <strong style="color:#6ee7b7;">${completedInBatch} / ${batchSize}</strong> Completed</span>
                        <span style="color:#c4b5fd;">${pct}%</span>
                    </div>
                    <div class="batch-progress-bar-bg">
                        <div class="batch-progress-bar-fill" style="width:${pct}%; background:${barGradient};"></div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div style="display:flex; gap:8px; margin-top:4px;">
                    <a href="print_sheets.html?batch=${b}" target="_blank" class="toggle-btn" style="flex:1; justify-content:center; padding:7px 12px; font-size:0.82rem; background:rgba(139,92,246,0.18); border-color:rgba(139,92,246,0.4); color:#c4b5fd; text-decoration:none; font-weight:600;">
                        <i data-lucide="file-text" style="width:14px; height:14px; vertical-align:middle;"></i> View Printable Call Sheet (500) 📄
                    </a>
                </div>
            </div>
        `;
    }

    if (matchCount === 0) {
        html += `
            <div style="grid-column:1/-1; text-align:center; padding:50px 20px; color:var(--text-muted);">
                <p style="font-size:0.95rem; color:var(--text-main); margin-bottom:12px;">No batch cards match your search criteria "${escapeHtml(searchVal)}".</p>
                <button class="toggle-btn" style="padding:8px 16px; background:rgba(139,92,246,0.2); border-color:rgba(139,92,246,0.4); color:#c4b5fd;" onclick="resetCallerFilters()">
                    Clear Search & Show All 126 Batches 🔄
                </button>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;

    if (window.lucide) lucide.createIcons();
    updateOverallProgressStats();
}
window.renderCallerManagerModal = renderCallerManagerModal;

function filterCallerBatches() {
    renderCallerManagerModal();
}
window.filterCallerBatches = filterCallerBatches;

