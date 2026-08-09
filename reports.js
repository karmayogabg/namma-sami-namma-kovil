/**
 * reports.js
 * Dedicated Reporting & Interactive Analytics Engine for Namma Sami Namma Kovil
 * Supports Pincode Grade Analysis (Report 1), Geographic Hierarchy (Report 2),
 * Multi-format Chart.js visualizer, Image Exporter (PNG), Instant Direct WhatsApp Link Sharing,
 * Per-Column Sorting & Filtering, and AI Assistant Chat Box with Natural Language Query Parsing.
 */

let dataset = [];
let currentReportId = 1;
let currentChartType = 'bar';
let viewMode = 'both'; // 'both', 'chart', 'table'
let includeGrade = true;
let chartInstance = null;
let currentReportRows = [];
let filteredReportRows = [];

// Column Sorting & Filtering State
let sortKey = 'count';
let sortOrder = 'desc'; // 'asc' or 'desc'
let columnFilters = {};

// AI Assistant State Variables
let aiPincodeCondition = 'all'; // 'all', 'missing', 'present'
let aiGradeFilter = '';          // '', 'A', 'B', 'C', 'Ungraded'

// DOM Elements
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await loadDataset();
    setupFilters();
    renderActiveReport();
});

// Theme Toggle System
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
    renderChart();
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

