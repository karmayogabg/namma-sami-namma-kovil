/**
 * reports.js (v10.3 Ultra-Fast Optimized)
 * High-Performance Data Reports & XLS Exporter for Namma Sami Namma Kovil
 * 
 * Features:
 *  - Instant Page Load: Uses lightweight hierarchy metadata (~20KB) instead of downloading 52MB upfront.
 *  - Non-Blocking: Zero full-screen lockups; dropdowns are immediately responsive on mobile and desktop.
 *  - On-Demand Regional Streaming: Only loads the selected region's data file (1-3MB gzipped in ~0.2s).
 *  - In-Memory Regional Cache: Once a region is loaded, switching districts/pincodes is instantaneous (0ms).
 *  - SheetJS XLS (.xlsx) Export with customized column headers.
 *  - Mobile-First Adaptive View: Touch cards on mobile (< 768px), clean data table on laptop (>= 768px).
 */

// Global State
let hierarchyData = null;
const regionCache = {}; // Cache: { "1. கன்னியாகுமரி": [...rows], ... }
let currentRegionRows = [];
let filteredData = [];

let selectedRegion = '';
let selectedDistrict = '';
let selectedPincode = '';

let currentPage = 1;
let pageSize = 25;
let currentModalItem = null;

// Natural Sort Comparator
function naturalCompare(a, b) {
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
    await loadHierarchy();
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMeaningModal();
    });

    const modalOverlay = document.getElementById('meaning-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeMeaningModal();
        });
    }
}

// Load Lightweight Hierarchy Map (Only ~20KB)
async function loadHierarchy() {
    const statusMsg = document.getElementById('loading-status-inline');

    try {
        if (statusMsg) statusMsg.textContent = 'அமைப்புகள் தயாராகின்றன... Initializing...';

        const response = await fetch('data/hierarchy.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to load hierarchy.`);
        
        hierarchyData = await response.json();
        console.log('✅ Loaded hierarchy map (20KB).');

        // Populate Region dropdown
        populateRegionDropdown();

        if (statusMsg) statusMsg.textContent = 'வடிகட்டலை தேர்வு செய்யவும் (Select filters above)';

    } catch (err) {
        console.warn('⚠️ Could not load hierarchy.json, falling back:', err);
        // Fallback: Populate static region list
        populateFallbackRegions();
    }
}

// Populate Region Dropdown from Hierarchy
function populateRegionDropdown() {
    const regionSelect = document.getElementById('filter-region');
    if (!regionSelect || !hierarchyData) return;

    const regions = Object.keys(hierarchyData).sort(naturalCompare);

    regionSelect.innerHTML = '<option value="">-- மண்டலத்தை தேர்வு செய்க (Select Region) --</option>';
    regions.forEach(reg => {
        const opt = document.createElement('option');
        opt.value = reg;
        opt.textContent = reg;
        regionSelect.appendChild(opt);
    });

    // Add option for All Regions
    const optAll = document.createElement('option');
    optAll.value = '__ALL__';
    optAll.textContent = '🌐 அனைத்து மண்டலங்களும் (All Regions)';
    regionSelect.appendChild(optAll);
}

// Fallback Region list if hierarchy.json fails
function populateFallbackRegions() {
    const regionSelect = document.getElementById('filter-region');
    if (!regionSelect) return;

    const regions = [
        "1. கன்னியாகுமரி", "2. மதுரை", "3. ராமேஸ்வரம்", "4. கோயம்பத்தூர்",
        "5. ஈரோடு", "6. சேலம்", "7. திருச்சிராப்பள்ளி", "8. தஞ்சாவூர்",
        "9. விழுப்புரம்", "10. வேலூர்", "11. காஞ்சிபுரம்", "12. சென்னை"
    ];

    regionSelect.innerHTML = '<option value="">-- மண்டலத்தை தேர்வு செய்க (Select Region) --</option>';
    regions.forEach(reg => {
        const opt = document.createElement('option');
        opt.value = reg;
        opt.textContent = reg;
        regionSelect.appendChild(opt);
    });
}

// Region Change Handler
function onRegionChange() {
    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');

    selectedRegion = regionSelect ? regionSelect.value.trim() : '';
    selectedDistrict = '';
    selectedPincode = '';

    if (!hierarchyData || !selectedRegion || selectedRegion === '__ALL__') {
        if (districtSelect) {
            districtSelect.innerHTML = '<option value="">-- அனைத்து மாவட்டங்களும் (All Districts) --</option>';
        }
        if (pincodeSelect) {
            pincodeSelect.innerHTML = '<option value="">-- அனைத்து பின்கோடுகளும் (All Pincodes) --</option>';
        }
        return;
    }

    const regObj = hierarchyData[selectedRegion];
    if (!regObj) return;

    // Populate Districts for selected Region
    const districts = Object.keys(regObj.districts || {}).sort(naturalCompare);
    if (districtSelect) {
        districtSelect.innerHTML = `<option value="">-- அனைத்து மாவட்டங்களும் (${districts.length}) / All Districts --</option>`;
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            districtSelect.appendChild(opt);
        });
    }

    // Populate All Pincodes in this Region
    updatePincodesFromHierarchy(selectedRegion, '');

    // Background pre-fetch of this region file so it's ready when user clicks Apply
    fetchRegionData(selectedRegion).catch(console.warn);
}

