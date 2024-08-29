document.addEventListener('DOMContentLoaded', function () {
    const addPasswordLink = document.getElementById('add-password-link');
    const historyLink = document.getElementById('history-link');
    const preferencesLink = document.getElementById('preferences-link');
    const profilesLink = document.getElementById('profiles-link');
    
    const addPasswordSection = document.getElementById('add-password');
    const historySection = document.getElementById('history');
    const preferencesSection = document.getElementById('preferences');
    const profilesSection = document.getElementById('profiles');
    
    const passwordForm = document.getElementById('password-form');
    const passwordTableBody = document.getElementById('password-list');
    const profileList = document.getElementById('profile-list');
    const profileIndicator = document.getElementById('current-profile');
    
    const encryptionKey = 'your-secret-key'; // Cambia esto por una clave secreta más segura

    addPasswordLink.addEventListener('click', function (event) {
        event.preventDefault();
        showSection(addPasswordSection);
    });
    
    historyLink.addEventListener('click', function (event) {
        event.preventDefault();
        showSection(historySection);
        displayPasswordHistory();
    });
    
    preferencesLink.addEventListener('click', function (event) {
        event.preventDefault();
        showSection(preferencesSection);
    });
    
    profilesLink.addEventListener('click', function (event) {
        event.preventDefault();
        showSection(profilesSection);
        displayProfiles();
    });
    
    function showSection(section) {
        document.querySelectorAll('.section').forEach(function (sec) {
            sec.style.display = 'none'; // Ocultar todas las secciones
        });
        section.style.display = 'block'; // Mostrar la sección seleccionada
    }
    
    function encryptPassword(password) {
        return CryptoJS.AES.encrypt(password, encryptionKey).toString();
    }
    
    function decryptPassword(encryptedPassword) {
        let bytes = CryptoJS.AES.decrypt(encryptedPassword, encryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    
    function savePassword(site, category, password) {
        let encryptedPassword = encryptPassword(password);
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        let currentProfileName = localStorage.getItem('currentProfile');
        let currentProfile = profiles.find(profile => profile.name === currentProfileName);
        
        if (currentProfile) {
            let passwords = currentProfile.passwords || [];
            passwords.push({ site, category, password: encryptedPassword });
            currentProfile.passwords = passwords;
            saveProfiles(profiles);
        }
    }
    
    function displayPasswordHistory() {
        let currentProfileName = localStorage.getItem('currentProfile');
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        let currentProfile = profiles.find(profile => profile.name === currentProfileName);
        let passwords = currentProfile ? currentProfile.passwords || [] : [];
        passwordTableBody.innerHTML = '';
        
        passwords.forEach((entry, index) => {
            let row = document.createElement('tr');
            
            let siteCell = document.createElement('td');
            siteCell.textContent = entry.site;
            row.appendChild(siteCell);
            
            let categoryCell = document.createElement('td');
            categoryCell.textContent = entry.category;
            row.appendChild(categoryCell);
            
            let passwordCell = document.createElement('td');
            passwordCell.textContent = decryptPassword(entry.password);
            row.appendChild(passwordCell);
            
            let actionCell = document.createElement('td');
            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
            deleteButton.addEventListener('click', function () {
                deletePassword(index);
            });
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            
            passwordTableBody.appendChild(row);
        });
    }
    
    function deletePassword(index) {
        let currentProfileName = localStorage.getItem('currentProfile');
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        let currentProfile = profiles.find(profile => profile.name === currentProfileName);
        
        if (currentProfile) {
            let passwords = currentProfile.passwords || [];
            passwords.splice(index, 1);
            currentProfile.passwords = passwords;
            saveProfiles(profiles);
            displayPasswordHistory();
        }
    }

    function generatePassword(length = 12) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:',.<>?/";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    function getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/\d/.test(password)) strength += 20;
        if (/[^a-zA-Z\d]/.test(password)) strength += 20;
        return strength;
    }

    const generatePasswordButton = document.getElementById('generate-password');
    const generatedPasswordField = document.getElementById('generated-password');
    const passwordInput = document.getElementById('password');
    const passwordStrengthBar = document.getElementById('password-strength-bar');

    generatePasswordButton.addEventListener('click', function () {
        const newPassword = generatePassword();
        generatedPasswordField.value = newPassword;
        passwordInput.value = newPassword;
        updatePasswordStrength(newPassword);
    });

    passwordInput.addEventListener('input', function () {
        updatePasswordStrength(passwordInput.value);
    });

    function updatePasswordStrength(password) {
        const strength = getPasswordStrength(password);
        passwordStrengthBar.style.width = `${strength}%`;
        passwordStrengthBar.setAttribute('aria-valuenow', strength);
        if (strength < 40) {
            passwordStrengthBar.classList.add('bg-danger');
            passwordStrengthBar.classList.remove('bg-warning', 'bg-success');
        } else if (strength < 80) {
            passwordStrengthBar.classList.add('bg-warning');
            passwordStrengthBar.classList.remove('bg-danger', 'bg-success');
        } else {
            passwordStrengthBar.classList.add('bg-success');
            passwordStrengthBar.classList.remove('bg-danger', 'bg-warning');
        }
    }

    passwordForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const site = document.getElementById('site').value;
        const category = document.getElementById('category').value;
        const password = document.getElementById('password').value;
        
        savePassword(site, category, password);
        alert('Contraseña guardada correctamente');
        passwordForm.reset();
        showSection(addPasswordSection); // Volver a la sección de agregar contraseña después de guardar
    });

    function saveProfiles(profiles) {
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }

    function displayProfiles() {
        profileList.innerHTML = '';
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles.forEach(profile => {
            let listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = profile.name;
            listItem.addEventListener('click', function () {
                localStorage.setItem('currentProfile', profile.name);
                updateProfileIndicator();
                showSection(addPasswordSection);
                displayPasswordHistory();
            });
            profileList.appendChild(listItem);
        });
    }

    const createProfileButton = document.getElementById('create-profile');
    const profileNameInput = document.getElementById('profile-name');
    
    createProfileButton.addEventListener('click', function () {
        const profileName = profileNameInput.value.trim();
        if (profileName) {
            let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
            if (!profiles.find(profile => profile.name === profileName)) {
                profiles.push({ name: profileName, passwords: [] });
                saveProfiles(profiles);
                profileNameInput.value = '';
                displayProfiles();
            } else {
                alert('El perfil ya existe.');
            }
        }
    });

    function updateProfileIndicator() {
        let currentProfileName = localStorage.getItem('currentProfile');
        profileIndicator.textContent = currentProfileName ? `Perfil Actual: ${currentProfileName}` : 'No hay perfil seleccionado';
    }

    // Inicializar el perfil actual
    let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    if (profiles.length > 0) {
        localStorage.setItem('currentProfile', profiles[0].name);
    }
    updateProfileIndicator();
    showSection(addPasswordSection);
});