// Load JSON Dataset
async function loadDataset() {
    try {
        const response = await fetch('namma_sami_namma_kovil_full.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        dataset = await response.json();
        console.log(`✅ Loaded ${dataset.length} records into Reports Hub.`);
    } catch (err) {
        console.error('❌ Failed to load JSON dataset:', err);
        alert('Failed to load dataset for reports. Please ensure namma_sami_namma_kovil_full.json exists.');
    }
}

// Populate Region & District Dropdown Filters
function setupFilters() {
    const regionSelect = document.getElementById('filter-report-region');
    const districtSelect = document.getElementById('filter-report-district');
    if (!regionSelect || !districtSelect) return;

    const regions = new Set();
    const districts = new Set();

    dataset.forEach(item => {
        if (item.region) regions.add(item.region.trim());
        if (item.district) districts.add(item.district.trim());
    });

    Array.from(regions).sort().forEach(reg => {
        const opt = document.createElement('option');
        opt.value = reg;
        opt.textContent = reg;
        regionSelect.appendChild(opt);
    });

    Array.from(districts).sort().forEach(dist => {
        const opt = document.createElement('option');
        opt.value = dist;
        opt.textContent = dist;
        districtSelect.appendChild(opt);
    });
}

// Switch Active Report with Synchronized AI Assistant Context
function switchReport(reportId) {
    if (currentReportId === reportId) {
        renderActiveReport();
        return;
    }

    currentReportId = reportId;
    columnFilters = {}; // Reset per-column filters on report switch
    sortKey = 'count';
    sortOrder = 'desc';
    
    // Update Tab UI
    document.getElementById('tab-report-1').classList.toggle('active', reportId === 1);
    document.getElementById('tab-report-2').classList.toggle('active', reportId === 2);
    
    // Toggle Report 1 Grade Checkbox visibility
    const gradeWrapper = document.getElementById('wrapper-grade-toggle');
    if (gradeWrapper) {
        gradeWrapper.style.display = reportId === 1 ? 'inline-flex' : 'none';
    }

    // Notify AI Assistant & Update Chat Placeholder & Context
    const aiInput = document.getElementById('ai-chat-input');
    if (reportId === 1) {
        if (aiInput) aiInput.placeholder = "Ask AI Assistant (e.g. 'filter Grade A without pincode')...";
        appendAiChatMessage('assistant', `🔄 <strong>AI Context Switched to Report #1</strong>: Pincode Distribution & Grade Analysis.<br>Ask me about pincodes, missing pincodes, or Grade A/B/C filters!`);
    } else if (reportId === 2) {
        if (aiInput) aiInput.placeholder = "Ask AI Assistant (e.g. 'show Top 10 districts in தென்காசி region')...";
        appendAiChatMessage('assistant', `🔄 <strong>AI Context Switched to Report #2</strong>: Geographic Hierarchy Breakdown (மண்டலம் ➔ மாவட்டம் ➔ ஒன்றியம் ➔ பின்கோடு).<br>Ask me about specific regions, districts, or union headcounts!`);
    }

    renderActiveReport();
}

// Set View Mode (Combined, Chart Only, Table Only)
function setViewMode(mode) {
    viewMode = mode;
    document.getElementById('btn-view-both').classList.toggle('active', mode === 'both');
    document.getElementById('btn-view-chart').classList.toggle('active', mode === 'chart');
    document.getElementById('btn-view-table').classList.toggle('active', mode === 'table');

    const chartSec = document.getElementById('section-chart');
    const tableSec = document.getElementById('section-table');

    if (mode === 'both') {
        chartSec.style.display = 'block';
        tableSec.style.display = 'block';
    } else if (mode === 'chart') {
        chartSec.style.display = 'block';
        tableSec.style.display = 'none';
    } else if (mode === 'table') {
        chartSec.style.display = 'none';
        tableSec.style.display = 'block';
    }
}

// Change Chart Format (Vertical Bar, Horizontal Bar, Line, Donut)
function changeChartType(type) {
    currentChartType = type;
    renderChart();
}

// Toggle Grade Option for Report 1
function toggleGradeOption(checked) {
    includeGrade = checked;
    renderActiveReport();
}

// Apply Filters (Region & District)
function applyReportFilters() {
    renderActiveReport();
}

// Global Filter Report Table rows live via search input
function filterReportTable(query) {
    applyColumnSortingAndFiltering();
}

// ==========================================
// COLUMN SORTING & PER-COLUMN FILTERING ENGINE
// ==========================================
function sortTableByColumn(key) {
    if (sortKey === key) {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
        sortKey = key;
        sortOrder = 'desc';
    }
    applyColumnSortingAndFiltering();
}

function onColumnFilterInput(colKey, val) {
    columnFilters[colKey] = val.trim().toLowerCase();
    applyColumnSortingAndFiltering();
}

function applyColumnSortingAndFiltering() {
    let rows = [...currentReportRows];

    // Global Search Bar Query
    const searchInput = document.getElementById('report-search-input');
    const globalQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (globalQuery) {
        rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(globalQuery)));
    }

    // Per-Column Filters
    Object.keys(columnFilters).forEach(colKey => {
        const filterVal = columnFilters[colKey];
        if (!filterVal) return;

        rows = rows.filter(r => {
            const val = r[colKey];
            if (val === undefined || val === null) return false;

            // Numeric comparisons (e.g. >50, <100, 50-100, 50)
            if (typeof val === 'number' || !isNaN(val)) {
                const numVal = parseFloat(val);
                if (filterVal.startsWith('>=')) {
                    return numVal >= parseFloat(filterVal.substring(2));
                } else if (filterVal.startsWith('>')) {
                    return numVal > parseFloat(filterVal.substring(1));
                } else if (filterVal.startsWith('<=')) {
                    return numVal <= parseFloat(filterVal.substring(2));
                } else if (filterVal.startsWith('<')) {
                    return numVal < parseFloat(filterVal.substring(1));
                } else if (filterVal.includes('-')) {
                    const parts = filterVal.split('-').map(p => parseFloat(p));
                    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        return numVal >= parts[0] && numVal <= parts[1];
                    }
                } else {
                    const targetNum = parseFloat(filterVal);
                    if (!isNaN(targetNum)) return numVal >= targetNum;
                }
            }

            // String substring comparison
            return String(val).toLowerCase().includes(filterVal);
        });
    });

    // Sorting
    rows.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';

        let cmp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
            cmp = valA - valB;
        } else if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
            cmp = parseFloat(valA) - parseFloat(valB);
        } else {
            cmp = String(valA).localeCompare(String(valB));
        }

        return sortOrder === 'desc' ? -cmp : cmp;
    });

    filteredReportRows = rows;
    renderChart();
    renderTable();
}

// Main Render Function for Active Report
function renderActiveReport() {
    const selectedRegion = document.getElementById('filter-report-region')?.value || '';
    const selectedDistrict = document.getElementById('filter-report-district')?.value || '';

    // Filter Dataset Scope by Region, District, AI Pincode Condition, and AI Grade Filter
    let scopedData = dataset;
    if (selectedRegion) {
        scopedData = scopedData.filter(d => d.region && d.region.trim() === selectedRegion);
    }
    if (selectedDistrict) {
        scopedData = scopedData.filter(d => d.district && d.district.trim() === selectedDistrict);
    }

    // AI Pincode Condition Filter
    if (aiPincodeCondition === 'missing') {
        scopedData = scopedData.filter(d => !d.pincode || d.pincode.trim() === '' || d.pincode.trim() === '-');
    } else if (aiPincodeCondition === 'present') {
        scopedData = scopedData.filter(d => d.pincode && d.pincode.trim() !== '' && d.pincode.trim() !== '-');
    }

    // AI Grade Filter
    if (aiGradeFilter) {
        scopedData = scopedData.filter(d => {
            const g = d.grade ? d.grade.trim() : 'Ungraded';
            if (aiGradeFilter === 'Ungraded') return g === 'Ungraded' || g === 'UnClassified' || g === '';
            return g === `Grade ${aiGradeFilter}` || g === aiGradeFilter;
        });
    }

    if (currentReportId === 1) {
        generateReport1Pincode(scopedData);
    } else if (currentReportId === 2) {
        generateReport2GeoHierarchy(scopedData);
    }

    applyColumnSortingAndFiltering();
}

