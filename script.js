   
        document.addEventListener('DOMContentLoaded', function() {
            // Variables
            let currentView = 'desktop';
            let isPreviewMode = false;
            let selectedElement = null;
            let draggedElement = null;
            
            // DOM Elements
            const emailContent = document.getElementById('email-content');
            const emptyState = document.getElementById('empty-state');
            const previewModeBtn = document.getElementById('preview-mode');
            const exportHtmlBtn = document.getElementById('export-html');
            const desktopViewBtn = document.getElementById('desktop-view');
            const mobileViewBtn = document.getElementById('mobile-view');
            const settingsContent = document.getElementById('settings-content');
            const previewContainer = document.querySelector('.preview-container');
            
            // Initialize
            updateEmptyState();
            
            // Drag and Drop Setup
            document.querySelectorAll('.draggable-item').forEach(item => {
                item.addEventListener('dragstart', function(e) {
                    draggedElement = this.cloneNode(true);
                    e.dataTransfer.setData('text/plain', this.getAttribute('data-type'));
                    e.dataTransfer.effectAllowed = 'copy';
                });
            });
            
            emailContent.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            });
            
            emailContent.addEventListener('drop', function(e) {
                e.preventDefault();
                const type = e.dataTransfer.getData('text/plain');
                
                if (type === 'reorder') {
                    // Handle reordering existing elements
                    return;
                }
                
                if (type) {
                    addComponent(type);
                }
            });
            
            // View Mode Controls
            desktopViewBtn.addEventListener('click', function() {
                currentView = 'desktop';
                updatePreviewMode();
            });
            
            mobileViewBtn.addEventListener('click', function() {
                currentView = 'mobile';
                updatePreviewMode();
            });
            
            // Preview Mode Controls
            previewModeBtn.addEventListener('click', togglePreviewMode);
            
            // Export HTML
            exportHtmlBtn.addEventListener('click', exportHtml);
            
            // Component Functions
            function addComponent(type) {
                emptyState.style.display = 'none';
                
                let component;
                switch(type) {
                    case 'text':
                        component = createTextComponent();
                        break;
                    case 'button':
                        component = createButtonComponent();
                        break;
                    case 'image':
                        component = createImageComponent();
                        break;
                    case 'divider':
                        component = createDividerComponent();
                        break;
                }
                
                component.addEventListener('click', function(e) {
                    if (isPreviewMode) return;
                    
                    // Deselect previous selection
                    if (selectedElement) {
                        selectedElement.classList.remove('selected');
                    }
                    
                    // Select new element
                    selectedElement = component;
                    component.classList.add('selected');
                    
                    // Update settings panel
                    updateSettingsPanel(type, component);
                    
                    e.stopPropagation();
                });
                
                // Make component draggable for reordering
                component.setAttribute('draggable', 'true');
                component.addEventListener('dragstart', function(e) {
                    this.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', 'reorder');
                    draggedComponent = this;
                });
                
                component.addEventListener('dragend', function() {
                    this.classList.remove('dragging');
                });
                
                emailContent.appendChild(component);
                
                // Setup drag and drop for reordering
                setupReordering();
            }
            
            function createTextComponent() {
                const section = document.createElement('div');
                section.className = 'email-section mb-6 px-6 py-4';
                section.innerHTML = `
                    <div class="content-editable" contenteditable="true">
                        <p>Double-click to edit this text block. You can change the font, size, color, and more using the settings panel.</p>
                    </div>
                `;
                return section;
            }
            
            function createButtonComponent() {
                const section = document.createElement('div');
                section.className = 'email-section mb-6 px-6 py-4';
                section.innerHTML = `
                    <div class="text-center">
                        <div class="content-editable" contenteditable="true">
                            <a href="#" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium" style="text-decoration: none; color: white;">Click Here</a>
                        </div>
                    </div>
                `;
                return section;
            }
            
            function createImageComponent() {
                const section = document.createElement('div');
                section.className = 'email-section mb-6 px-6 py-4';
                section.innerHTML = `
                    <div class="text-center">
                        <div class="content-editable" contenteditable="false">
                            <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/19cd69e8-1f29-464e-a1ca-8dc96c5d1b0f.png" alt="Email image placeholder" class="mx-auto" style="max-width: 100%; height: auto;" />
                            <p class="text-xs text-gray-500 mt-2">Double-click the image to change URL</p>
                        </div>
                    </div>
                `;
                return section;
            }
            
            function createDividerComponent() {
                const section = document.createElement('div');
                section.className = 'email-section mb-6 px-6 py-4';
                section.innerHTML = `
                    <div class="content-editable" contenteditable="false">
                        <div style="height: 1px; background-color: #e2e8f0;"></div>
                    </div>
                `;
                return section;
            }
            
            function setupReordering() {
                const sections = document.querySelectorAll('.email-section');
                
                sections.forEach(section => {
                    section.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        const bounding = this.getBoundingClientRect();
                        const offset = bounding.y + bounding.height / 2;
                        
                        if (e.clientY > offset) {
                            this.style.borderBottom = '2px dashed var(--primary-color)';
                            this.style.borderTop = 'none';
                        } else {
                            this.style.borderTop = '2px dashed var(--primary-color)';
                            this.style.borderBottom = 'none';
                        }
                    });
                    
                    section.addEventListener('dragleave', function() {
                        this.style.borderTop = 'none';
                        this.style.borderBottom = 'none';
                    });
                    
                    section.addEventListener('drop', function(e) {
                        e.preventDefault();
                        this.style.borderTop = 'none';
                        this.style.borderBottom = 'none';
                        
                        if (draggedComponent) {
                            const bounding = this.getBoundingClientRect();
                            const offset = bounding.y + bounding.height / 2;
                            
                            if (e.clientY > offset) {
                                this.parentNode.insertBefore(draggedComponent, this.nextSibling);
                            } else {
                                this.parentNode.insertBefore(draggedComponent, this);
                            }
                        }
                    });
                });
            }
            
            function updateSettingsPanel(type, component) {
                let settingsHTML = '';
                const imgPreview = component.querySelector('img');
                const textContent = component.querySelector('.content-editable');
                
                switch(type) {
                    case 'text':
                        settingsHTML = `
                            <div class="space-y-4">
                                <h3 class="font-medium text-gray-900">Text Settings</h3>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Font Family</label>
                                    <select class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option>Arial</option>
                                        <option>Helvetica</option>
                                        <option>Times New Roman</option>
                                        <option>Georgia</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Font Size</label>
                                    <input type="range" min="12" max="24" value="16" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Text Color</label>
                                    <input type="color" value="#333333" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Alignment</label>
                                    <div class="mt-1 flex space-x-2">
                                        <button class="p-2 bg-gray-200 rounded">
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18" />
                                            </svg>
                                        </button>
                                        <button class="p-2 bg-gray-200 rounded">
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h18M3 18h18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'button':
                        settingsHTML = `
                            <div class="space-y-4">
                                <h3 class="font-medium text-gray-900">Button Settings</h3>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Button Text</label>
                                    <input type="text" value="Click Here" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Button Color</label>
                                    <input type="color" value="#4f46e5" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Text Color</label>
                                    <input type="color" value="#ffffff" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Link URL</label>
                                    <input type="text" placeholder="https://example.com" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                            </div>
                        `;
                        break;
                    case 'image':
                        settingsHTML = `
                            <div class="space-y-4">
                                <h3 class="font-medium text-gray-900">Image Settings</h3>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Image URL</label>
                                    <input type="text" value="https://placehold.co/600x300" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Alternative Text</label>
                                    <input type="text" value="Professional business marketing image placeholder" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Maximum Width</label>
                                    <input type="range" min="100" max="1000" value="600" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Alignment</label>
                                    <div class="mt-1 flex space-x-2">
                                        <button class="p-2 bg-gray-200 rounded">Left</button>
                                        <button class="p-2 bg-gray-200 rounded">Center</button>
                                        <button class="p-2 bg-gray-200 rounded">Right</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'divider':
                        settingsHTML = `
                            <div class="space-y-4">
                                <h3 class="font-medium text-gray-900">Divider Settings</h3>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Color</label>
                                    <input type="color" value="#e2e8f0" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Thickness</label>
                                    <input type="range" min="1" max="10" value="1" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Padding Top</label>
                                    <input type="range" min="0" max="40" value="16" class="mt-1 block w-full">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Padding Bottom</label>
                                    <input type="range" min="0" max="40" value="16" class="mt-1 block w-full">
                                </div>
                            </div>
                        `;
                        break;
                }
                
                settingsContent.innerHTML = settingsHTML;
                
                if (selectedElement) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.className = 'mt-4 px-3 py-1 bg-red-500 text-white rounded';
                    deleteBtn.addEventListener('click', function() {
                        selectedElement.remove();
                        selectedElement = null;
                        settingsContent.innerHTML = '<p>Select a component to edit its properties.</p>';
                        updateEmptyState();
                    });
                    settingsContent.appendChild(deleteBtn);
                }
                
                // Add event listeners for settings changes
                const fontFamilySelect = settingsContent.querySelector('select');
                const fontSizeInput = settingsContent.querySelector('input[type="range"]');
                const textColorInput = settingsContent.querySelector('input[type="color"]');
                
                if (fontFamilySelect && textContent) {
                    fontFamilySelect.addEventListener('change', function() {
                        textContent.style.fontFamily = this.value;
                    });
                }
                
                if (fontSizeInput && textContent) {
                    fontSizeInput.addEventListener('input', function() {
                        textContent.style.fontSize = `${this.value}px`;
                    });
                }
                
                if (textColorInput && textContent) {
                    textColorInput.addEventListener('input', function() {
                        textContent.style.color = this.value;
                    });
                }
            }
            
            function updatePreviewMode() {
                if (currentView === 'desktop') {
                    previewContainer.classList.remove('mobile-preview');
                    desktopViewBtn.classList.add('bg-gray-100');
                    mobileViewBtn.classList.remove('bg-gray-100');
                } else {
                    previewContainer.classList.add('mobile-preview');
                    mobileViewBtn.classList.add('bg-gray-100');
                    desktopViewBtn.classList.remove('bg-gray-100');
                }
            }
            
            function togglePreviewMode() {
                isPreviewMode = !isPreviewMode;
                
                if (isPreviewMode) {
                    // Enter preview mode
                    previewModeBtn.textContent = 'Edit';
                    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                        el.setAttribute('contenteditable', 'false');
                    });
                    
                    // Deselect any selected element
                    if (selectedElement) {
                        selectedElement.classList.remove('selected');
                        selectedElement = null;
                    }
                    
                    settingsContent.innerHTML = '<p>Preview mode is active. Click "Edit" to make changes.</p>';
                } else {
                    // Exit preview mode
                    previewModeBtn.textContent = 'Preview';
                    document.querySelectorAll('.content-editable').forEach(el => {
                        el.setAttribute('contenteditable', 'true');
                    });
                }
            }
            
            function exportHtml() {
                // Create email-compatible HTML
                const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Marketing Email</title>
    <style type="text/css">
        /* Client-specific styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Reset styles */
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        /* iOS blue links */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        
        /* Main styles */
        body {
            font-family: Arial, sans-serif;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .content-block {
            padding: 20px;
        }
        
        .text-center {
            text-align: center;
        }
        
        .button {
            background-color: #4f46e5;
            color: #ffffff;
            display: inline-block;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .divider {
            border-top: 1px solid #e2e8f0;
            margin: 20px 0;
        }
        
        @media only screen and (max-width: 600px) {
            .content-block {
                padding: 15px;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0;">
${emailContent.innerHTML}
</body>
</html>
                `;
                
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'marketing-email.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            function updateEmptyState() {
                if (emailContent.children.length > 0) {
                    emptyState.style.display = 'none';
                } else {
                    emptyState.style.display = 'block';
                }
            }
            
            // Click anywhere to deselect
            document.addEventListener('click', function(e) {
                if (!isPreviewMode && selectedElement && !selectedElement.contains(e.target)) {
                    selectedElement.classList.remove('selected');
                    selectedElement = null;
                    settingsContent.innerHTML = '<p>Select a component to edit its properties.</p>';
                }
            });
        });
    