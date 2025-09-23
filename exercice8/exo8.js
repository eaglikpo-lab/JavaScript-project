class FormValidator {
    constructor(idForm) {
        this.form = document.getElementById(idForm);
        if (!this.form) {
            console.error(`Le formulaire avec l'id "${idForm}" est introuvable !`);
            return;
        }


        this.inputs = this.form.querySelectorAll('input[required]');
        this.rules = {}; // règles ajoutées par addRule

        // Validation en temps réel
        this.inputs.forEach(input => {
            input.addEventListener("input", () => {
                this.validateField(input.name);
                //this.updateFormStatus();   
            });
        });

        // Champ mot de passe pour indicateur de force
        this.passwordField = this.form.querySelector('[name="password"]');
       // console.log(this.passwordField);
        if (this.passwordField) {
            this.passwordField.addEventListener("input", () => {
                this.updatePasswordStrength();
            });
        }


        // Validation à la soumission
       /* this.form.addEventListener("submit", (e) => {
            let isFormValid = true;
            for (let fieldName in this.rules) {
                if (!this.validateField(fieldName)) {
                    isFormValid = false;
                }
            }
            this.updateFormStatus();

            if (!isFormValid) {
                e.preventDefault();
                console.log("Formulaire invalide !");
            }
        });*/


        // Validation à la soumission
        this.form.addEventListener("submit", (e) => {
            e.preventDefault(); // on empêche le rechargement

            let isFormValid = true;
            const formData = {};

            for (let fieldName in this.rules) {
                const isValid = this.validateField(fieldName);
                if (!isValid) {
                    isFormValid = false;
                } else {
                    // stocker la valeur valide
                    const field = this.form.querySelector(`[name="${fieldName}"]`);
                    const value = (field.type === "checkbox") ? field.checked : field.value.trim();
                    formData[fieldName] = value;
                }
            }

            /*if (isFormValid) {
                console.log("✅ Formulaire localement valide :", formData);

                // message global de succès
                const statusDiv = document.getElementById("form-status");
                if (statusDiv) {
                    statusDiv.textContent = "Formulaire envoyé avec succès ✔️";
                    statusDiv.style.color = "green";
                }

                // ici tu peux envoyer les données vers ton backend par fetch()
                // fetch("/api/form", { method: "POST", body: JSON.stringify(formData) })

            } else {
                console.log("Formulaire invalide.");

                const statusDiv = document.getElementById("form-status");
                if (statusDiv) {
                    statusDiv.textContent = "Vous devez obligatoirement tout remplir/cocher.";
                    statusDiv.style.color = "red";
                }
            }*/
            
            const statusDiv = document.getElementById("form-status");
            
            if (!isFormValid) {
                if (statusDiv) {
                    statusDiv.textContent = "Veuillez corriger les erreurs avant de soumettre.";
                    statusDiv.style.color = "red";
                }
                console.log("Formulaire invalide.");
                return;
            }

            // ✅ Formulaire localement valide
            if (statusDiv) {
                statusDiv.textContent = "Envoi en cours…";
                statusDiv.style.color = "blue";
            }

            console.log("Formulaire localement valide :", formData);

            // Validation côté serveur simulée
            setTimeout(() => {
                // Simulation succès ou erreur serveur
                const serverAccepts = true; // ou false pour tester l'erreur

                if (serverAccepts) {
                    if (statusDiv) {
                        statusDiv.textContent = "Formulaire accepté par le serveur ✔️";
                        statusDiv.style.color = "green";
                    }
                    console.log("✅ Données acceptées par le serveur :", formData);
                } else {
                    if (statusDiv) {
                        statusDiv.textContent = "Erreur serveur : données non acceptées.";
                        statusDiv.style.color = "red";
                    }
                    console.log("❌ Données rejetées par le serveur :", formData);
                }
            }, 2000); // délai simulé de 2 secondes
        });

    }

    addRule(fieldName, validator, message, options = {}) {
        if (!this.rules[fieldName]) this.rules[fieldName] = [];
        this.rules[fieldName].push({ validator, message, ...options });
    }

    // Méthodes de validation
    required(value) {
        return value.trim() !== '';
    }

    checkbox(value) {
        return value === true;  // doit être coché
    }


    email(value) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(value);
    }

    phone(value) {
       // const re = /^(\+229|0)[1-9](\d{2}){4}$/; // format français
        const re = /^(?:\+229|01)(?:\s?\d{2}){4}$/; // format Bénin

        return re.test(value);
    }

    password(value) {
        const re = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return re.test(value);
    }

    minLength(value, min) {
        return value.trim().length >= min;
    }

    maxLength(value, max) {
        return value.trim().length <= max;
    }

    matches(value, otherValue) {
        return value === otherValue;
    }

    // validateur de l'age
    minAge(value, age) {
        if (!value) return false;
        const birthDate = new Date(value);
        const today = new Date();
        const diff = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // vérifier si anniversaire déjà passé cette année
        let ageCalculated = diff;
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            ageCalculated--;
        }
        console.log(`Âge calculé: ${ageCalculated}, requis: ${age}`);
        return ageCalculated >= age;
    }

    // Validation du type de fichier
    fileType(file, allowedTypes) {
        if (!file) return false;
        return allowedTypes.includes(file.type); // ex: "image/png"
    }

    // Validation de la taille du fichier
    fileSize(file, maxSizeMB) {
        if (!file) return false;
        const sizeMB = file.size / (1024 * 1024);
        return sizeMB <= maxSizeMB;
    }



    // Validation d’un champ
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field || !this.rules[fieldName]) return true;
        console.log(field);

        let value;
        console.log(value)
        if (field.type === "checkbox") {
            value = field.checked;
            console.log(value);
        } else if (field.type === "file") {
            value = field.files[0]; // premier fichier
            //console.log(value);
        } else {
            value = field.value.trim();
        }
        //const value = (field.type === "checkbox") ? field.checked : field.value.trim();

        //const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        for (let rule of this.rules[fieldName]) {

            if (typeof rule.validator === "function") {
            // règle personnalisée
            isValid = rule.validator(value, rule.options || {});
            }else if(rule.validator === "matches") {
                const otherField = this.form.querySelector(`[name="${rule.field}"]`);
                const otherValue = otherField ? otherField.value.trim() : "";
                isValid = this.matches(value, otherValue);
            } else {
                console.log(value, rule);
                isValid = this[rule.validator](value, rule.min || rule.max || rule.age ||rule.types);
                console.log(`Validation ${rule.validator} pour ${fieldName}: ${isValid}`);
            }

            if (!isValid) {
                errorMessage = rule.message;
                break; // stop à la première erreur
            }
        }


        // Cherche le bon div d'erreur
        let errorDiv;
        if (field.type === "checkbox") {
            // pour checkbox -> c’est après le label
            errorDiv = field.parentElement.querySelector(".error-message");
        } else {
            // pour input classique -> juste après l'input
            errorDiv = field.nextElementSibling;
        }


        //const errorDiv = field.nextElementSibling; // le div juste après l'input
        if (!isValid) {
            field.classList.remove("valid", "pending");
            field.classList.add("invalid");
            if (errorDiv) errorDiv.textContent = errorMessage; // affiche le message
        } else {
            field.classList.remove("invalid", "pending");
            field.classList.add("valid");
            if (errorDiv) errorDiv.textContent = ""; // vide le message
        }

         return isValid;
    }

    updatePasswordStrength() {
        const passwordField = this.form.querySelector('[name="password"]');
        const strengthDiv = document.getElementById("password-strength");
        if (!passwordField || !strengthDiv) return;

        const value = passwordField.value;
        let strength = 0;

        if (value.length >= 8) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/\d/.test(value)) strength++;
        //if (/[^A-Za-z\d]/.test(value)) strength++; // caractère spécial optionnel

        let text = "";
        let color = "";
        switch(strength) {
            case 0: case 1:
                text = "Mot de passe faible";
                color = "red";
                break;
            case 2:
                text = "Mot de passe moyen";
                color = "orange";
                break;
            case 3: case 4:
                text = "Mot de passe fort";
                color = "green";
                break;
        }

        strengthDiv.textContent = text;
        strengthDiv.style.color = color;
    }

    setupEmailAutocomplete(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    // conteneur pour afficher les suggestions
    const suggestionBox = document.createElement("div");
    suggestionBox.classList.add("suggestion-box");
    field.parentElement.appendChild(suggestionBox);

    const domains = ["gmail.com", "yahoo.fr", "outlook.com", "hotmail.com"];

    field.addEventListener("input", () => {
        const value = field.value;
        suggestionBox.innerHTML = "";

        // si pas encore de "@", on propose
        const atIndex = value.indexOf("@");
        if (atIndex > -1) {
            const enteredDomain = value.slice(atIndex + 1);
            const base = value.slice(0, atIndex + 1);

            const filtered = domains.filter(d => d.startsWith(enteredDomain));
            filtered.forEach(domain => {
                const option = document.createElement("div");
                option.classList.add("suggestion-item");
                option.textContent = base + domain;

                option.addEventListener("click", () => {
                    field.value = option.textContent;
                    suggestionBox.innerHTML = "";
                    this.validateField(fieldName); // relancer validation
                });

                suggestionBox.appendChild(option);
            });
        }
    });

    // clic en dehors -> ferme les suggestions
    document.addEventListener("click", (e) => {
        if (!field.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.innerHTML = "";
        }
    });
}


}