// ==========================================
// REPORT 1: Pincode Distribution & Grade Analysis
// ==========================================
function generateReport1Pincode(scopedData) {
    const reportBadge = document.getElementById('report-badge-id');
    const reportTitle = document.getElementById('report-main-title');
    const reportSubtitle = document.getElementById('report-sub-title');
    const reportStat = document.getElementById('report-stat-count');

    if (reportBadge) reportBadge.textContent = 'REPORT #1';
    if (reportTitle) reportTitle.textContent = 'Pincode Distribution & Grade Analysis (பின்கோடு அறிக்கை)';
    if (reportSubtitle) reportSubtitle.textContent = `Pincode headcount breakdown with Grade A/B/C classification across ${scopedData.length.toLocaleString()} records.`;
    if (reportStat) reportStat.textContent = `${scopedData.length.toLocaleString()} Records`;

    const pinMap = new Map();

    scopedData.forEach(item => {
        const pin = item.pincode && item.pincode.trim() !== '-' ? item.pincode.trim() : 'Unspecified / பின்கோடு இல்லை';
        if (!pinMap.has(pin)) {
            pinMap.set(pin, {
                pincode: pin,
                count: 0,
                gradeA: 0,
                gradeB: 0,
                gradeC: 0,
                ungraded: 0
            });
        }
        const rec = pinMap.get(pin);
        rec.count++;

        const g = item.grade ? item.grade.trim() : 'Ungraded';
        if (g === 'Grade A' || g === 'A') rec.gradeA++;
        else if (g === 'Grade B' || g === 'B') rec.gradeB++;
        else if (g === 'Grade C' || g === 'C') rec.gradeC++;
        else rec.ungraded++;
    });

    const totalCount = scopedData.length || 1;
    currentReportRows = Array.from(pinMap.values()).map(r => ({
        ...r,
        pct: parseFloat(((r.count / totalCount) * 100).toFixed(2)),
        pctA: parseFloat(((r.gradeA / (r.count || 1)) * 100).toFixed(1)),
        pctB: parseFloat(((r.gradeB / (r.count || 1)) * 100).toFixed(1)),
        pctC: parseFloat(((r.gradeC / (r.count || 1)) * 100).toFixed(1)),
    }));
}

// ==========================================
// REPORT 2: Geographic Hierarchy Breakdown (மண்டலம் ➔ மாவட்டம் ➔ ஒன்றியம் ➔ பின்கோடு)
// ==========================================
function generateReport2GeoHierarchy(scopedData) {
    const reportBadge = document.getElementById('report-badge-id');
    const reportTitle = document.getElementById('report-main-title');
    const reportSubtitle = document.getElementById('report-sub-title');
    const reportStat = document.getElementById('report-stat-count');

    if (reportBadge) reportBadge.textContent = 'REPORT #2';
    if (reportTitle) reportTitle.textContent = 'Geographic Hierarchy Breakdown (மண்டலம் ➔ மாவட்டம் ➔ ஒன்றியம் ➔ பின்கோடு)';
    if (reportSubtitle) reportSubtitle.textContent = `Hierarchical breakdown of headcounts and grades structured by Region, District, Union, and Pincode.`;
    if (reportStat) reportStat.textContent = `${scopedData.length.toLocaleString()} Records`;

    const geoMap = new Map();

    scopedData.forEach(item => {
        const reg = item.region ? item.region.trim() : 'Unspecified Region';
        const dist = item.district ? item.district.trim() : 'Unspecified District';
        const union = item.union ? item.union.trim() : 'Unspecified Union';
        const pin = item.pincode ? item.pincode.trim() : '-';

        const key = `${reg} | ${dist} | ${union} | ${pin}`;
        if (!geoMap.has(key)) {
            geoMap.set(key, {
                key,
                region: reg,
                district: dist,
                union: union,
                pincode: pin,
                count: 0,
                gradeA: 0,
                gradeB: 0,
                gradeC: 0,
                ungraded: 0
            });
        }
        const rec = geoMap.get(key);
        rec.count++;

        const g = item.grade ? item.grade.trim() : 'Ungraded';
        if (g === 'Grade A' || g === 'A') rec.gradeA++;
        else if (g === 'Grade B' || g === 'B') rec.gradeB++;
        else if (g === 'Grade C' || g === 'C') rec.gradeC++;
        else rec.ungraded++;
    });

    const totalCount = scopedData.length || 1;
    currentReportRows = Array.from(geoMap.values()).map(r => ({
        ...r,
        pct: parseFloat(((r.count / totalCount) * 100).toFixed(2)),
        pctA: parseFloat(((r.gradeA / (r.count || 1)) * 100).toFixed(1)),
        pctB: parseFloat(((r.gradeB / (r.count || 1)) * 100).toFixed(1)),
        pctC: parseFloat(((r.gradeC / (r.count || 1)) * 100).toFixed(1)),
    }));
}

