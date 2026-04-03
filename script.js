const app = {
    employees: [],
    currentUser: null,
    currentView: 'home',
    isDark: false,

    init() {
        // Load theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Load or mock employees
        const savedEmp = localStorage.getItem('employees');
        if (savedEmp) {
            this.employees = JSON.parse(savedEmp);
        } else {
            // Mock data for demo
            this.employees = [
                {
                    id: 'emp_' + Date.now(),
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    phone: '+1 234 567 8900',
                    address: '123 Tech Lane, Silicon Valley, CA',
                    dob: '1995-04-12',
                    qualification: 'Masters',
                    skills: 'JavaScript, React, Node.js',
                    experience: '3 years as Frontend Developer at TechCorp.',
                    resume: 'jane_smith_resume.pdf',
                    date: new Date().toISOString()
                },
                {
                    id: 'emp_' + (Date.now() - 86400000), // yesterday
                    name: 'John Doe',
                    email: 'j.doe@example.com',
                    phone: '+1 987 654 3210',
                    address: '456 Innovation Blvd, New York, NY',
                    dob: '1990-11-23',
                    qualification: 'Bachelors',
                    skills: 'Python, Django, PostgreSQL',
                    experience: '5 years Backend Engineering.',
                    resume: 'john_doe_cv.pdf',
                    date: new Date(Date.now() - 86400000).toISOString()
                }
            ];
            this.saveData();
        }

        // Handle file input name display (Removed as resume input no longer exists)

        // Setup Splash Screen removal
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
                // Optional: remove from DOM entirely after transition
                setTimeout(() => splash.remove(), 800);
            }
        }, 2000);

        this.updateNav();
    },

    setTheme(theme) {
        this.isDark = theme === 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = document.querySelector('#theme-toggle i');
        if (this.isDark) {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    },

    toggleTheme() {
        this.setTheme(this.isDark ? 'light' : 'dark');
    },

    navigate(viewId) {
        if (this.currentView === viewId) return;

        // Route Guards
        if (viewId === 'admin-dashboard' && (!this.currentUser || this.currentUser.role !== 'admin')) {
            viewId = 'admin-login';
        }
        if (viewId === 'employee-dashboard' && (!this.currentUser || this.currentUser.role !== 'employee')) {
            viewId = 'employee-login';
        }

        const loading = document.getElementById('loading');
        loading.classList.remove('hidden');

        // Reset forms and states
        if (viewId === 'employee-register') {
            document.getElementById('employee-register-form').reset();
            document.getElementById('employee-register-form').classList.remove('hidden');
            document.getElementById('employee-register-success').classList.add('hidden');
        }
        if (viewId === 'employee-login') {
            document.getElementById('employee-login-form').reset();
            document.getElementById('emp-login-error').classList.add('hidden');
        }
        if (viewId === 'admin-login') {
            document.getElementById('login-form').reset();
            document.getElementById('login-error').classList.add('hidden');
        }
        if (viewId === 'admin-dashboard') {
            this.renderAdminDashboard();
        }
        if (viewId === 'employee-dashboard') {
            this.renderEmployeeDashboard();
        }

        setTimeout(() => {
            // Hide current
            const currentEl = document.getElementById(`view-${this.currentView}`);
            if (currentEl) {
                currentEl.classList.remove('active');
                currentEl.classList.add('exiting');
                setTimeout(() => currentEl.classList.remove('exiting'), 300);
            }

            // Show new
            const newEl = document.getElementById(`view-${viewId}`);
            if (newEl) {
                newEl.classList.add('active');
            }
            
            this.currentView = viewId;
            loading.classList.add('hidden');
            window.scrollTo(0,0);
        }, 400); // 400ms simulate loading/transition
    },

    updateNav() {
        const adminLinks = document.querySelectorAll('.admin-link');
        const dbLinks = document.querySelectorAll('.db-link');
        const empLinks = document.querySelectorAll('.emp-link');
        const authLinks = document.querySelectorAll('.auth-link');
        
        // Hide all conditional links initially
        adminLinks.forEach(l => l.classList.add('hidden'));
        dbLinks.forEach(l => l.classList.add('hidden'));
        empLinks.forEach(l => l.classList.add('hidden'));
        authLinks.forEach(l => l.classList.add('hidden'));

        if (!this.currentUser) {
            // Not logged in
            adminLinks.forEach(l => l.classList.remove('hidden'));
            // Keep the 'Employee Login' and 'Register' buttons visible by default via standard CSS, no need to toggle them here unless they share a class
        } else if (this.currentUser.role === 'admin') {
            // Admin is logged in
            dbLinks.forEach(l => l.classList.remove('hidden'));
            authLinks.forEach(l => l.classList.remove('hidden'));
        } else if (this.currentUser.role === 'employee') {
            // Employee is logged in
            empLinks.forEach(l => l.classList.remove('hidden'));
            authLinks.forEach(l => l.classList.remove('hidden'));
        }
    },

    registerAsEmployee() {
        const btn = document.querySelector('#employee-register-form button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;

        setTimeout(() => {
            const emp = {
                id: 'emp_' + Date.now(),
                name: document.getElementById('emp-reg-name').value,
                email: document.getElementById('emp-reg-email').value,
                department: document.getElementById('emp-reg-department').value,
                class: document.getElementById('emp-reg-class').value,
                subject: document.getElementById('emp-reg-subject').value,
                salary: document.getElementById('emp-reg-salary').value,
                password: document.getElementById('emp-reg-password').value,
                date: new Date().toISOString()
            };

            this.employees.unshift(emp); // Add to beginning
            this.saveData();

            btn.innerHTML = originalText;
            btn.disabled = false;

            document.getElementById('employee-register-form').classList.add('hidden');
            document.getElementById('employee-register-success').classList.remove('hidden');
        }, 800);
    },

    loginAsEmployee() {
        const email = document.getElementById('emp-login-email').value;
        const pass = document.getElementById('emp-login-password').value;
        const error = document.getElementById('emp-login-error');
        const btn = document.querySelector('#employee-login-form button[type="submit"]');

        error.classList.add('hidden');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;

        setTimeout(() => {
            const employee = this.employees.find(e => e.email === email && e.password === pass);
            if (employee) {
                this.currentUser = { ...employee, role: 'employee' };
                this.updateNav();
                this.navigate('employee-dashboard');
            } else {
                error.classList.remove('hidden');
                document.querySelector('#view-employee-login .login-container').classList.add('shake');
                setTimeout(() => {
                    document.querySelector('#view-employee-login .login-container').classList.remove('shake');
                }, 500);
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 600);
    },

    login() {
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;
        const error = document.getElementById('login-error');
        const btn = document.querySelector('#login-form button[type="submit"]');

        error.classList.add('hidden');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;

        setTimeout(() => {
            if (user === 'admin' && pass === 'password') {
                this.currentUser = { username: 'admin', role: 'admin' };
                this.updateNav();
                this.navigate('admin-dashboard');
            } else {
                error.classList.remove('hidden');
                document.querySelector('#view-admin-login .login-container').classList.add('shake');
                setTimeout(() => {
                    document.querySelector('#view-admin-login .login-container').classList.remove('shake');
                }, 500);
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 600);
    },

    logout() {
        this.currentUser = null;
        this.updateNav();
        this.navigate('home');
    },

    saveData() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
    },

    renderEmployeeDashboard() {
        if (!this.currentUser || this.currentUser.role !== 'employee') return;

        // Pre-fill the form with current user's data
        document.getElementById('emp-prof-name').value = this.currentUser.name || '';
        document.getElementById('emp-prof-email').value = this.currentUser.email || '';
        document.getElementById('emp-prof-department').value = this.currentUser.department || '';
        document.getElementById('emp-prof-class').value = this.currentUser.class || '';
        document.getElementById('emp-prof-subject').value = this.currentUser.subject || '';
        document.getElementById('emp-prof-salary').value = this.currentUser.salary || '';
    },

    updateEmployeeProfile() {
        if (!this.currentUser || this.currentUser.role !== 'employee') return;

        const btn = document.querySelector('#employee-profile-form button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;

        setTimeout(() => {
            // Update the global state
            const targetIndex = this.employees.findIndex(e => e.id === this.currentUser.id);
            if (targetIndex !== -1) {
                this.employees[targetIndex].name = document.getElementById('emp-prof-name').value;
                this.employees[targetIndex].department = document.getElementById('emp-prof-department').value;
                this.employees[targetIndex].class = document.getElementById('emp-prof-class').value;
                this.employees[targetIndex].subject = document.getElementById('emp-prof-subject').value;
                
                // Update current user
                this.currentUser = { ...this.employees[targetIndex], role: 'employee' };
                this.saveData();

                const msg = document.getElementById('emp-prof-msg');
                msg.classList.remove('hidden');
                setTimeout(() => msg.classList.add('hidden'), 3000);
            }

            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 500);
    },

    renderAdminDashboard(filteredEmployees = null) {
        const targetList = filteredEmployees || this.employees;
        const tbody = document.getElementById('employee-table-body');
        const emptyMsg = document.getElementById('empty-table-msg');
        
        // Update stats
        const today = new Date().toISOString().split('T')[0];
        const newToday = this.employees.filter(e => e.date.startsWith(today)).length;
        
        document.getElementById('stat-total').innerText = this.employees.length;
        document.getElementById('stat-new').innerText = newToday;

        tbody.innerHTML = '';
        
        if (targetList.length === 0) {
            emptyMsg.classList.remove('hidden');
            return;
        } else {
            emptyMsg.classList.add('hidden');
        }

        targetList.forEach((emp, index) => {
            const tr = document.createElement('tr');
            tr.style.animationDelay = `${index * 0.05}s`;
            tr.classList.add('animate-fade-in');
            
            const initials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            tr.innerHTML = `
                <td>
                    <div class="avatar-cell">
                        <div class="avatar">${initials}</div>
                        <div>
                            <div style="font-weight: 500">${emp.name}</div>
                            <div class="contact-email">${new Date(emp.date).toLocaleDateString()}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-cell">
                        <span><i class="fa-solid fa-envelope" style="color:var(--text-muted);width:16px"></i> ${emp.email}</span>
                        <span class="contact-email"><i class="fa-solid fa-building" style="width:16px"></i> ${emp.department}</span>
                    </div>
                </td>
                <td>
                    <span class="badge">${emp.class} - ${emp.subject}</span>
                </td>
                <td>
                    <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        $${emp.salary}
                    </div>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" title="View Details" onclick="app.viewEmployee('${emp.id}')"><i class="fa-solid fa-eye"></i></button>
                        <button class="action-btn del" title="Delete" onclick="app.deleteEmployee('${emp.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    filterTable() {
        const query = document.getElementById('search-input').value.toLowerCase();
        const qual = document.getElementById('filter-qualification').value;

        const filtered = this.employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(query) || 
                                  emp.email.toLowerCase().includes(query) ||
                                  (emp.department && emp.department.toLowerCase().includes(query));
            // We ignore qual filter for now since it was removed from schema or update if needed
            return matchesSearch;
        });

        this.renderAdminDashboard(filtered);
    },

    viewEmployee(id) {
        const emp = this.employees.find(e => e.id === id);
        if (!emp) return;

        const modalBody = document.getElementById('modal-body');
        document.getElementById('modal-title').innerText = emp.name;
        
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-label">Email Address</div>
                <div class="detail-value">${emp.email}</div>
                
                <div class="detail-label">Department</div>
                <div class="detail-value">${emp.department}</div>
                
                <div class="detail-label">Class</div>
                <div class="detail-value">${emp.class}</div>
                
                <div class="detail-label">Subject</div>
                <div class="detail-value">${emp.subject}</div>
                
                <div class="detail-label">Salary</div>
                <div class="detail-value">$${emp.salary}</div>
                
                <div class="detail-label">Registration Date</div>
                <div class="detail-value">${new Date(emp.date).toLocaleString()}</div>
            </div>
        `;
        
        document.getElementById('employee-modal').classList.remove('hidden');
    },

    deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee record?')) {
            this.employees = this.employees.filter(e => e.id !== id);
            this.saveData();
            this.filterTable(); // Re-render with current filters
        }
    },

    closeModal() {
        document.getElementById('employee-modal').classList.add('hidden');
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
