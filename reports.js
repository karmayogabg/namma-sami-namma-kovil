/**
 * reports.js
 * Streamlined Data Reports & XLS Exporter for Namma Sami Namma Kovil
 * Filter Hierarchy: Region (மண்டலம்) -> District (மாவட்டம்) -> Pincode (பின்கோடு)
 * Data Display: Desktop Table View / Mobile Cards View with Pagination
 * Export: SheetJS XLS (.xlsx)
 * Version: v10.3
 */

// Global State
let fullDataset = [];
let filteredData = [];
let selectedRegion = '';
let selectedDistrict = '';
let selectedPincode = '';
let currentPage = 1;
let pageSize = 25;
let currentModalItem = null;

// Natural Sort Comparator (handles "1. ...", "2. ...", "10. ...")
function naturalCompare(a, b) {
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
    await loadDataset();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('nsnk_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nsnk_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    if (!themeIcon || !themeText) return;
    if (theme === 'light') {
        themeIcon.setAttribute('data-lucide', 'sun');
        themeText.textContent = 'Light';
    } else {
        themeIcon.setAttribute('data-lucide', 'moon');
        themeText.textContent = 'Dark';
    }
    if (window.lucide) lucide.createIcons();
}

// Setup Event Listeners
function setupEventListeners() {
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMeaningModal();
    });

    // Modal background click
    const modalOverlay = document.getElementById('meaning-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeMeaningModal();
        });
    }
}

// Load Dataset
async function loadDataset() {
    const loadingOverlay = document.getElementById('loading-state');
    const loadingText = document.getElementById('loading-text');

    try {
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (loadingText) loadingText.textContent = 'தரவு ஏற்றப்படுகிறது... Loading 62,521 Records...';

        const response = await fetch('namma_sami_namma_kovil_full.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch dataset.`);
        
        fullDataset = await response.json();
        filteredData = [...fullDataset];
        
        console.log(`✅ Loaded ${fullDataset.length} records.`);

        // Initialize Filter Dropdowns
        initFilterDropdowns();

        // Initial Data Render
        applyFilters(false);

    } catch (err) {
        console.error('❌ Error loading dataset:', err);
        if (loadingText) {
            loadingText.innerHTML = `
                <span style="color:#ef4444; font-weight:700;">தரவு ஏற்றுவதில் பிழை / Failed to load dataset.</span><br>
                <small style="color:var(--text-muted);">${err.message}</small>
            `;
        }
    } finally {
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }
}

// Initialize Filter Dropdowns
function initFilterDropdowns() {
    const regionSelect = document.getElementById('filter-region');
    if (!regionSelect) return;

    // Collect Unique Regions
    const regions = new Set();
    fullDataset.forEach(row => {
        const r = (row.region || '').trim();
        if (r) regions.add(r);
    });

    const sortedRegions = Array.from(regions).sort(naturalCompare);

    regionSelect.innerHTML = `<option value="">-- அனைத்து மண்டலங்களும் (${sortedRegions.length}) / All Regions --</option>`;
    sortedRegions.forEach(reg => {
        const opt = document.createElement('option');
        opt.value = reg;
        opt.textContent = reg;
        regionSelect.appendChild(opt);
    });

    // Populate Districts & Pincodes for initial state
    updateDistrictDropdown();
    updatePincodeDropdown();
}

// Update District Dropdown based on Selected Region
function updateDistrictDropdown() {
    const districtSelect = document.getElementById('filter-district');
    if (!districtSelect) return;

    const districts = new Set();
    fullDataset.forEach(row => {
        const r = (row.region || '').trim();
        const d = (row.district || '').trim();
        if (d) {
            if (!selectedRegion || r === selectedRegion) {
                districts.add(d);
            }
        }
    });

    const sortedDistricts = Array.from(districts).sort(naturalCompare);

    const prevDistrict = selectedDistrict;
    districtSelect.innerHTML = `<option value="">-- அனைத்து மாவட்டங்களும் (${sortedDistricts.length}) / All Districts --</option>`;
    
    sortedDistricts.forEach(dist => {
        const opt = document.createElement('option');
        opt.value = dist;
        opt.textContent = dist;
        if (dist === prevDistrict) opt.selected = true;
        districtSelect.appendChild(opt);
    });

    if (selectedDistrict && !districts.has(selectedDistrict)) {
        selectedDistrict = '';
        districtSelect.value = '';
    }
}

// Update Pincode Dropdown based on Selected Region & District
function updatePincodeDropdown() {
    const pincodeSelect = document.getElementById('filter-pincode');
    if (!pincodeSelect) return;

    const pincodes = new Set();
    let hasEmptyPincode = false;

    fullDataset.forEach(row => {
        const r = (row.region || '').trim();
        const d = (row.district || '').trim();
        const p = String(row.pincode || '').trim();

        const regionMatch = !selectedRegion || r === selectedRegion;
        const districtMatch = !selectedDistrict || d === selectedDistrict;

        if (regionMatch && districtMatch) {
            if (p && p !== '-' && p !== 'null' && p !== 'undefined') {
                pincodes.add(p);
            } else {
                hasEmptyPincode = true;
            }
        }
    });

    const sortedPincodes = Array.from(pincodes).sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return naturalCompare(a, b);
    });

    const prevPincode = selectedPincode;
    pincodeSelect.innerHTML = `<option value="">-- அனைத்து பின்கோடுகளும் (${sortedPincodes.length}) / All Pincodes --</option>`;

    if (hasEmptyPincode) {
        const optEmpty = document.createElement('option');
        optEmpty.value = "__EMPTY__";
        optEmpty.textContent = "📍 பின்கோடு இல்லாதவை / No Pincode";
        if (prevPincode === "__EMPTY__") optEmpty.selected = true;
        pincodeSelect.appendChild(optEmpty);
    }

    sortedPincodes.forEach(pin => {
        const opt = document.createElement('option');
        opt.value = pin;
        opt.textContent = pin;
        if (pin === prevPincode) opt.selected = true;
        pincodeSelect.appendChild(opt);
    });

    if (selectedPincode && selectedPincode !== "__EMPTY__" && !pincodes.has(selectedPincode)) {
        selectedPincode = '';
        pincodeSelect.value = '';
    }
}