// ==========================================
// CHART.JS RENDERING ENGINE
// ==========================================
function renderChart() {
    const canvas = document.getElementById('report-chart-canvas');
    if (!canvas) return;

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    const topRows = filteredReportRows.slice(0, 35); // Display top 35 in chart for high visual clarity
    const labels = topRows.map(r => currentReportId === 1 ? r.pincode : `${r.district} - ${r.union}`);
    const counts = topRows.map(r => r.count);

    const captionInfo = document.getElementById('chart-caption-info');
    if (captionInfo) {
        captionInfo.textContent = `Displaying Top ${topRows.length} Categories (Total: ${filteredReportRows.length.toLocaleString()})`;
    }

    const ctx = canvas.getContext('2d');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#334155' : '#94a3b8';
    const gridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    const legendColor = isLight ? '#0f172a' : '#f8fafc';
    let chartConfig = {};

    if (currentChartType === 'doughnut') {
        const top5 = topRows.slice(0, 8);
        chartConfig = {
            type: 'doughnut',
            data: {
                labels: top5.map(r => currentReportId === 1 ? `Pincode ${r.pincode}` : r.district),
                datasets: [{
                    data: top5.map(r => r.count),
                    backgroundColor: ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#84cc16', '#a855f7'],
                    borderWidth: 2,
                    borderColor: isLight ? '#ffffff' : '#0f172a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: legendColor, font: { family: 'Outfit' } } }
                }
            }
        };
    } else if (currentChartType === 'line') {
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Person Count',
                    data: counts,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor }, grid: { color: gridColor } }
                },
                plugins: { legend: { display: false } }
            }
        };
    } else if (currentChartType === 'horizontalBar') {
        chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Person Count',
                    data: counts,
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } }
                },
                plugins: { legend: { display: false } }
            }
        };
    } else { // Vertical Bar (default)
        chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Person Count',
                    data: counts,
                    backgroundColor: 'rgba(6, 182, 212, 0.7)',
                    borderColor: '#06b6d4',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: textColor, font: { size: 11 }, maxRotation: 45 }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor }, grid: { color: gridColor } }
                },
                plugins: { legend: { display: false } }
            }
        };
    }

    chartInstance = new Chart(ctx, chartConfig);
}

// Helper: Format Sort Arrow Indicator
function getSortArrow(key) {
    if (sortKey !== key) return '';
    return sortOrder === 'desc' ? ' ▼' : ' ▲';
}