// District Change Handler
function onDistrictChange() {
    const districtSelect = document.getElementById('filter-district');
    selectedDistrict = districtSelect ? districtSelect.value.trim() : '';
    selectedPincode = '';

    updatePincodesFromHierarchy(selectedRegion, selectedDistrict);
}

// Pincode Change Handler
function onPincodeChange() {
    const pincodeSelect = document.getElementById('filter-pincode');
    selectedPincode = pincodeSelect ? pincodeSelect.value.trim() : '';
}

// Helper: Populate Pincode dropdown instantly from Hierarchy
function updatePincodesFromHierarchy(region, district) {
    const pincodeSelect = document.getElementById('filter-pincode');
    if (!pincodeSelect || !hierarchyData || !region || region === '__ALL__') {
        if (pincodeSelect) pincodeSelect.innerHTML = '<option value="">-- அனைத்து பின்கோடுகளும் (All Pincodes) --</option>';
        return;
    }

    const regObj = hierarchyData[region];
    if (!regObj || !regObj.districts) return;

    let pins = [];
    if (district && regObj.districts[district]) {
        pins = regObj.districts[district];
    } else {
        const pinSet = new Set();
        Object.values(regObj.districts).forEach(arr => {
            arr.forEach(p => pinSet.add(p));
        });
        pins = Array.from(pinSet);
    }

    pins.sort((a, b) => {
        const nA = parseInt(a, 10);
        const nB = parseInt(b, 10);
        if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
        return naturalCompare(a, b);
    });

    pincodeSelect.innerHTML = `<option value="">-- அனைத்து பின்கோடுகளும் (${pins.length}) / All Pincodes --</option>`;
    pins.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        pincodeSelect.appendChild(opt);
    });
}

