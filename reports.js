/**
 * reports.js
 * Dedicated Reporting & Interactive Analytics Engine for Namma Sami Namma Kovil
 * Supports Pincode Grade Analysis (Report 1), Geographic Hierarchy (Report 2),
 * Multi-format Chart.js visualizer, Image Exporter (PNG), WhatsApp Sharing,
 * and AI Assistant Chat Box with Natural Language Query Parsing.
 */

let dataset = [];
let currentReportId = 1;
let currentChartType = 'bar';
let viewMode = 'both'; // 'both', 'chart', 'table'
let includeGrade = true;
let chartInstance = null;
let currentReportRows = [];
let filteredReportRows = [];

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

// Switch Active Report (Report 1 vs Report 2)
function switchReport(reportId) {
    currentReportId = reportId;
    
    // Update Tab UI
    document.getElementById('tab-report-1').classList.toggle('active', reportId === 1);
    document.getElementById('tab-report-2').classList.toggle('active', reportId === 2);
    
    // Toggle Report 1 Grade Checkbox visibility
    const gradeWrapper = document.getElementById('wrapper-grade-toggle');
    if (gradeWrapper) {
        gradeWrapper.style.display = reportId === 1 ? 'inline-flex' : 'none';
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

// Filter Report Table rows live via search input
function filterReportTable(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        filteredReportRows = [...currentReportRows];
    } else {
        filteredReportRows = currentReportRows.filter(row => {
            return Object.values(row).some(val => String(val).toLowerCase().includes(q));
        });
    }
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

    filteredReportRows = [...currentReportRows];
    renderChart();
    renderTable();
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
        pct: ((r.count / totalCount) * 100).toFixed(2),
        pctA: ((r.gradeA / (r.count || 1)) * 100).toFixed(1),
        pctB: ((r.gradeB / (r.count || 1)) * 100).toFixed(1),
        pctC: ((r.gradeC / (r.count || 1)) * 100).toFixed(1),
    }));

    // Sort by count descending
    currentReportRows.sort((a, b) => b.count - a.count);
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
        pct: ((r.count / totalCount) * 100).toFixed(2),
        pctA: ((r.gradeA / (r.count || 1)) * 100).toFixed(1),
        pctB: ((r.gradeB / (r.count || 1)) * 100).toFixed(1),
        pctC: ((r.gradeC / (r.count || 1)) * 100).toFixed(1),
    }));

    // Sort by count descending
    currentReportRows.sort((a, b) => b.count - a.count);
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
        captionInfo.textContent = `Displaying Top ${topRows.length} Categories (Total: ${filteredReportRows.length})`;
    }

    const ctx = canvas.getContext('2d');
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
                    borderColor: '#0f172a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: '#f8fafc', font: { family: 'Outfit' } } }
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
                    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.08)' } }
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
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.08)' } },
                    y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
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
                    x: { ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.08)' } }
                },
                plugins: { legend: { display: false } }
            }
        };
    }

    chartInstance = new Chart(ctx, chartConfig);
}

// ==========================================
// DATA TABLE RENDERING ENGINE
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
        // REPORT 1: Pincode Table
        let headHtml = `
            <tr>
                <th>#</th>
                <th>Pincode (பின்கோடு)</th>
                <th>Total Persons</th>
                <th>Share %</th>
        `;
        if (includeGrade) {
            headHtml += `
                <th style="color:#6ee7b7;">🟢 Grade A</th>
                <th style="color:#67e8f9;">🔵 Grade B</th>
                <th style="color:#fde047;">🟠 Grade C</th>
                <th style="color:#cbd5e1;">⚪ UnClassified</th>
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
        // REPORT 2: Geographic Hierarchy Table
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>மண்டலம் (Region)</th>
                <th>மாவட்டம் (District)</th>
                <th>ஒன்றியம் (Union)</th>
                <th>பின்கோடு</th>
                <th>Total Persons</th>
                <th>Share %</th>
                <th style="color:#6ee7b7;">🟢 Grade A</th>
                <th style="color:#67e8f9;">🔵 Grade B</th>
                <th style="color:#fde047;">🟠 Grade C</th>
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

    // Reset command
    if (q.includes('reset') || q.includes('clear') || q.includes('show all')) {
        aiPincodeCondition = 'all';
        aiGradeFilter = '';
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

    // Report switching
    if (q.includes('report 2') || q.includes('geographic') || q.includes('hierarchy') || q.includes('மண்டலம்')) {
        switchReport(2);
        actions.push('Switched to <strong>Report 2: Geographic Hierarchy</strong>');
    } else if (q.includes('report 1') || q.includes('pincode report')) {
        switchReport(1);
        actions.push('Switched to <strong>Report 1: Pincode Distribution</strong>');
    }

    // Apply & re-render
    renderActiveReport();

    const resultCount = filteredReportRows.reduce((acc, r) => acc + r.count, 0);
    const summaryMsg = actions.length > 0
        ? `Applied AI Commands:<br>• ${actions.join('<br>• ')}<br><span style="color:#6ee7b7; font-weight:700;">✨ Found ${resultCount.toLocaleString()} matching records! Graphs & tables updated below.</span>`
        : `Could not parse explicit filter parameters. Try asking: <em>"filter all A grade"</em> or <em>"show data without pincode"</em>.`;

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

    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = `⏳ Generating Image...`;
    btn.disabled = true;

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
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ==========================================
// INTEGRATED WHATSAPP SHARE ENGINE
// ==========================================
function shareReportOnWhatsApp() {
    const reportName = currentReportId === 1 ? '📍 Pincode Distribution & Grade Analysis' : '🗺️ Geographic Hierarchy Breakdown';
    const totalRecords = dataset.length.toLocaleString();
    const dateStr = new Date().toLocaleDateString();

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
-------------------------------------------
📋 *Report*: ${reportName}
📅 *Date*: ${dateStr}
👥 *Total Dataset Records*: ${totalRecords}
-------------------------------------------
🏆 *Top High-Density Categories*:
${topListText}

📊 *Grade Summary*:
🟢 Grade A (Interested to know more): ${totalGradeA.toLocaleString()}
🔵 Grade B (Interested but no time): ${totalGradeB.toLocaleString()}
🟠 Grade C (Not interested): ${totalGradeC.toLocaleString()}
-------------------------------------------
Shared via Namma Sami Namma Kovil Reports Hub (v9.2)`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
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
                'Union / ஒன்றியம்': r.union,
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