// ==========================================
// DATA TABLE RENDERING ENGINE (SORT + PER-COLUMN FILTER)
// ==========================================
function renderTable() {
    const thead = document.getElementById('report-table-head');
    const tbody = document.getElementById('report-table-body');
    const countInfo = document.getElementById('table-row-count-info');

    if (!thead || !tbody) return;

    if (countInfo) {
        countInfo.textContent = `${filteredReportRows.length.toLocaleString()} rows displayed`;
    }

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (currentReportId === 1) {
        // REPORT 1: Pincode Table Header (Row 1: Sort Titles, Row 2: Per-column Filter Inputs)
        let headHtml = `
            <tr>
                <th style="width:40px;">#</th>
                <th onclick="sortTableByColumn('pincode')" style="cursor:pointer;" title="Click to sort by Pincode">
                    Pincode (பின்கோடு)${getSortArrow('pincode')}
                </th>
                <th onclick="sortTableByColumn('count')" style="cursor:pointer;" title="Click to sort by Total Persons">
                    Total Persons${getSortArrow('count')}
                </th>
                <th onclick="sortTableByColumn('pct')" style="cursor:pointer;" title="Click to sort by Share %">
                    Share %${getSortArrow('pct')}
                </th>
        `;
        if (includeGrade) {
            headHtml += `
                <th onclick="sortTableByColumn('gradeA')" style="cursor:pointer; color:#6ee7b7;" title="Click to sort by Grade A">🟢 Grade A${getSortArrow('gradeA')}</th>
                <th onclick="sortTableByColumn('gradeB')" style="cursor:pointer; color:#67e8f9;" title="Click to sort by Grade B">🔵 Grade B${getSortArrow('gradeB')}</th>
                <th onclick="sortTableByColumn('gradeC')" style="cursor:pointer; color:#fde047;" title="Click to sort by Grade C">🟠 Grade C${getSortArrow('gradeC')}</th>
                <th onclick="sortTableByColumn('ungraded')" style="cursor:pointer; color:#cbd5e1;" title="Click to sort by UnClassified">⚪ UnClassified${getSortArrow('ungraded')}</th>
            `;
        }
        headHtml += `</tr>`;

        // Row 2: Per-column Filter Inputs
        headHtml += `<tr style="background: rgba(15, 23, 42, 0.95);">
            <th></th>
            <th><input type="text" class="col-filter-input" placeholder="Filter..." value="${columnFilters.pincode || ''}" oninput="onColumnFilterInput('pincode', this.value)"></th>
            <th><input type="text" class="col-filter-input" placeholder="Min count..." value="${columnFilters.count || ''}" oninput="onColumnFilterInput('count', this.value)"></th>
            <th><input type="text" class="col-filter-input" placeholder="Min %..." value="${columnFilters.pct || ''}" oninput="onColumnFilterInput('pct', this.value)"></th>
        `;
        if (includeGrade) {
            headHtml += `
                <th><input type="text" class="col-filter-input" placeholder="Grade A..." value="${columnFilters.gradeA || ''}" oninput="onColumnFilterInput('gradeA', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Grade B..." value="${columnFilters.gradeB || ''}" oninput="onColumnFilterInput('gradeB', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Grade C..." value="${columnFilters.gradeC || ''}" oninput="onColumnFilterInput('gradeC', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Filter U..." value="${columnFilters.ungraded || ''}" oninput="onColumnFilterInput('ungraded', this.value)"></th>
            `;
        }
        headHtml += `</tr>`;
        thead.innerHTML = headHtml;

        tbody.innerHTML = filteredReportRows.map((r, idx) => {
            let rowHtml = `
                <tr>
                    <td style="color:var(--text-muted); font-weight:600;">${idx + 1}</td>
                    <td style="font-weight:700; color:#c4b5fd;">${r.pincode}</td>
                    <td style="font-weight:700;">${r.count.toLocaleString()}</td>
                    <td><span class="brand-badge" style="padding:2px 8px; font-size:0.75rem;">${r.pct}%</span></td>
            `;
            if (includeGrade) {
                rowHtml += `
                    <td><span style="color:#6ee7b7; font-weight:700;">${r.gradeA.toLocaleString()}</span> <span style="font-size:0.75rem; color:var(--text-muted);">(${r.pctA}%)</span></td>
                    <td><span style="color:#67e8f9; font-weight:700;">${r.gradeB.toLocaleString()}</span> <span style="font-size:0.75rem; color:var(--text-muted);">(${r.pctB}%)</span></td>
                    <td><span style="color:#fde047; font-weight:700;">${r.gradeC.toLocaleString()}</span> <span style="font-size:0.75rem; color:var(--text-muted);">(${r.pctC}%)</span></td>
                    <td><span style="color:#cbd5e1; font-weight:600;">${r.ungraded.toLocaleString()}</span></td>
                `;
            }
            rowHtml += `</tr>`;
            return rowHtml;
        }).join('');

    } else if (currentReportId === 2) {
        // REPORT 2: Geographic Hierarchy Table Header & Filter Row
        thead.innerHTML = `
            <tr>
                <th style="width:40px;">#</th>
                <th onclick="sortTableByColumn('region')" style="cursor:pointer;">மண்டலம் (Region)${getSortArrow('region')}</th>
                <th onclick="sortTableByColumn('district')" style="cursor:pointer;">மாவட்டம் (District)${getSortArrow('district')}</th>
                <th onclick="sortTableByColumn('union')" style="cursor:pointer;">ஒன்றியம் (Union)${getSortArrow('union')}</th>
                <th onclick="sortTableByColumn('pincode')" style="cursor:pointer;">பின்கோடு${getSortArrow('pincode')}</th>
                <th onclick="sortTableByColumn('count')" style="cursor:pointer;">Total Persons${getSortArrow('count')}</th>
                <th onclick="sortTableByColumn('pct')" style="cursor:pointer;">Share %${getSortArrow('pct')}</th>
                <th onclick="sortTableByColumn('gradeA')" style="cursor:pointer; color:#6ee7b7;">🟢 Grade A${getSortArrow('gradeA')}</th>
                <th onclick="sortTableByColumn('gradeB')" style="cursor:pointer; color:#67e8f9;">🔵 Grade B${getSortArrow('gradeB')}</th>
                <th onclick="sortTableByColumn('gradeC')" style="cursor:pointer; color:#fde047;">🟠 Grade C${getSortArrow('gradeC')}</th>
            </tr>
            <tr style="background: rgba(15, 23, 42, 0.95);">
                <th></th>
                <th><input type="text" class="col-filter-input" placeholder="Region..." value="${columnFilters.region || ''}" oninput="onColumnFilterInput('region', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="District..." value="${columnFilters.district || ''}" oninput="onColumnFilterInput('district', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Union..." value="${columnFilters.union || ''}" oninput="onColumnFilterInput('union', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Pincode..." value="${columnFilters.pincode || ''}" oninput="onColumnFilterInput('pincode', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Min count..." value="${columnFilters.count || ''}" oninput="onColumnFilterInput('count', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Min %..." value="${columnFilters.pct || ''}" oninput="onColumnFilterInput('pct', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Grade A..." value="${columnFilters.gradeA || ''}" oninput="onColumnFilterInput('gradeA', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Grade B..." value="${columnFilters.gradeB || ''}" oninput="onColumnFilterInput('gradeB', this.value)"></th>
                <th><input type="text" class="col-filter-input" placeholder="Grade C..." value="${columnFilters.gradeC || ''}" oninput="onColumnFilterInput('gradeC', this.value)"></th>
            </tr>
        `;

        tbody.innerHTML = filteredReportRows.map((r, idx) => `
            <tr>
                <td style="color:var(--text-muted); font-weight:600;">${idx + 1}</td>
                <td style="font-weight:600; color:#c4b5fd;">${r.region}</td>
                <td style="font-weight:600; color:#6ee7b7;">${r.district}</td>
                <td>${r.union}</td>
                <td style="color:var(--text-muted);">${r.pincode}</td>
                <td style="font-weight:700;">${r.count.toLocaleString()}</td>
                <td><span class="brand-badge" style="padding:2px 8px; font-size:0.75rem;">${r.pct}%</span></td>
                <td><span style="color:#6ee7b7; font-weight:700;">${r.gradeA.toLocaleString()}</span></td>
                <td><span style="color:#67e8f9; font-weight:700;">${r.gradeB.toLocaleString()}</span></td>
                <td><span style="color:#fde047; font-weight:700;">${r.gradeC.toLocaleString()}</span></td>
            </tr>
        `).join('');
    }
}

