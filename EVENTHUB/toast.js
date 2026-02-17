/**
 * Toast Notification Library for EVENTORY
 * Lightweight, dependency-free toast notifications
 */

// Inject toast styles into document
const toastStyles = `
    <style id="toast-styles">
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        }
        
        .toast {
            pointer-events: all;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            padding: 16px 20px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .toast.success {
            border-left: 4px solid #10B981;
        }
        
        .toast.error {
            border-left: 4px solid #EF4444;
        }
        
        .toast.info {
            border-left: 4px solid #3B82F6;
        }
        
        .toast.warning {
            border-left: 4px solid #F59E0B;
        }
        
        .toast-icon {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
        }
        
        .toast-content {
            flex-grow: 1;
        }
        
        .toast-title {
            font-weight: 600;
            font-size: 14px;
            color: #111827;
            margin-bottom: 2px;
        }
        
        .toast-message {
            font-size: 13px;
            color: #6B7280;
        }
        
        .toast-close {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            border: none;
            background: transparent;
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.2s;
        }
        
        .toast-close:hover {
            opacity: 1;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .toast.fade-out {
            animation: slideOut 0.3s ease-out forwards;
        }
        
        @keyframes slideOut {
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #6B46C1;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
`;

// Inject styles
if (!document.getElementById('toast-styles')) {
    document.head.insertAdjacentHTML('beforeend', toastStyles);
}

// Create toast container
let toastContainer = document.querySelector('.toast-container');
if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
}

const Toast = {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {object} options - Configuration options
     */
    show(message, options = {}) {
        const {
            type = 'info',    // success, error, info, warning
            title = '',
            duration = 3000,
            closable = true
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ⓘ',
            warning: '⚠'
        };

        const colors = {
            success: '#10B981',
            error: '#EF4444',
            info: '#3B82F6',
            warning: '#F59E0B'
        };

        toast.innerHTML = `
            <div class="toast-icon" style="color: ${colors[type]}; font-size: 20px; font-weight: bold;">
                ${icons[type]}
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            ${closable ? '<button class="toast-close">✕</button>' : ''}
        `;

        toastContainer.appendChild(toast);

        // Close button
        if (closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.remove(toast));
        }

        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    },

    /**
     * Remove a toast
     */
    remove(toast) {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    },

    /**
     * Convenience methods
     */
    success(message, title = '') {
        return this.show(message, { type: 'success', title });
    },

    error(message, title = '') {
        return this.show(message, { type: 'error', title });
    },

    info(message, title = '') {
        return this.show(message, { type: 'info', title });
    },

    warning(message, title = '') {
        return this.show(message, { type: 'warning', title });
    },

    /**
     * Show a loading toast
     */
    loading(message = 'Loading...') {
        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
        `;
        toastContainer.appendChild(toast);
        return toast;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
} else {
    window.Toast = Toast;
}
