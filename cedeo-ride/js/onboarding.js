/* ===========================================
   CEDEO Ride — Onboarding interactif (Feature 13)
   Flow 5 étapes avec animations
   =========================================== */

const Onboarding = (() => {
  const STORAGE_KEY = 'cedeoride_onboarding_done';

  function isOnboardingDone() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function markOnboardingDone() {
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  function shouldShowOnboarding() {
    const currentUser = CedeoStore.getCurrentUser();
    return currentUser && !isOnboardingDone();
  }

  const STEPS = [
    {
      id: 'welcome',
      title: 'Bienvenue sur CEDEO Ride !',
      subtitle: 'La plateforme de covoiturage de la région Ouest',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
      content: 'Partagez vos trajets avec vos collègues CEDEO et Saint-Gobain. Économisez, écologisez, socialisez !'
    },
    {
      id: 'profile',
      title: 'Complétez votre profil',
      subtitle: 'Pour que vos collègues vous reconnaissent',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      content: 'Ajoutez votre véhicule et vos préférences de trajet. Un profil complet inspire confiance !',
      action: 'profile'
    },
    {
      id: 'search',
      title: 'Trouvez un covoiturage',
      subtitle: 'En quelques clics',
      image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80',
      content: 'Recherchez par destination, date ou explorez la carte interactive pour trouver les trajets de vos collègues.'
    },
    {
      id: 'publish',
      title: 'Proposez vos trajets',
      subtitle: 'Partagez les places de votre véhicule',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
      content: 'Publiez vos trajets réguliers ou ponctuels. L\'algorithme trouvera automatiquement des collègues compatibles.'
    },
    {
      id: 'features',
      title: 'Explorez les fonctionnalités',
      subtitle: 'Bien plus qu\'un simple covoiturage',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      content: 'Passeport Vert, challenges, voisins, SOS trajet... Découvrez tout ce que CEDEO Ride peut faire pour vous !',
      features: ['Passeport Vert CO2', 'Challenges mensuels', 'Radar voisins', 'SOS Trajet', 'Routines intelligentes']
    }
  ];

  function renderOnboarding() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    app.innerHTML = `
      <div class="onboarding-overlay">
        <div class="onboarding-container">
          <div class="onboarding-progress">
            ${STEPS.map((_, i) => `<div class="onboarding-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`).join('')}
          </div>
          <div class="onboarding-slides" id="onboarding-slides">
            ${STEPS.map((step, i) => `
              <div class="onboarding-slide ${i === 0 ? 'active' : ''}" data-step="${i}">
                <div class="onboarding-image">
                  <img src="${step.image}" alt="${step.title}" loading="${i === 0 ? 'eager' : 'lazy'}">
                  <div class="onboarding-image-overlay"></div>
                </div>
                <div class="onboarding-content">
                  <h2 class="onboarding-title">${step.title}</h2>
                  <p class="onboarding-subtitle">${step.subtitle}</p>
                  <p class="onboarding-text">${step.content}</p>
                  ${step.features ? `
                    <div class="onboarding-features">
                      ${step.features.map(f => `<span class="badge badge-glass">${f}</span>`).join('')}
                    </div>
                  ` : ''}
                  ${step.id === 'welcome' && currentUser ? `
                    <div class="onboarding-welcome-name">
                      Bonjour ${Utils.escapeHtml(currentUser.firstName)} !
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="onboarding-actions">
            <button class="btn btn-ghost" id="onboarding-skip">Passer</button>
            <div style="display:flex;gap:var(--space-3)">
              <button class="btn btn-outline" id="onboarding-prev" style="display:none">Précédent</button>
              <button class="btn btn-primary" id="onboarding-next">Suivant</button>
            </div>
          </div>
        </div>
      </div>
    `;

    let currentStep = 0;

    const updateStep = (step) => {
      currentStep = step;
      document.querySelectorAll('.onboarding-slide').forEach((s, i) => {
        s.classList.toggle('active', i === step);
        s.style.transform = `translateX(${(i - step) * 100}%)`;
        s.style.opacity = i === step ? '1' : '0';
      });
      document.querySelectorAll('.onboarding-dot').forEach((d, i) => {
        d.classList.toggle('active', i <= step);
      });
      document.getElementById('onboarding-prev').style.display = step > 0 ? 'inline-flex' : 'none';
      document.getElementById('onboarding-next').textContent = step === STEPS.length - 1 ? 'C\'est parti !' : 'Suivant';
    };

    document.getElementById('onboarding-next').addEventListener('click', () => {
      if (currentStep < STEPS.length - 1) {
        updateStep(currentStep + 1);
      } else {
        markOnboardingDone();
        window.App.navigate('/');
      }
    });

    document.getElementById('onboarding-prev').addEventListener('click', () => {
      if (currentStep > 0) updateStep(currentStep - 1);
    });

    document.getElementById('onboarding-skip').addEventListener('click', () => {
      markOnboardingDone();
      window.App.navigate('/');
    });

    // Initialize positions
    document.querySelectorAll('.onboarding-slide').forEach((s, i) => {
      s.style.transform = `translateX(${i * 100}%)`;
      s.style.opacity = i === 0 ? '1' : '0';
    });
  }

  return {
    renderOnboarding,
    shouldShowOnboarding,
    isOnboardingDone,
    markOnboardingDone
  };
})();