// Exemple d’utilisation
const validator = new FormValidator("formulaire");

// username
validator.addRule("username", "required", "Nom obligatoire");
validator.addRule("username", "minLength", "Minimum 2 caractères", { min: 2 });
validator.addRule("username", "maxLength", "Maximum 50 caractères", { max: 50 });

// Validation personnalisée : nom sans chiffres
validator.addRule("username", (value) => {
    return /^[A-Za-z\s]+$/.test(value);
}, "Le nom ne peut contenir que des lettres et espaces");

// email
validator.addRule("email", "required", "Email obligatoire");
validator.addRule("email", "email", "Email invalide");
validator.setupEmailAutocomplete("email");



// Téléphone
validator.addRule("Numero de téléphone", "required", "Numéro obligatoire");
validator.addRule("Numero de téléphone", "phone", "Numéro invalide");


// password et confirmation
validator.addRule("password", "required", "Mot de passe obligatoire");
validator.addRule("password", "password", "Faible (8 caractères minimum, 1 majuscule, 1 chiffre)");
validator.addRule("confirm", "required", "Confirmez le mot de passe");
validator.addRule("confirm", "matches", "Les mots de passe ne correspondent pas", { field: "password" });
// Validation personnalisée avec options : mot de passe complexe
validator.addRule("password", (value, options) => {
    return value.length >= options.minLength && /[A-Z]/.test(value);
}, "Mot de passe trop faible", { options: { minLength: 8 } });


// Date de naissance
validator.addRule("Date de naissance", "required", "Date obligatoire");
validator.addRule("Date de naissance", "minAge", "Vous devez avoir au moins 13 ans", { age: 13 });


// Checkbox
validator.addRule("Acceptation des conditions", "checkbox", "Veuillez accepter les conditions");


// fichier (image max 2 Mo)
validator.addRule("file", "fileType", "Seules les images PNG ou JPEG sont acceptées", { types: ["image/png", "image/jpeg"] });
validator.addRule("file", "fileSize", "Le fichier ne doit pas dépasser 2 Mo", { max: 2 });



