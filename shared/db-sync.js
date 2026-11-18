/* Transparent SQLite Database <-> Browser Sync Layer for SSA Hotel PMS */
(function () {
    'use strict';
    if (typeof window === 'undefined' || !window.localStorage || window.location.protocol === 'file:') return;

    const SYNC_KEYS = new Set([
        'KhachHang',
        'NhanVien',
        'LoaiPhong',
        'Phong',
        'PhieuDatPhong',
        'SuCoKyThuat',
        'SSA_Workflows_v1',
        'SSA_Reviews_v1'
    ]);

    const rawSetItem = Storage.prototype.setItem.bind(window.localStorage);
    const rawRemoveItem = Storage.prototype.removeItem.bind(window.localStorage);
    let currentVersion = 0;
    let isHydrating = false;
    let pendingUpdates = {};
    let flushScheduled = false;

    function applyServerItems(data, dispatchEvents) {
        if (!data || !data.items) return;
        isHydrating = true;
        let changedKey = null;
        try {
            for (const [k, v] of Object.entries(data.items)) {
                if (!SYNC_KEYS.has(k)) continue;
                const oldVal = window.localStorage.getItem(k);
                if (oldVal !== v) {
                    rawSetItem(k, v);
                    changedKey = k;
                }
            }
            if (typeof data.version === 'number') {
                currentVersion = data.version;
            }
        } finally {
            isHydrating = false;
        }
        if (dispatchEvents && changedKey) {
            window.dispatchEvent(new StorageEvent('storage', { key: changedKey }));
        }
    }

    // 1. Initial synchronous hydration from SQLite database before app scripts run
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/storage', false);
        xhr.send(null);
        if (xhr.status === 200) {
            applyServerItems(JSON.parse(xhr.responseText), false);
        }
    } catch {
        // Fallback to local browser storage if offline
    }

    function flushToServer() {
        flushScheduled = false;
        const payload = pendingUpdates;
        pendingUpdates = {};
        if (!Object.keys(payload).length) return;
        fetch('/api/storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: payload })
        })
            .then(r => (r.ok ? r.json() : null))
            .then(res => {
                if (res && typeof res.version === 'number') {
                    currentVersion = Math.max(currentVersion, res.version);
                }
            })
            .catch(() => {});
    }

    function scheduleSave(key, value) {
        if (isHydrating || !SYNC_KEYS.has(key)) return;
        pendingUpdates[key] = value;
        if (!flushScheduled) {
            flushScheduled = true;
            queueMicrotask(flushToServer);
        }
    }

    // 2. Intercept localStorage mutations for shared database keys
    Storage.prototype.setItem = function (key, value) {
        const strVal = String(value);
        rawSetItem(key, strVal);
        if (this === window.localStorage) {
            scheduleSave(key, strVal);
        }
    };

    Storage.prototype.removeItem = function (key) {
        rawRemoveItem(key);
        if (this === window.localStorage) {
            scheduleSave(key, null);
        }
    };

    // 3. Background polling for multi-device / multi-browser real-time sync
    function pollRemoteChanges() {
        if (flushScheduled || document.hidden) return;
        fetch('/api/version', { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : null))
            .then(info => {
                if (info && typeof info.version === 'number' && info.version > currentVersion) {
                    return fetch('/api/storage', { cache: 'no-store' })
                        .then(r => (r.ok ? r.json() : null))
                        .then(data => applyServerItems(data, true));
                }
            })
            .catch(() => {});
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            setInterval(pollRemoteChanges, 2500);
        }, 1800);
    });
})();