// ==========================================
// AI REPORT ASSISTANT CHAT ENGINE
// ==========================================
function sendAiChipQuery(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) input.value = text;
    submitAiChat();
}

function submitAiChat() {
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    input.value = '';

    appendAiChatMessage('user', query);
    processAiUserQuery(query);
}

function appendAiChatMessage(sender, text) {
    const log = document.getElementById('ai-chat-log');
    if (!log) return;

    const div = document.createElement('div');
    div.style.fontSize = '0.84rem';
    div.style.padding = '8px 12px';
    div.style.borderRadius = '6px';
    div.style.maxWidth = '88%';

    if (sender === 'user') {
        div.style.background = 'rgba(6, 182, 212, 0.18)';
        div.style.border = '1px solid rgba(6, 182, 212, 0.35)';
        div.style.color = '#67e8f9';
        div.style.alignSelf = 'flex-end';
        div.innerHTML = `<strong>👤 You:</strong> ${escapeHtml(text)}`;
    } else {
        div.style.background = 'rgba(139, 92, 246, 0.15)';
        div.style.border = '1px solid rgba(139, 92, 246, 0.35)';
        div.style.color = '#c4b5fd';
        div.style.alignSelf = 'flex-start';
        div.innerHTML = `<strong>🤖 AI Assistant:</strong> ${text}`;
    }

    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function processAiUserQuery(query) {
    const q = query.toLowerCase();
    const actions = [];

    // Report switching
    if (q.includes('report 2') || q.includes('geographic') || q.includes('hierarchy') || q.includes('மண்டலம்')) {
        if (currentReportId !== 2) {
            switchReport(2);
            actions.push('Switched to <strong>Report 2: Geographic Hierarchy</strong>');
        }
    } else if (q.includes('report 1') || q.includes('pincode report')) {
        if (currentReportId !== 1) {
            switchReport(1);
            actions.push('Switched to <strong>Report 1: Pincode Distribution</strong>');
        }
    }

    // Reset command
    if (q.includes('reset') || q.includes('clear') || q.includes('show all')) {
        aiPincodeCondition = 'all';
        aiGradeFilter = '';
        columnFilters = {};
        const regEl = document.getElementById('filter-report-region');
        const distEl = document.getElementById('filter-report-district');
        if (regEl) regEl.value = '';
        if (distEl) distEl.value = '';
        const chk = document.getElementById('chk-include-grade');
        if (chk) chk.checked = true;
        includeGrade = true;
        actions.push('Reset all filters to default dataset');
    }

    // Pincode condition
    if (q.includes('without pincode') || q.includes('missing pincode') || q.includes('no pincode') || q.includes('pincode இல்லை')) {
        aiPincodeCondition = 'missing';
        actions.push('Filter: Records <strong>Without Pincode</strong>');
    } else if (q.includes('with pincode') || q.includes('has pincode')) {
        aiPincodeCondition = 'present';
        actions.push('Filter: Records <strong>With Valid Pincode</strong>');
    }

    // Grade filter
    if (q.includes('grade a') || q.includes('a grade') || q.includes('a தர') || q.includes('grade 🟢')) {
        aiGradeFilter = 'A';
        actions.push('Filter: <strong>🟢 Grade A Records Only</strong>');
    } else if (q.includes('grade b') || q.includes('b grade') || q.includes('b தர')) {
        aiGradeFilter = 'B';
        actions.push('Filter: <strong>🔵 Grade B Records Only</strong>');
    } else if (q.includes('grade c') || q.includes('c grade') || q.includes('c தர')) {
        aiGradeFilter = 'C';
        actions.push('Filter: <strong>🟠 Grade C Records Only</strong>');
    } else if (q.includes('ungraded') || q.includes('unclassified') || q.includes('pending')) {
        aiGradeFilter = 'Ungraded';
        actions.push('Filter: <strong>⚪ UnClassified Records</strong>');
    }

    // Dynamic Region & District matching
    const regSelect = document.getElementById('filter-report-region');
    const distSelect = document.getElementById('filter-report-district');

    if (regSelect) {
        for (let i = 1; i < regSelect.options.length; i++) {
            const val = regSelect.options[i].value;
            if (val && q.includes(val.toLowerCase())) {
                regSelect.value = val;
                actions.push(`Region Filter: <strong>${val}</strong>`);
                break;
            }
        }
    }

    if (distSelect) {
        for (let i = 1; i < distSelect.options.length; i++) {
            const val = distSelect.options[i].value;
            if (val && q.includes(val.toLowerCase())) {
                distSelect.value = val;
                actions.push(`District Filter: <strong>${val}</strong>`);
                break;
            }
        }
    }

    // Chart Format commands
    if (q.includes('horizontal') || q.includes('landscape bar')) {
        currentChartType = 'horizontalBar';
        const sel = document.getElementById('select-chart-type');
        if (sel) sel.value = 'horizontalBar';
        actions.push('Chart: Switched to <strong>Horizontal Bar Chart</strong>');
    } else if (q.includes('donut') || q.includes('pie') || q.includes('doughnut')) {
        currentChartType = 'doughnut';
        const sel = document.getElementById('select-chart-type');
        if (sel) sel.value = 'doughnut';
        actions.push('Chart: Switched to <strong>Donut Chart</strong>');
    } else if (q.includes('line') || q.includes('trend')) {
        currentChartType = 'line';
        const sel = document.getElementById('select-chart-type');
        if (sel) sel.value = 'line';
        actions.push('Chart: Switched to <strong>Line Chart</strong>');
    } else if (q.includes('vertical bar') || (q.includes('bar') && !q.includes('horizontal'))) {
        currentChartType = 'bar';
        const sel = document.getElementById('select-chart-type');
        if (sel) sel.value = 'bar';
        actions.push('Chart: Switched to <strong>Vertical Bar Chart</strong>');
    }

    // Apply & re-render
    renderActiveReport();

    const activeReportLabel = currentReportId === 1 ? 'Report 1 (Pincode & Grade)' : 'Report 2 (Geographic Hierarchy)';
    const resultCount = filteredReportRows.reduce((acc, r) => acc + r.count, 0);

    const summaryMsg = actions.length > 0
        ? `Applied AI Commands in <strong>${activeReportLabel}</strong>:<br>• ${actions.join('<br>• ')}<br><span style="color:#6ee7b7; font-weight:700;">✨ Found ${resultCount.toLocaleString()} matching records! Graphs & tables updated below.</span>`
        : `Active Context: <strong>${activeReportLabel}</strong>. Could not parse explicit filter parameters. Try asking: <em>"filter Grade A in Report 2"</em> or <em>"show data without pincode"</em>.`;

    appendAiChatMessage('assistant', summaryMsg);
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ==========================================
// EXPORT AS IMAGE (PNG) ENGINE
// ==========================================
async function exportReportAsImage() {
    const captureArea = document.getElementById('report-capture-area');
    if (!captureArea) return;

    const btn = event ? event.currentTarget : null;
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = `⏳ Generating Image...`;
        btn.disabled = true;
    }

    try {
        const canvas = await html2canvas(captureArea, {
            scale: 2, // High resolution output
            backgroundColor: '#070913',
            useCORS: true,
            logging: false
        });

        const link = document.createElement('a');
        const reportName = currentReportId === 1 ? 'Pincode_Grade_Analysis' : 'Geographic_Hierarchy';
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `NSNK_Report_${reportName}_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        console.log('✅ Exported report as PNG image successfully!');
    } catch (err) {
        console.error('❌ Failed to generate report image:', err);
        alert('Failed to generate report image. Please try again.');
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// ==========================================
// INSTANT DIRECT WHATSAPP LINK SHARING ENGINE
// ==========================================
function shareReportOnWhatsApp() {
    const reportName = currentReportId === 1 ? '📍 Pincode Distribution & Grade Analysis' : '🗺️ Geographic Hierarchy Breakdown';
    const totalRecords = dataset.length.toLocaleString();
    const dateStr = new Date().toLocaleDateString();
    const reportUrl = 'https://karmayogabg.github.io/namma-sami-namma-kovil/reports.html';

    const top5 = filteredReportRows.slice(0, 5);
    let topListText = '';

    if (currentReportId === 1) {
        topListText = top5.map((r, i) => `${i + 1}. Pincode *${r.pincode}*: ${r.count.toLocaleString()} persons (Grade A: ${r.gradeA})`).join('\n');
    } else {
        topListText = top5.map((r, i) => `${i + 1}. *${r.district}* (${r.union}): ${r.count.toLocaleString()} persons`).join('\n');
    }

    const totalGradeA = filteredReportRows.reduce((sum, r) => sum + r.gradeA, 0);
    const totalGradeB = filteredReportRows.reduce((sum, r) => sum + r.gradeB, 0);
    const totalGradeC = filteredReportRows.reduce((sum, r) => sum + r.gradeC, 0);

    const message = `📊 *நம்ம சாமி நம்ம கோவில் - Analytics Report*

📋 *Report*: ${reportName}
📅 *Date*: ${dateStr}
👥 *Total Dataset Records*: ${totalRecords}

🏆 *Top High-Density Categories*:
${topListText}

📊 *Grade Summary*:
🟢 Grade A (Interested to know more): ${totalGradeA.toLocaleString()}
🔵 Grade B (Interested but no time): ${totalGradeB.toLocaleString()}
🟠 Grade C (Not interested): ${totalGradeC.toLocaleString()}

👉 *View Live Report & Interactive Graphs*:
${reportUrl}

Shared via Namma Sami Namma Kovil Reports Hub (v10.0)`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;

    // Mobile Web Share API or Direct WhatsApp Deep Link
    if (navigator.share) {
        navigator.share({
            title: 'NSNK Analytics Report',
            text: message,
            url: reportUrl
        }).catch(err => {
            console.log('Mobile web share dismissed or unavailable, using WhatsApp deep link:', err);
            window.open(waUrl, '_blank');
        });
    } else {
        window.open(waUrl, '_blank');
    }
}

// ==========================================
// EXPORT REPORT TO EXCEL (.XLSX)
// ==========================================
function exportReportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('XLSX library not loaded.');
        return;
    }

    const exportRows = filteredReportRows.map((r, idx) => {
        if (currentReportId === 1) {
            return {
                'S.No': idx + 1,
                'Pincode / பின்கோடு': r.pincode,
                'Total Persons / நபர்கள் எண்ணிக்கை': r.count,
                'Share Percentage (%)': r.pct + '%',
                'Grade A Count': r.gradeA,
                'Grade B Count': r.gradeB,
                'Grade C Count': r.gradeC,
                'UnClassified Count': r.ungraded
            };
        } else {
            return {
                'S.No': idx + 1,
                'Region / மண்டலம்': r.region,
                'District / மாவட்டம்': r.district,
                'Union / interim': r.union,
                'Pincode / பின்கோடு': r.pincode,
                'Total Persons / நபர்கள் எண்ணிக்கை': r.count,
                'Share Percentage (%)': r.pct + '%',
                'Grade A Count': r.gradeA,
                'Grade B Count': r.gradeB,
                'Grade C Count': r.gradeC
            };
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    const sheetName = currentReportId === 1 ? 'Pincode_Report' : 'Geographic_Report';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `NSNK_Report_${sheetName}_${timestamp}.xlsx`);
}