// Dropdown Change Handlers
function onRegionChange() {
    const regionSelect = document.getElementById('filter-region');
    selectedRegion = regionSelect ? regionSelect.value.trim() : '';
    
    updateDistrictDropdown();
    updatePincodeDropdown();
}

function onDistrictChange() {
    const districtSelect = document.getElementById('filter-district');
    selectedDistrict = districtSelect ? districtSelect.value.trim() : '';

    updatePincodeDropdown();
}

function onPincodeChange() {
    const pincodeSelect = document.getElementById('filter-pincode');
    selectedPincode = pincodeSelect ? pincodeSelect.value.trim() : '';
}

// Apply Filters Action
function applyFilters(shouldScroll = true) {
    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');

    selectedRegion = regionSelect ? regionSelect.value.trim() : '';
    selectedDistrict = districtSelect ? districtSelect.value.trim() : '';
    selectedPincode = pincodeSelect ? pincodeSelect.value.trim() : '';

    filteredData = fullDataset.filter(row => {
        // Region Filter
        if (selectedRegion && (row.region || '').trim() !== selectedRegion) {
            return false;
        }

        // District Filter
        if (selectedDistrict && (row.district || '').trim() !== selectedDistrict) {
            return false;
        }

        // Pincode Filter
        if (selectedPincode) {
            const rowPin = String(row.pincode || '').trim();
            if (selectedPincode === '__EMPTY__') {
                if (rowPin && rowPin !== '-' && rowPin !== 'null') return false;
            } else {
                if (rowPin !== selectedPincode) return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderData();

    // Smooth scroll to results on mobile
    if (shouldScroll) {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Reset All Filters
function resetFilters() {
    selectedRegion = '';
    selectedDistrict = '';
    selectedPincode = '';

    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');

    if (regionSelect) regionSelect.value = '';
    if (districtSelect) districtSelect.value = '';
    if (pincodeSelect) pincodeSelect.value = '';

    initFilterDropdowns();
    applyFilters(false);
}

// Render Data (Table + Cards + Counts + Pagination)
function renderData() {
    const totalCount = filteredData.length;
    
    // Update Match Count Badge
    const countBadge = document.getElementById('stat-match-count');
    if (countBadge) {
        countBadge.textContent = `${totalCount.toLocaleString()} பதிவுகள் / Records`;
    }

    // Update XLS Export Button State
    const exportBtn = document.getElementById('btn-export-xls');
    if (exportBtn) {
        exportBtn.disabled = (totalCount === 0);
        exportBtn.style.opacity = totalCount === 0 ? '0.5' : '1';
        exportBtn.style.cursor = totalCount === 0 ? 'not-allowed' : 'pointer';
    }

    // Empty State vs Data
    const emptyState = document.getElementById('empty-state');
    const contentArea = document.getElementById('data-content-area');
    const paginationArea = document.getElementById('pagination-container');

    if (totalCount === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (contentArea) contentArea.style.display = 'none';
        if (paginationArea) paginationArea.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (contentArea) contentArea.style.display = 'block';
    if (paginationArea) paginationArea.style.display = 'flex';

    // Calculate Slice Range
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalCount);
    const pageRows = filteredData.slice(startIndex, endIndex);

    // Render Table & Cards
    renderTableView(pageRows, startIndex);
    renderCardsView(pageRows, startIndex);

    // Render Pagination
    renderPagination(totalCount, startIndex, endIndex);

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();
}

// Helper: Grade Badge HTML
function getGradeBadge(grade) {
    const g = (grade || 'Ungraded').trim();
    if (g === 'Grade A') {
        return `<span class="grade-badge grade-badge-a">A Grade</span>`;
    } else if (g === 'Grade B') {
        return `<span class="grade-badge grade-badge-b">B Grade</span>`;
    } else if (g === 'Grade C') {
        return `<span class="grade-badge grade-badge-c">C Grade</span>`;
    }
    return `<span class="grade-badge grade-badge-u">Ungraded</span>`;
}

// Helper: Clean phone number
function cleanPhone(phone) {
    if (!phone) return '';
    return String(phone).replace(/\D/g, '');
}

// Render Table View (Desktop / Laptop)
function renderTableView(rows, startIndex) {
    const tbody = document.getElementById('report-table-body');
    if (!tbody) return;

    let html = '';
    rows.forEach((item, idx) => {
        const globalIndex = startIndex + idx;
        const rowNum = globalIndex + 1;
        const phone = cleanPhone(item.mobile);
        const pincodeDisplay = item.pincode ? escapeHtml(String(item.pincode)) : '-';
        const unionDisplay = item.union ? escapeHtml(item.union) : '-';
        const meaningSnippet = item.meaning ? (escapeHtml(item.meaning.substring(0, 60)) + '...') : '-';

        html += `
            <tr>
                <td style="text-align:center; color:var(--text-muted); font-size:0.8rem;">${rowNum}</td>
                <td style="font-weight:700; font-family:var(--font-tamil); font-size:0.95rem; color:var(--text-main);">
                    ${escapeHtml(item.name || '-')}
                </td>
                <td>
                    ${phone ? `
                        <div style="display:flex; align-items:center; gap:6px;">
                            <a href="tel:${phone}" style="color:#60a5fa; text-decoration:none;" title="Call">
                                <i data-lucide="phone" style="width:13px; height:13px; vertical-align:middle;"></i>
                                <span>${escapeHtml(item.mobile)}</span>
                            </a>
                            <a href="https://wa.me/91${phone}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center;" title="WhatsApp">
                                <i data-lucide="message-circle" style="width:13px; height:13px; color:#25D366;"></i>
                            </a>
                        </div>
                    ` : '<span style="color:var(--text-dim);">-</span>'}
                </td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(item.region || '-')}</td>
                <td style="color:var(--text-main); font-weight:600; font-size:0.85rem;">${escapeHtml(item.district || '-')}</td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${unionDisplay}</td>
                <td style="font-family:monospace; font-weight:700; color:#10b981;">${pincodeDisplay}</td>
                <td>${getGradeBadge(item.grade)}</td>
                <td>
                    <button type="button" class="btn-modal-link" onclick="openMeaningModal(${globalIndex})" title="View Meaning">
                        <i data-lucide="book-open" style="width:12px; height:12px;"></i> விளக்கம்
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Render Cards View (Mobile Phones)
function renderCardsView(rows, startIndex) {
    const container = document.getElementById('cards-view-container');
    if (!container) return;

    let html = '';
    rows.forEach((item, idx) => {
        const globalIndex = startIndex + idx;
        const rowNum = globalIndex + 1;
        const phone = cleanPhone(item.mobile);
        const pincodeDisplay = item.pincode ? escapeHtml(String(item.pincode)) : 'இல்லை';
        const unionDisplay = item.union ? escapeHtml(item.union) : '-';

        html += `
            <div class="person-item-card">
                <div class="card-top">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">#${rowNum}</span>
                        <h4 class="person-title">${escapeHtml(item.name || '-')}</h4>
                    </div>
                    <div>${getGradeBadge(item.grade)}</div>
                </div>

                <div class="card-contacts">
                    ${phone ? `
                        <a href="tel:${phone}" class="btn-call">
                            <i data-lucide="phone" style="width:13px; height:13px;"></i>
                            <span>${escapeHtml(item.mobile)}</span>
                        </a>
                        <a href="https://wa.me/91${phone}" target="_blank" rel="noopener" class="btn-wa">
                            <i data-lucide="send" style="width:13px; height:13px;"></i>
                            <span>WhatsApp</span>
                        </a>
                    ` : '<span style="color:var(--text-dim); font-size:0.82rem;">எண் இல்லை</span>'}
                </div>

                <div class="card-geo">
                    <div><span style="color:var(--text-muted);">மண்டலம்:</span> <strong>${escapeHtml(item.region || '-')}</strong></div>
                    <div><span style="color:var(--text-muted);">மாவட்டம்:</span> <strong>${escapeHtml(item.district || '-')}</strong></div>
                    <div><span style="color:var(--text-muted);">ஒன்றியம்:</span> <strong>${unionDisplay}</strong></div>
                    <div><span style="color:var(--text-muted);">பின்கோடு:</span> <strong style="color:#10b981;">${pincodeDisplay}</strong></div>
                </div>

                <div>
                    <button type="button" class="btn-modal-link" style="width:100%; justify-content:center; padding:8px;" onclick="openMeaningModal(${globalIndex})">
                        <i data-lucide="book-open" style="width:13px; height:13px;"></i>
                        <span>விளக்கம் வாசிக்க (View Meaning)</span>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Render Pagination Controls
function renderPagination(totalCount, startIndex, endIndex) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    let jumpOptions = '';
    const maxSelectPages = Math.min(totalPages, 500);
    for (let p = 1; p <= maxSelectPages; p++) {
        jumpOptions += `<option value="${p}" ${p === currentPage ? 'selected' : ''}>Page ${p}</option>`;
    }

    container.innerHTML = `
        <div style="font-size:0.86rem; color:var(--text-muted);">
            காட்டுவது: <strong>${startIndex + 1} - ${endIndex}</strong> / மொத்தம்: <strong>${totalCount.toLocaleString()}</strong> 
            (பக்கம் ${currentPage} / ${totalPages})
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                <i data-lucide="chevron-left" style="width:15px; height:15px;"></i> முந்தையது
            </button>

            <select class="filter-select" style="height:36px; width:auto; padding:0 8px; font-size:0.82rem;" onchange="changePage(parseInt(this.value, 10))">
                ${jumpOptions}
            </select>

            <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                அடுத்தது <i data-lucide="chevron-right" style="width:15px; height:15px;"></i>
            </button>

            <select class="filter-select" style="height:36px; width:auto; padding:0 8px; font-size:0.82rem;" onchange="changePageSize(this.value)">
                <option value="25" ${pageSize === 25 ? 'selected' : ''}>25 Rows</option>
                <option value="50" ${pageSize === 50 ? 'selected' : ''}>50 Rows</option>
                <option value="100" ${pageSize === 100 ? 'selected' : ''}>100 Rows</option>
                <option value="250" ${pageSize === 250 ? 'selected' : ''}>250 Rows</option>
            </select>
        </div>
    `;
}

function changePage(newPage) {
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    renderData();

    const resultsSec = document.getElementById('results-section');
    if (resultsSec) resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePageSize(size) {
    pageSize = parseInt(size, 10) || 25;
    currentPage = 1;
    renderData();
}

// Meaning Modal Logic
function openMeaningModal(index) {
    const item = filteredData[index];
    if (!item) return;

    currentModalItem = item;

    const modal = document.getElementById('meaning-modal');
    const nameEl = document.getElementById('modal-person-name');
    const phoneEl = document.getElementById('modal-person-phone');
    const gradeEl = document.getElementById('modal-person-grade');
    const locEl = document.getElementById('modal-person-location');
    const textEl = document.getElementById('modal-meaning-text');
    const copyBtn = document.getElementById('btn-modal-copy');

    if (nameEl) nameEl.textContent = item.name || '-';
    if (phoneEl) {
        const phone = cleanPhone(item.mobile);
        phoneEl.innerHTML = phone ? `
            <a href="tel:${phone}" style="color:#60a5fa; text-decoration:none;">
                <i data-lucide="phone" style="width:13px; height:13px; vertical-align:middle;"></i> ${escapeHtml(item.mobile)}
            </a>
        ` : 'எண் இல்லை';
    }
    if (gradeEl) gradeEl.innerHTML = getGradeBadge(item.grade);
    if (locEl) {
        locEl.textContent = `${item.region || '-'} ➔ ${item.district || '-'} ➔ ${item.union || '-'} (${item.pincode || 'பின்கோடு இல்லை'})`;
    }
    if (textEl) textEl.textContent = item.meaning || 'விளக்கம் இல்லை.';

    if (copyBtn) {
        copyBtn.innerHTML = `<i data-lucide="copy" style="width:14px; height:14px;"></i> <span>நகலெடு (Copy Meaning)</span>`;
    }

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (window.lucide) lucide.createIcons();
}

function closeMeaningModal() {
    const modal = document.getElementById('meaning-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentModalItem = null;
}

function copyModalMeaning() {
    if (!currentModalItem || !currentModalItem.meaning) return;

    const copyText = `${currentModalItem.name}\n${currentModalItem.meaning}\n(நம்ம சாமி நம்ம கோவில்)`;

    navigator.clipboard.writeText(copyText).then(() => {
        const copyBtn = document.getElementById('btn-modal-copy');
        if (copyBtn) {
            copyBtn.innerHTML = `<i data-lucide="check" style="width:14px; height:14px; color:#10b981;"></i> <span style="color:#10b981;">நகலெடுக்கப்பட்டது!</span>`;
            if (window.lucide) lucide.createIcons();
            setTimeout(() => {
                if (copyBtn) {
                    copyBtn.innerHTML = `<i data-lucide="copy" style="width:14px; height:14px;"></i> <span>நகலெடு (Copy Meaning)</span>`;
                    if (window.lucide) lucide.createIcons();
                }
            }, 2000);
        }
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// Export to XLS (SheetJS)
function exportToXLS() {
    if (!filteredData || filteredData.length === 0) {
        alert('பதிவுகள் எதுவும் இல்லை! (No records to export)');
        return;
    }

    const exportBtn = document.getElementById('btn-export-xls');
    const originalBtnText = exportBtn ? exportBtn.innerHTML : '';

    if (exportBtn) {
        exportBtn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px; height:16px;"></i> <span>பதிவிறக்கம் ஆகிறது...</span>`;
        exportBtn.disabled = true;
        if (window.lucide) lucide.createIcons();
    }

    setTimeout(() => {
        try {
            const rows = filteredData.map((item, idx) => ({
                'வரிசை எண் (S.No)': idx + 1,
                'பெயர் (Name)': item.name || '',
                'தொடர்பு எண் (Mobile)': item.mobile || '',
                'மண்டலம் (Region)': item.region || '',
                'மாவட்டம் (District)': item.district || '',
                'ஒன்றியம் (Union)': item.union || '',
                'பின்கோடு (Pincode)': item.pincode || '',
                'தரம் (Grade)': item.grade || '',
                'தமிழ் பெயர் விளக்கம் (Meaning)': item.meaning || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);

            worksheet['!cols'] = [
                { wch: 10 },
                { wch: 22 },
                { wch: 16 },
                { wch: 22 },
                { wch: 24 },
                { wch: 22 },
                { wch: 12 },
                { wch: 14 },
                { wch: 65 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'NSNK_Report');

            const sanitize = (str) => (str || 'All').replace(/[^\w\u0B80-\u0BFF]/g, '_').substring(0, 20);
            const rTag = sanitize(selectedRegion);
            const dTag = sanitize(selectedDistrict);
            const pTag = sanitize(selectedPincode);
            const today = new Date().toISOString().slice(0, 10);

            const filename = `NSNK_Data_${rTag}_${dTag}_${pTag}_${today}.xlsx`;

            XLSX.writeFile(workbook, filename);

            showToast(`✅ ${filteredData.length.toLocaleString()} பதிவுகள் XLS கோப்பாக பதிவிறக்கம் செய்யப்பட்டன!`);

        } catch (err) {
            console.error('❌ Failed to export XLS:', err);
            alert(`XLS பதிவிறக்கத்தில் பிழை: ${err.message}`);
        } finally {
            if (exportBtn) {
                exportBtn.innerHTML = originalBtnText;
                exportBtn.disabled = false;
                if (window.lucide) lucide.createIcons();
            }
        }
    }, 100);
}

// Toast Notification
function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3500);
}

// HTML Escaping utility
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
