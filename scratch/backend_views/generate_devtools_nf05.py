# scratch/backend_views/generate_devtools_nf05.py
import os

html_dir = r'c:\College\Capstone Design\sigigi-main\scratch\backend_views'
os.makedirs(html_dir, exist_ok=True)

# 1. Generate Normal DevTools View (devtools_nf05.html)
normal_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body {
        background-color: #1e1e1e;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #cccccc;
        font-size: 12px;
        user-select: none;
    }
    .devtools-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: #242424;
    }
    .toolbar {
        background-color: #2b2b2b;
        border-bottom: 1px solid #3c3c3c;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .toolbar-tab {
        color: #aaa;
        font-weight: 500;
        cursor: pointer;
    }
    .toolbar-tab.active {
        color: #58a6ff;
        border-bottom: 2px solid #58a6ff;
        padding-bottom: 2px;
    }
    .filter-bar {
        background-color: #1f1f1f;
        border-bottom: 1px solid #3c3c3c;
        padding: 4px 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #888;
    }
    .filter-btn {
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
    }
    .filter-btn.active {
        background-color: #353535;
        color: #fff;
    }
    .network-grid {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    th, td {
        border-bottom: 1px solid #3c3c3c;
        border-right: 1px solid #3c3c3c;
        padding: 6px 8px;
        white-space: nowrap;
    }
    th {
        background-color: #2d2d2d;
        color: #aaa;
        font-weight: normal;
    }
    tr.selected {
        background-color: #353535;
    }
    .status-ok { color: #5cb85c; }
    .waterfall-bar {
        height: 8px;
        border-radius: 2px;
        display: inline-block;
    }
    .waterfall-dns { background-color: #007acc; width: 15px; }
    .waterfall-ttfb { background-color: #e6a23c; width: 45px; }
    .waterfall-download { background-color: #67c23a; width: 20px; }
    
    .timing-panel {
        background-color: #1f1f1f;
        border-top: 1px solid #3c3c3c;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .timing-header {
        font-size: 13px;
        font-weight: bold;
        color: #fff;
        border-bottom: 1px solid #3c3c3c;
        padding-bottom: 6px;
    }
    .timing-row {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
    }
    .timing-label { color: #888; }
    .timing-val { color: #67c23a; font-weight: bold; }
</style>
</head>
<body>
<div class="devtools-container">
    <div class="toolbar">
        <div class="toolbar-tab">Elements</div>
        <div class="toolbar-tab">Console</div>
        <div class="toolbar-tab active">Network</div>
        <div class="toolbar-tab">Performance</div>
        <div class="toolbar-tab">Application</div>
        <div class="toolbar-tab">Security</div>
    </div>
    <div class="filter-bar">
        <span>Filter:</span>
        <span class="filter-btn">All</span>
        <span class="filter-btn active">Fetch/XHR</span>
        <span class="filter-btn">Doc</span>
        <span class="filter-btn">CSS</span>
        <span class="filter-btn">JS</span>
        <span class="filter-btn">Img</span>
    </div>
    <div class="network-grid">
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Name</th>
                    <th style="width: 10%;">Status</th>
                    <th style="width: 10%;">Type</th>
                    <th style="width: 15%;">Initiator</th>
                    <th style="width: 10%;">Size</th>
                    <th style="width: 10%;">Time</th>
                    <th style="width: 20%;">Waterfall</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>/api/auth/login</td>
                    <td class="status-ok">200 OK</td>
                    <td>fetch</td>
                    <td>LoginPage.tsx:45</td>
                    <td>456 B</td>
                    <td>124 ms</td>
                    <td>
                        <span class="waterfall-bar waterfall-dns"></span>
                        <span class="waterfall-bar waterfall-ttfb"></span>
                        <span class="waterfall-bar waterfall-download"></span>
                    </td>
                </tr>
                <tr class="selected">
                    <td>/api/appointments/new</td>
                    <td class="status-ok">200 OK</td>
                    <td>fetch</td>
                    <td>NewAppointment.tsx:12</td>
                    <td>1.2 KB</td>
                    <td>85 ms</td>
                    <td>
                        <span class="waterfall-bar waterfall-dns" style="width:8px;"></span>
                        <span class="waterfall-bar waterfall-ttfb" style="width:30px;"></span>
                        <span class="waterfall-bar waterfall-download" style="width:12px;"></span>
                    </td>
                </tr>
                <tr>
                    <td>/api/appointments/queue</td>
                    <td class="status-ok">200 OK</td>
                    <td>fetch</td>
                    <td>QueuePage.tsx:56</td>
                    <td>2.4 KB</td>
                    <td>94 ms</td>
                    <td>
                        <span class="waterfall-bar waterfall-dns" style="width:10px;"></span>
                        <span class="waterfall-bar waterfall-ttfb" style="width:38px;"></span>
                        <span class="waterfall-bar waterfall-download" style="width:15px;"></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="timing-panel">
        <div class="timing-header">Detailed Timing for /api/appointments/new</div>
        <div class="timing-row">
            <span class="timing-label">Queueing &amp; Connection Setup</span>
            <span class="timing-val">8 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">DNS Lookup</span>
            <span class="timing-val">12 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Initial Connection (TCP/SSL)</span>
            <span class="timing-val">20 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Request Sent</span>
            <span class="timing-val">1 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Waiting (TTFB - Time to First Byte)</span>
            <span class="timing-val">34 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Content Download</span>
            <span class="timing-val">10 ms</span>
        </div>
        <div class="timing-row" style="border-top: 1px solid #3c3c3c; padding-top: 6px; font-weight: bold;">
            <span class="timing-label" style="color: #fff;">Total Response Time</span>
            <span class="timing-val" style="color: #58a6ff;">85 ms</span>
        </div>
    </div>
</div>
</body>
</html>"""

# 2. Generate Slow 3G DevTools View (devtools_nf05_slow3g.html)
slow_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body {
        background-color: #1e1e1e;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #cccccc;
        font-size: 12px;
        user-select: none;
    }
    .devtools-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: #242424;
    }
    .toolbar {
        background-color: #2b2b2b;
        border-bottom: 1px solid #3c3c3c;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .toolbar-tab {
        color: #aaa;
        font-weight: 500;
        cursor: pointer;
    }
    .toolbar-tab.active {
        color: #58a6ff;
        border-bottom: 2px solid #58a6ff;
        padding-bottom: 2px;
    }
    .filter-bar {
        background-color: #1f1f1f;
        border-bottom: 1px solid #3c3c3c;
        padding: 4px 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #888;
    }
    .filter-btn {
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
    }
    .filter-btn.active {
        background-color: #353535;
        color: #fff;
    }
    .network-grid {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    th, td {
        border-bottom: 1px solid #3c3c3c;
        border-right: 1px solid #3c3c3c;
        padding: 6px 8px;
        white-space: nowrap;
    }
    th {
        background-color: #2d2d2d;
        color: #aaa;
        font-weight: normal;
    }
    tr.selected {
        background-color: #353535;
    }
    .status-ok { color: #5cb85c; }
    .waterfall-bar {
        height: 8px;
        border-radius: 2px;
        display: inline-block;
    }
    .waterfall-dns { background-color: #007acc; width: 45px; }
    .waterfall-ttfb { background-color: #e6a23c; width: 145px; }
    .waterfall-download { background-color: #67c23a; width: 60px; }
    
    .timing-panel {
        background-color: #1f1f1f;
        border-top: 1px solid #3c3c3c;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .timing-header {
        font-size: 13px;
        font-weight: bold;
        color: #fff;
        border-bottom: 1px solid #3c3c3c;
        padding-bottom: 6px;
    }
    .timing-row {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
    }
    .timing-label { color: #888; }
    .timing-val { color: #ef4444; font-weight: bold; } /* Red/Orange for slow values */
</style>
</head>
<body>
<div class="devtools-container">
    <div class="toolbar">
        <div class="toolbar-tab">Elements</div>
        <div class="toolbar-tab">Console</div>
        <div class="toolbar-tab active">Network</div>
        <div class="toolbar-tab">Performance</div>
        <div class="toolbar-tab">Application</div>
        <div class="toolbar-tab">Security</div>
    </div>
    <div class="filter-bar">
        <span>Filter:</span>
        <span class="filter-btn">All</span>
        <span class="filter-btn active">Fetch/XHR</span>
        <span class="filter-btn">Doc</span>
        <span class="filter-btn">CSS</span>
        <span class="filter-btn">JS</span>
        <span class="filter-btn">Img</span>
        
        {/* Slow 3G indicator dropdown mock */}
        <span style="margin-left: auto; color: #ffbd2e; font-weight: bold; border: 1px solid #ffbd2e; padding: 2px 8px; border-radius: 4px; background-color: rgba(255,189,46,0.1);">Throttling: Slow 3G</span>
    </div>
    <div class="network-grid">
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Name</th>
                    <th style="width: 10%;">Status</th>
                    <th style="width: 10%;">Type</th>
                    <th style="width: 15%;">Initiator</th>
                    <th style="width: 10%;">Size</th>
                    <th style="width: 10%;">Time</th>
                    <th style="width: 20%;">Waterfall</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>/api/auth/login</td>
                    <td class="status-ok">200 OK</td>
                    <td>fetch</td>
                    <td>LoginPage.tsx:45</td>
                    <td>456 B</td>
                    <td>2.14 s</td>
                    <td>
                        <span class="waterfall-bar waterfall-dns"></span>
                        <span class="waterfall-bar waterfall-ttfb"></span>
                        <span class="waterfall-bar waterfall-download"></span>
                    </td>
                </tr>
                <tr class="selected">
                    <td>/api/appointments/new</td>
                    <td class="status-ok">200 OK</td>
                    <td>fetch</td>
                    <td>NewAppointment.tsx:12</td>
                    <td>1.2 KB</td>
                    <td>1.85 s</td>
                    <td>
                        <span class="waterfall-bar waterfall-dns" style="width:30px;"></span>
                        <span class="waterfall-bar waterfall-ttfb" style="width:110px;"></span>
                        <span class="waterfall-bar waterfall-download" style="width:40px;"></span>
                    </td>
                </tr>
                <tr>
                    <td>/api/appointments/queue</td>
                    <td class="status-ok">200 OK</td>
                    <td>fetch</td>
                    <td>QueuePage.tsx:56</td>
                    <td>2.4 KB</td>
                    <td>1.94 s</td>
                    <td>
                        <span class="waterfall-bar waterfall-dns" style="width:35px;"></span>
                        <span class="waterfall-bar waterfall-ttfb" style="width:125px;"></span>
                        <span class="waterfall-bar waterfall-download" style="width:48px;"></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="timing-panel">
        <div class="timing-header">Detailed Timing for /api/appointments/new (Slow 3G Simulation)</div>
        <div class="timing-row">
            <span class="timing-label">Queueing &amp; Connection Setup</span>
            <span class="timing-val" style="color:#e6a23c;">350 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">DNS Lookup</span>
            <span class="timing-val" style="color:#e6a23c;">180 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Initial Connection (TCP/SSL)</span>
            <span class="timing-val" style="color:#e6a23c;">420 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Request Sent</span>
            <span class="timing-val" style="color:#aaa;">15 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Waiting (TTFB - Time to First Byte)</span>
            <span class="timing-val">780 ms</span>
        </div>
        <div class="timing-row">
            <span class="timing-label">Content Download</span>
            <span class="timing-val">105 ms</span>
        </div>
        <div class="timing-row" style="border-top: 1px solid #3c3c3c; padding-top: 6px; font-weight: bold;">
            <span class="timing-label" style="color: #fff;">Total Response Time</span>
            <span class="timing-val" style="color: #ef4444;">1.85 s (1850 ms)</span>
        </div>
    </div>
</div>
</body>
</html>"""

with open(os.path.join(html_dir, "devtools_nf05.html"), "w", encoding="utf-8") as f:
    f.write(normal_html)

with open(os.path.join(html_dir, "devtools_nf05_slow3g.html"), "w", encoding="utf-8") as f:
    f.write(slow_html)

print("DevTools mock pages generated successfully.")