// Fetch Region Data with In-Memory Caching (Streams ~1-3MB instead of 52MB)
async function fetchRegionData(regionName) {
    if (regionCache[regionName]) {
        return regionCache[regionName];
    }

    let filePath = '';
    if (hierarchyData && hierarchyData[regionName] && hierarchyData[regionName].file) {
        filePath = hierarchyData[regionName].file;
    } else {
        // Fallback file pattern
        const numMatch = regionName.match(/^(\d+)\./);
        const idx = numMatch ? numMatch[1] : '1';
        filePath = `data/regions/region_${idx}.json`;
    }

    const resp = await fetch(filePath);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Could not load ${filePath}`);
    
    const rows = await resp.json();
    regionCache[regionName] = rows;
    console.log(`✅ Loaded ${regionName} (${rows.length} rows) into cache.`);
    return rows;
}

// Load All Regions if user explicitly selects All Regions
async function fetchAllRegionsData(progressCallback) {
    if (!hierarchyData) return [];

    const regionKeys = Object.keys(hierarchyData).sort(naturalCompare);
    let allRows = [];

    for (let i = 0; i < regionKeys.length; i++) {
        const reg = regionKeys[i];
        if (progressCallback) progressCallback(i + 1, regionKeys.length, reg);
        const rows = await fetchRegionData(reg);
        allRows = allRows.concat(rows);
    }

    return allRows;
}

// Apply Filters Action
async function applyFilters(shouldScroll = true) {
    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');
    const applyBtn = document.querySelector('.btn-apply');
    const countBadge = document.getElementById('stat-match-count');

    selectedRegion = regionSelect ? regionSelect.value.trim() : '';
    selectedDistrict = districtSelect ? districtSelect.value.trim() : '';
    selectedPincode = pincodeSelect ? pincodeSelect.value.trim() : '';

    if (!selectedRegion) {
        alert('தயவுசெய்து ஒரு மண்டலத்தை தேர்வு செய்யவும்! (Please select a Region)');
        if (regionSelect) regionSelect.focus();
        return;
    }

    // Set Loading UI on button and badge
    if (applyBtn) {
        applyBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:16px; height:16px;"></i> <span>ஏற்றப்படுகிறது...</span>';
        applyBtn.disabled = true;
    }
    if (countBadge) {
        countBadge.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:18px; height:18px; color:var(--accent-secondary);"></i> <span>தரவு தயாராகிறது...</span>';
    }
    if (window.lucide) lucide.createIcons();

    try {
        let rows = [];

        if (selectedRegion === '__ALL__') {
            // Load all regions sequentially with progress
            rows = await fetchAllRegionsData((current, total, regName) => {
                if (countBadge) {
                    countBadge.textContent = `மண்டலம் ${current}/${total} (${regName}) ஏற்றப்படுகிறது...`;
                }
            });
        } else {
            // Load only selected region (fast!)
            rows = await fetchRegionData(selectedRegion);
        }

        currentRegionRows = rows;

        // Filter by District and Pincode
        filteredData = currentRegionRows.filter(item => {
            if (selectedDistrict && (item.district || '').trim() !== selectedDistrict) {
                return false;
            }
            if (selectedPincode) {
                const itemPin = String(item.pincode || '').trim();
                if (itemPin !== selectedPincode) return false;
            }
            return true;
        });

        currentPage = 1;
        renderData();

        if (shouldScroll) {
            const resultsSec = document.getElementById('results-section');
            if (resultsSec) resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (err) {
        console.error('❌ Error applying filter:', err);
        alert(`தரவு ஏற்றுவதில் பிழை: ${err.message}`);
        if (countBadge) countBadge.textContent = 'பிழை ஏற்பட்டது / Load Error';
    } finally {
        if (applyBtn) {
            applyBtn.innerHTML = '<i data-lucide="filter" style="width:16px; height:16px;"></i> <span>வடிகட்டு (Apply Filter)</span>';
            applyBtn.disabled = false;
            if (window.lucide) lucide.createIcons();
        }
    }
}

// Reset Filters Action
function resetFilters() {
    selectedRegion = '';
    selectedDistrict = '';
    selectedPincode = '';

    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');

    if (regionSelect) regionSelect.value = '';
    if (districtSelect) districtSelect.innerHTML = '<option value="">-- அனைத்து மாவட்டங்களும் (All Districts) --</option>';
    if (pincodeSelect) pincodeSelect.innerHTML = '<option value="">-- அனைத்து பின்கோடுகளும் (All Pincodes) --</option>';

    filteredData = [];
    currentRegionRows = [];
    currentPage = 1;

    renderData();
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
        exportBtn.style.opacity = totalCount === 0 ? '0.4' : '1';
        exportBtn.style.cursor = totalCount === 0 ? 'not-allowed' : 'pointer';
    }

    // Empty State vs Data Display
    const emptyState = document.getElementById('empty-state');
    const contentArea = document.getElementById('data-content-area');
    const paginationArea = document.getElementById('pagination-container');

    if (totalCount === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i data-lucide="inbox" style="width:36px; height:36px; color:var(--text-muted); margin-bottom:8px;"></i>
                <div style="font-size:0.95rem; color:var(--text-main); font-weight:700;">
                    ${selectedRegion ? 'தேர்ந்தெடுத்த வடிகட்டலுக்கு பதிவுகள் எதுவும் கிடைக்கவில்லை (No Records Found)' : 'மண்டலத்தை தேர்வு செய்து "வடிகட்டு" பொத்தானை அழுத்தவும் (Select Region above and click Apply Filter)'}
                </div>
            `;
        }
        if (contentArea) contentArea.style.display = 'none';
        if (paginationArea) paginationArea.style.display = 'none';
        if (window.lucide) lucide.createIcons();
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (contentArea) contentArea.style.display = 'block';
    if (paginationArea) paginationArea.style.display = 'flex';

    // Slice for Current Page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalCount);
    const pageRows = filteredData.slice(startIndex, endIndex);

    // Render Views
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
    if (g === 'Grade A') return '<span class="grade-badge grade-badge-a">A Grade</span>';
    if (g === 'Grade B') return '<span class="grade-badge grade-badge-b">B Grade</span>';
    if (g === 'Grade C') return '<span class="grade-badge grade-badge-c">C Grade</span>';
    return '<span class="grade-badge grade-badge-u">Ungraded</span>';
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

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center;">
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
        copyBtn.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px;"></i> <span>நகலெடு (Copy Meaning)</span>';
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
            copyBtn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px; color:#10b981;"></i> <span style="color:#10b981;">நகலெடுக்கப்பட்டது!</span>';
            if (window.lucide) lucide.createIcons();
            setTimeout(() => {
                if (copyBtn) {
                    copyBtn.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px;"></i> <span>நகலெடு (Copy Meaning)</span>';
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
        exportBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:16px; height:16px;"></i> <span>பதிவிறக்கம் ஆகிறது...</span>';
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
