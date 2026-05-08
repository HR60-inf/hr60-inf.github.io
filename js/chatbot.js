(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     STYLES
  ═══════════════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = `
    #itr-chat-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #00c8ff, #0050ff);
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,200,255,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #itr-chat-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(0,200,255,0.6); }
    #itr-chat-btn svg { width: 28px; height: 28px; fill: white; }
    #itr-chat-btn .itr-notif {
      position: absolute; top: 0; right: 0; width: 14px; height: 14px;
      background: #ff4444; border-radius: 50%; border: 2px solid #0d1525;
    }
    #itr-chat-window {
      position: fixed;
      top: 10px;
      bottom: 90px;
      right: 28px;
      z-index: 9998;
      width: 370px;
      max-height: 570px;
      margin-top: auto;
      background: #0d1525; border: 1px solid rgba(0,200,255,0.2);
      border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.8) translateY(20px); opacity: 0;
      transition: transform 0.25s ease, opacity 0.25s ease;
      pointer-events: none;
    }
    #itr-chat-window.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }
    .itr-header {
      background: linear-gradient(135deg, #00c8ff22, #0050ff22);
      border-bottom: 1px solid rgba(0,200,255,0.15);
      padding: 14px 16px; display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .itr-header-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: linear-gradient(135deg, #00c8ff, #0050ff);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .itr-header-info { flex: 1; }
    .itr-header-name { font-weight: 700; color: #e8f0fe; font-size: 14px; }
    .itr-header-status { font-size: 11px; color: #00c8ff; display: flex; align-items: center; gap: 5px; }
    .itr-header-status::before {
      content: ''; width: 7px; height: 7px; border-radius: 50%; background: #00e676; display: inline-block;
    }
    .itr-lang-selector {
      display: flex; gap: 4px;
    }
    .itr-lang-btn {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(0,200,255,0.2);
      color: #8ba3c7; border-radius: 8px; padding: 4px 8px;
      font-size: 11px; cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .itr-lang-btn.active, .itr-lang-btn:hover {
      background: rgba(0,200,255,0.15); border-color: #00c8ff; color: #00c8ff;
    }
    .itr-close-btn {
      background: none; border: none; color: #8ba3c7; cursor: pointer;
      font-size: 18px; padding: 4px; border-radius: 6px; transition: color 0.2s;
    }
    .itr-close-btn:hover { color: #e8f0fe; }
    .itr-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex;
      flex-direction: column; gap: 12px; min-height: 0;
    }
    .itr-messages::-webkit-scrollbar { width: 4px; }
    .itr-messages::-webkit-scrollbar-track { background: transparent; }
    .itr-messages::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.3); border-radius: 2px; }
    .itr-msg {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .itr-msg.bot { justify-content: flex-start; }
    .itr-msg.user { justify-content: flex-end; }
    .itr-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #00c8ff, #0050ff);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0;
    }
    .itr-msg-bubble {
      max-width: 82%; padding: 10px 14px; border-radius: 16px;
      font-size: 13px; line-height: 1.5; color: #e8f0fe;
    }
    .itr-msg.bot .itr-msg-bubble {
      background: rgba(255,255,255,0.07); border: 1px solid rgba(0,200,255,0.12);
      border-bottom-left-radius: 4px;
    }
    .itr-msg.user .itr-msg-bubble {
      background: linear-gradient(135deg, #00c8ff33, #0050ff33);
      border: 1px solid rgba(0,200,255,0.25); border-bottom-right-radius: 4px;
      text-align: right;
    }
    .itr-msg-bubble b { color: #00c8ff; }
    .itr-typing {
      display: flex; gap: 5px; align-items: center; padding: 10px 14px;
    }
    .itr-typing span {
      width: 7px; height: 7px; border-radius: 50%; background: #00c8ff;
      animation: itr-bounce 1.2s infinite;
    }
    .itr-typing span:nth-child(2) { animation-delay: 0.2s; }
    .itr-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes itr-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
      40% { transform: translateY(-6px); opacity: 1; }
    }
    .itr-quick {
      padding: 10px 16px; border-top: 1px solid rgba(0,200,255,0.1);
      flex-shrink: 0;
    }
    .itr-quick-title { font-size: 11px; color: #8ba3c7; margin-bottom: 8px; }
    .itr-quick-scroll {
      display: flex; flex-direction: column; gap: 6px; max-height: 110px;
      overflow-y: auto;
    }
    .itr-quick-scroll::-webkit-scrollbar { width: 3px; }
    .itr-quick-scroll::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.3); border-radius: 2px; }
    .itr-quick-btn {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(0,200,255,0.15);
      color: #8ba3c7; border-radius: 10px; padding: 7px 12px;
      font-size: 12px; cursor: pointer; text-align: left;
      transition: all 0.2s; font-family: inherit;
    }
    .itr-quick-btn:hover {
      background: rgba(0,200,255,0.1); border-color: #00c8ff; color: #e8f0fe;
    }
    .itr-input-row {
      display: flex; gap: 8px; padding: 12px 16px;
      border-top: 1px solid rgba(0,200,255,0.1);
      flex-shrink: 0;
    }
    .itr-input {
      flex: 1; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(0,200,255,0.2); border-radius: 12px;
      color: #e8f0fe; padding: 10px 14px; font-size: 13px;
      outline: none; font-family: inherit; transition: border-color 0.2s;
    }
    .itr-input:focus { border-color: #00c8ff; }
    .itr-input::placeholder { color: #8ba3c7; }
    .itr-send-btn {
      background: linear-gradient(135deg, #00c8ff, #0050ff);
      border: none; border-radius: 12px; width: 42px; height: 42px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s; flex-shrink: 0;
    }
    .itr-send-btn:hover { opacity: 0.85; }
    .itr-send-btn svg { fill: white; width: 18px; height: 18px; }
    @media (max-width: 500px) {
      #itr-chat-window { width: calc(100vw - 16px); right: 8px; left: 8px; bottom: 80px; top: 8px; max-height: none; }
      #itr-chat-btn { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════
     DONNÉES UI MULTILINGUES
  ═══════════════════════════════════════════ */
  const UI = {
    fr: {
      title: 'Assistant ITR',
      status: 'En ligne',
      greeting: 'Bonjour ! 👋 Je suis l\'assistant d\'<b>Informa-Technique R</b>.\nJe réponds à vos questions sur la sécurité numérique, l\'informatique, les arnaques en ligne et bien plus. Comment puis-je vous aider ?',
      placeholder: 'Posez votre question...',
      quickTitle: 'Questions fréquentes :',
      noAnswer: 'Je ne comprends pas encore cette question 😅 Essayez de la reformuler ou choisissez une question dans la liste. Vous pouvez aussi nous écrire à <b>contact@informa-technique.fr</b>',
    },
    en: {
      title: 'ITR Assistant',
      status: 'Online',
      greeting: 'Hello! 👋 I\'m the <b>Informa-Technique R</b> assistant.\nI answer questions about digital security, computing, online scams and more. How can I help you?',
      placeholder: 'Ask your question...',
      quickTitle: 'Frequently asked questions:',
      noAnswer: 'I don\'t understand that question yet 😅 Try rephrasing it or choose from the list above. You can also write to us at <b>contact@informa-technique.fr</b>',
    },
    es: {
      title: 'Asistente ITR',
      status: 'En línea',
      greeting: '¡Hola! 👋 Soy el asistente de <b>Informa-Technique R</b>.\nRespondo preguntas sobre seguridad digital, informática, estafas en línea y más. ¿En qué puedo ayudarte?',
      placeholder: 'Haz tu pregunta...',
      quickTitle: 'Preguntas frecuentes:',
      noAnswer: 'Aún no entiendo esa pregunta 😅 Intenta reformularla o elige una de la lista. También puedes escribirnos a <b>contact@informa-technique.fr</b>',
    },
    sg: {
      title: 'Msaidizi ITR',
      status: 'Hchiri',
      greeting: 'Bariza Asubouhi! 👋 Mimi ni msaidizi wa <b>Informa-Technique R</b>.\nNamnadjé ndjohoussaidiya?',
      placeholder: 'Wouzissa le Soualla lahaho...',
      quickTitle: 'Ma Soualla ya dayima :',
      noAnswer: 'Soualla lahaho si ndzuri sana 😅 Jaribu tena au chagua swali kutoka kwenye orodha. Unaweza pia kuwasiliana nasi kwa <b>contact@informa-technique.fr</b>',
    }
  };

  /* ═══════════════════════════════════════════
     BASE DE QUESTIONS/RÉPONSES
  ═══════════════════════════════════════════ */
  const QA = {
    fr: [
      {
        keywords: ['sécuriser téléphone','sécurité téléphone','protéger téléphone','telephone','mobile','smartphone','sécuriser mon téléphone'],
        question: '📱 Comment sécuriser mon téléphone ?',
        answer: `Voici les étapes essentielles :\n\n🔒 <b>Verrouillage</b> : Activez PIN ou empreinte digitale\n🔄 <b>Mises à jour</b> : Maintenez Android/iOS à jour\n📥 <b>Applications</b> : Installez uniquement depuis Play Store / App Store\n🛡️ <b>2FA</b> : Activez la double authentification sur vos comptes\n📵 <b>Wi-Fi public</b> : Évitez-les ou utilisez un VPN\n🔍 <b>Antivirus</b> : Malwarebytes Mobile (gratuit)\n💾 <b>Sauvegarde</b> : Activez Google Photos / iCloud\n🗺️ <b>Localisation</b> : Activez "Trouver mon téléphone"`
      },
      {
        keywords: ['mot de passe','mdp','password','créer mot de passe','mot de passe fort','gestionnaire mot de passe'],
        question: '🔑 Comment créer un mot de passe fort ?',
        answer: `Règles pour un mot de passe fort :\n\n✅ Minimum <b>12 caractères</b> (16+ recommandé)\n✅ Mélange : <b>Majuscules + minuscules + chiffres + symboles</b>\n✅ <b>Unique</b> pour chaque site\n✅ Pas votre prénom ou date de naissance\n\n💡 Exemple : <b>J'aime!LeCafé2024</b>\n\n🔐 Gestionnaire recommandé : <b>Bitwarden</b> (100% gratuit)\nTéléchargez-le sur bitwarden.com — il retient tous vos mots de passe en sécurité.`
      },
      {
        keywords: ['phishing','arnaque','hameçonnage','faux mail','faux sms','escroquerie','fraude','mail suspect'],
        question: '🎣 Comment me protéger du phishing ?',
        answer: `Le phishing = vol de vos informations par de faux messages.\n\n🚩 <b>Signes d'alerte</b> :\n• URL bizarre (vérifiez l'adresse exacte)\n• Fautes d'orthographe dans le mail\n• Urgence exagérée ("Votre compte sera bloqué !")\n• Demande de mot de passe ou carte bancaire\n\n✅ <b>À faire</b> :\n• Ne cliquez jamais sur les liens suspects\n• Vérifiez l'email exact de l'expéditeur\n• Accédez directement au site via votre navigateur\n• Activez la 2FA sur tous vos comptes\n• Signalez sur <b>signal-spam.fr</b>`
      },
      {
        keywords: ['vpn','réseau privé','anonyme','anonymat','connexion sécurisée','protonvpn','nordvpn'],
        question: '🌐 Qu\'est-ce qu\'un VPN ?',
        answer: `Un VPN chiffre votre connexion et masque votre adresse IP.\n\n🎯 <b>Pourquoi utiliser un VPN ?</b>\n• Protéger votre vie privée en ligne\n• Sécuriser les Wi-Fi publics\n• Contourner les restrictions géographiques\n• Empêcher votre opérateur de vous surveiller\n\n🏆 <b>VPN recommandés</b> :\n• <b>Gratuit</b> : Proton VPN (aucune limite de données) ✅\n• <b>Payant</b> : NordVPN (~3€/mois) — le meilleur rapport qualité/prix\n\n⚠️ Évitez les VPN gratuits inconnus — ils revendent vos données !`
      },
      {
        keywords: ['wifi','wi-fi','réseau wifi','sécuriser wifi','box','routeur','internet maison'],
        question: '📶 Comment sécuriser mon Wi-Fi ?',
        answer: `6 étapes pour un Wi-Fi sécurisé :\n\n1️⃣ <b>Mot de passe fort</b> : Changez le mot de passe par défaut de votre box\n2️⃣ <b>Chiffrement WPA3</b> : Activez WPA3 (ou WPA2 minimum) dans les paramètres\n3️⃣ <b>Nom du réseau</b> : Ne mettez pas votre nom ou adresse dedans\n4️⃣ <b>Mise à jour du routeur</b> : Vérifiez les mises à jour du firmware\n5️⃣ <b>Réseau invité</b> : Créez un réseau séparé pour vos visiteurs\n6️⃣ <b>Désactivez WPS</b> : Cette fonction est vulnérable aux attaques`
      },
      {
        keywords: ['virus','malware','logiciel malveillant','infecté','hacké','piraté','ransomware','trojan','spyware'],
        question: '🦠 Comment me protéger des virus ?',
        answer: `Protection contre les virus et malwares :\n\n🛡️ <b>Antivirus recommandés</b> :\n• Windows : <b>Windows Defender</b> (intégré, suffisant) + <b>Malwarebytes</b>\n• Android : <b>Malwarebytes Mobile</b>\n• Mac : <b>Malwarebytes pour Mac</b>\n\n✅ <b>Bonnes habitudes</b> :\n• Ne téléchargez jamais sur des sites non officiels\n• N'ouvrez pas les pièces jointes inconnues\n• Méfiez-vous des clés USB trouvées\n• Faites des sauvegardes régulières\n• Mettez à jour tous vos logiciels\n\n🚨 <b>Si infecté</b> : déconnectez-vous d'Internet → scan complet → changez tous vos mots de passe`
      },
      {
        keywords: ['double authentification','2fa','authentification','vérification deux étapes','sms code','google authenticator','authy'],
        question: '🔐 Comment activer la double authentification (2FA) ?',
        answer: `La 2FA ajoute un 2ème verrou sur vos comptes.\n\n📲 <b>Comment ça fonctionne ?</b>\nEn plus du mot de passe, vous entrez un code temporaire (valable 30 sec) généré par une application.\n\n🔧 <b>Étapes d'activation</b> :\n1. Allez dans les paramètres de sécurité de votre compte\n2. Cherchez "Double authentification" ou "2FA"\n3. Scannez le QR code avec votre application\n\n📱 <b>Applications recommandées</b> :\n• <b>Authy</b> ✅ (meilleure option — sauvegarde dans le cloud)\n• Google Authenticator\n• Microsoft Authenticator\n\n⚠️ À activer sur : Gmail, Facebook, Instagram, votre banque, PayPal`
      },
      {
        keywords: ['crypto','bitcoin','cryptomonnaie','ethereum','blockchain','portefeuille crypto','btc','eth'],
        question: '₿ Comment débuter avec les cryptomonnaies ?',
        answer: `Les cryptomonnaies : monnaies numériques décentralisées.\n\n📚 <b>Bases à connaître</b> :\n• <b>Bitcoin (BTC)</b> : la plus connue et la plus ancienne\n• <b>Ethereum (ETH)</b> : permet les applications décentralisées\n• La <b>blockchain</b> = registre public et infalsifiable\n\n🚀 <b>Comment commencer ?</b>\n1. Choisissez une plateforme fiable : <b>Binance, Coinbase, Kraken</b>\n2. Vérifiez votre identité (obligatoire)\n3. Commencez avec de petites sommes (10-50€)\n4. Stockez dans un <b>wallet sécurisé</b>\n\n⚠️ <b>Risques</b> : très volatil — investissez seulement ce que vous pouvez perdre.\nMéfiez-vous des arnaques "rendement garanti" !`
      },
      {
        keywords: ['navigateur','browser','chrome','firefox','brave','edge','navigateur sécurisé','surf sécurisé'],
        question: '🌍 Quel navigateur sécurisé utiliser ?',
        answer: `Comparatif des navigateurs pour votre sécurité :\n\n🥇 <b>Brave</b> (recommandé) ✅\n• Bloque pubs et trackers automatiquement\n• Basé sur Chrome — compatible avec toutes les extensions\n• Protection contre le fingerprinting\n\n🥈 <b>Firefox</b>\n• Open source et respectueux de la vie privée\n• Nombreuses extensions de sécurité disponibles\n\n🥉 <b>Chrome / Edge</b>\n• Rapides mais collectent beaucoup de données\n\n🔧 <b>Extensions à installer</b> :\n• <b>uBlock Origin</b> — bloque les publicités\n• <b>Privacy Badger</b> — anti-trackers\n• <b>Bitwarden</b> — gestionnaire de mots de passe`
      },
      {
        keywords: ['antivirus','antivirus gratuit','meilleur antivirus','protection pc','windows defender','malwarebytes'],
        question: '🛡️ Quel antivirus choisir ?',
        answer: `Meilleurs antivirus par appareil :\n\n💻 <b>Windows</b> :\n• <b>Windows Defender</b> (gratuit, intégré) — suffisant\n• <b>Malwarebytes</b> (gratuit) — excellent pour les scans ponctuels\n• <b>Bitdefender</b> (payant ~30€/an) — meilleure protection globale\n\n📱 <b>Android</b> :\n• <b>Malwarebytes Mobile</b> (gratuit)\n• <b>Avast Mobile Security</b>\n\n🍎 <b>iPhone/iPad</b> :\n• Pas besoin d'antivirus — iOS est très sécurisé\n• Gardez simplement votre système à jour !\n\n🍏 <b>Mac</b> :\n• <b>Malwarebytes pour Mac</b> (gratuit)`
      },
      {
        keywords: ['réseaux sociaux','facebook','instagram','tiktok','compte piraté','compte hacké','snapchat'],
        question: '📱 Comment sécuriser mes réseaux sociaux ?',
        answer: `Sécurisez vos comptes sur les réseaux :\n\n🔐 <b>Étapes essentielles</b> :\n1. Mot de passe unique et fort pour chaque réseau\n2. Activez la <b>double authentification (2FA)</b>\n3. Vérifiez les applications tierces ayant accès à votre compte\n4. Vérifiez les sessions actives — déconnectez les inconnues\n\n👁️ <b>Confidentialité</b> :\n• Mettez votre profil en privé si nécessaire\n• Limitez qui peut voir vos publications\n• Désactivez la géolocalisation dans les posts\n\n🚨 <b>Compte piraté ?</b>\n1. Changez immédiatement le mot de passe\n2. Activez la 2FA\n3. Supprimez les applications tierces suspectes\n4. Signalez à la plateforme`
      },
      {
        keywords: ['données personnelles','vie privée','rgpd','protection données','confidentialité','tracker','espionnage'],
        question: '🔏 Comment protéger mes données personnelles ?',
        answer: `Protégez votre vie privée en ligne :\n\n📱 <b>Sur votre téléphone</b> :\n• Vérifiez les permissions des apps (micro, caméra, localisation)\n• Désactivez les permissions inutiles\n• Évitez les apps qui demandent trop d'accès\n\n🌐 <b>Sur internet</b> :\n• Utilisez <b>Firefox</b> ou <b>Brave</b>\n• Installez <b>uBlock Origin</b>\n• Utilisez <b>DuckDuckGo</b> comme moteur de recherche\n\n📧 <b>Email</b> :\n• <b>ProtonMail</b> pour les communications sensibles\n• Utilisez une adresse temporaire pour les inscriptions peu importantes\n\n🔑 Utilisez un gestionnaire de mots de passe : <b>Bitwarden</b>`
      },
      {
        keywords: ['démarches','en ligne','administratif','impôts','caf','ameli','service public','gouvernement'],
        question: '🏛️ Comment faire mes démarches en ligne en sécurité ?',
        answer: `Démarches administratives en ligne :\n\n✅ <b>Sites officiels</b> :\n• <b>impots.gouv.fr</b> — Déclaration d'impôts\n• <b>caf.fr</b> — Allocations familiales\n• <b>ameli.fr</b> — Assurance maladie\n• <b>service-public.fr</b> — Toutes les démarches\n\n🔒 <b>Vérifiez avant de saisir vos infos</b> :\n• URL commence par <b>https://</b>\n• Nom de domaine officiel (<b>.gouv.fr</b>)\n• Cadenas dans la barre d'adresse\n\n⚠️ <b>L'État ne vous demandera JAMAIS</b> :\n• Votre mot de passe par email\n• Vos coordonnées bancaires par SMS\n• Un paiement urgent par virement`
      },
      {
        keywords: ['sauvegarde','backup','sauvegarder','perdre données','récupérer fichiers','disque dur'],
        question: '💾 Comment sauvegarder mes données ?',
        answer: `La règle d'or : la règle <b>3-2-1</b> ✅\n\n• <b>3</b> copies de vos données\n• Sur <b>2</b> supports différents\n• Dont <b>1</b> hors site (cloud ou autre lieu)\n\n☁️ <b>Solutions cloud gratuites</b> :\n• Google Drive — 15 Go gratuits\n• OneDrive — 5 Go gratuits\n• iCloud — 5 Go pour iPhone\n\n💿 <b>Sauvegarde physique</b> :\n• Disque dur externe (recommandé)\n• Clé USB pour les petits fichiers\n\n📱 <b>Sur téléphone</b> :\n• Android : Google Photos (photos) + Drive (fichiers)\n• iPhone : iCloud (automatique)`
      },
      {
        keywords: ['informatique débutant','apprendre informatique','commencer informatique','base informatique','débutant'],
        question: '💻 Comment débuter en informatique ?',
        answer: `Bienvenue ! Voici par où commencer :\n\n📚 <b>Les 4 bases à apprendre</b> :\n1. Utilisation de Windows ou Mac\n2. Navigation web sécurisée\n3. Gestion des fichiers et dossiers\n4. Email et communication\n\n🎬 <b>Ressources gratuites</b> :\n• Notre chaîne <b>YouTube Informa-Technique R</b> — tutoriels en français\n• <b>OpenClassrooms.com</b> — cours gratuits\n\n🔐 <b>Bons réflexes dès le départ</b> :\n• Créez des mots de passe forts\n• Mettez à jour régulièrement votre ordinateur\n• Méfiez-vous des emails suspects\n\nN'hésitez pas à regarder nos tutoriels sur le site ! 🎬`
      }
    ],

    en: [
      {
        keywords: ['secure phone','phone security','protect phone','mobile','smartphone'],
        question: '📱 How to secure my phone?',
        answer: `Essential steps to secure your phone:\n\n🔒 <b>Lock screen</b>: Enable PIN or fingerprint\n🔄 <b>Updates</b>: Keep Android/iOS up to date\n📥 <b>Apps</b>: Install only from Play Store / App Store\n🛡️ <b>2FA</b>: Enable two-factor auth on all accounts\n📵 <b>Public Wi-Fi</b>: Avoid or use a VPN\n🔍 <b>Antivirus</b>: Malwarebytes Mobile (free)\n💾 <b>Backup</b>: Enable Google Photos / iCloud\n🗺️ <b>Find my phone</b>: Enable location tracking`
      },
      {
        keywords: ['password','strong password','secure password','create password','password manager'],
        question: '🔑 How to create a strong password?',
        answer: `Rules for a strong password:\n\n✅ Minimum <b>12 characters</b> (16+ recommended)\n✅ Mix: <b>uppercase + lowercase + numbers + symbols</b>\n✅ <b>Unique</b> for each site\n✅ No name or date of birth\n\n💡 Example: <b>I!LoveCoffee2024</b>\n\n🔐 Recommended manager: <b>Bitwarden</b> (100% free)\nDownload at bitwarden.com — stores all your passwords securely.`
      },
      {
        keywords: ['phishing','scam','fraud','fake email','fake sms','hack'],
        question: '🎣 How to protect from phishing?',
        answer: `Phishing = stealing your information via fake messages.\n\n🚩 <b>Warning signs</b>:\n• Strange URL (check exact address)\n• Spelling mistakes in email\n• Excessive urgency ("Your account will be blocked!")\n• Request for password or bank card\n\n✅ <b>What to do</b>:\n• Never click suspicious links\n• Check exact sender email address\n• Go directly to official website\n• Enable 2FA on all accounts`
      },
      {
        keywords: ['vpn','private network','anonymous','secure connection','protonvpn','nordvpn'],
        question: '🌐 What is a VPN?',
        answer: `A VPN encrypts your connection and hides your IP address.\n\n🎯 <b>Why use a VPN?</b>\n• Protect your online privacy\n• Secure public Wi-Fi connections\n• Bypass geographic restrictions\n• Prevent your ISP from monitoring you\n\n🏆 <b>Recommended VPNs</b>:\n• <b>Free</b>: Proton VPN (no data limit) ✅\n• <b>Paid</b>: NordVPN (~3€/month)\n\n⚠️ Avoid unknown free VPNs — they may sell your data!`
      },
      {
        keywords: ['virus','malware','infected','hacked','ransomware','trojan'],
        question: '🦠 How to protect from viruses?',
        answer: `Protection against viruses and malware:\n\n🛡️ <b>Recommended antivirus</b>:\n• Windows: <b>Windows Defender</b> + <b>Malwarebytes</b>\n• Android: <b>Malwarebytes Mobile</b>\n• Mac: <b>Malwarebytes for Mac</b>\n\n✅ <b>Good habits</b>:\n• Never download from unofficial sites\n• Don't open unknown attachments\n• Make regular backups\n• Keep all software updated\n\n🚨 <b>If infected</b>: disconnect from Internet → full scan → change all passwords`
      },
      {
        keywords: ['two factor','2fa','authentication','verification','authenticator'],
        question: '🔐 How to enable 2FA?',
        answer: `2FA adds a second lock on your accounts.\n\n📲 <b>How it works</b>:\nBeyond your password, enter a temporary code (valid 30 sec) from an app.\n\n🔧 <b>Steps to enable</b>:\n1. Go to your account security settings\n2. Look for "Two-factor authentication" or "2FA"\n3. Scan the QR code with your app\n\n📱 <b>Recommended apps</b>:\n• <b>Authy</b> ✅ (best — cloud backup)\n• Google Authenticator\n• Microsoft Authenticator\n\n⚠️ Enable on: Gmail, Facebook, Instagram, bank, PayPal`
      },
      {
        keywords: ['crypto','bitcoin','cryptocurrency','ethereum','blockchain','btc','eth'],
        question: '₿ How to start with cryptocurrencies?',
        answer: `Cryptocurrencies: decentralized digital currencies.\n\n📚 <b>Basics to know</b>:\n• <b>Bitcoin (BTC)</b>: oldest and most well-known\n• <b>Ethereum (ETH)</b>: enables decentralized apps\n• <b>Blockchain</b> = public, tamper-proof ledger\n\n🚀 <b>How to start</b>:\n1. Choose a trusted exchange: <b>Binance, Coinbase, Kraken</b>\n2. Verify your identity (required)\n3. Start with small amounts (10-50€)\n4. Store in a <b>secure wallet</b>\n\n⚠️ Very volatile — only invest what you can afford to lose.\nBeware of "guaranteed returns" scams!`
      },
      {
        keywords: ['browser','chrome','firefox','brave','edge','secure browser'],
        question: '🌍 Which secure browser to use?',
        answer: `Browser comparison for your security:\n\n🥇 <b>Brave</b> (recommended) ✅\n• Blocks ads and trackers automatically\n• Based on Chrome — all extensions compatible\n• Protection against fingerprinting\n\n🥈 <b>Firefox</b>\n• Open source and privacy-friendly\n• Many security extensions available\n\n🥉 <b>Chrome / Edge</b>\n• Fast but collect lots of data\n\n🔧 <b>Must-have extensions</b>:\n• <b>uBlock Origin</b> — ad blocker\n• <b>Privacy Badger</b> — anti-trackers\n• <b>Bitwarden</b> — password manager`
      },
      {
        keywords: ['antivirus','free antivirus','best antivirus','pc protection'],
        question: '🛡️ Which antivirus to choose?',
        answer: `Best antivirus by device:\n\n💻 <b>Windows</b>:\n• <b>Windows Defender</b> (free, built-in) — sufficient\n• <b>Malwarebytes</b> (free) — great for on-demand scans\n• <b>Bitdefender</b> (paid ~30€/year) — best overall\n\n📱 <b>Android</b>:\n• <b>Malwarebytes Mobile</b> (free)\n• <b>Avast Mobile Security</b>\n\n🍎 <b>iPhone/iPad</b>:\n• No antivirus needed — iOS is very secure\n• Just keep your system updated!\n\n🍏 <b>Mac</b>:\n• <b>Malwarebytes for Mac</b> (free)`
      }
    ],

    es: [
      {
        keywords: ['seguridad teléfono','asegurar teléfono','proteger teléfono','móvil','smartphone'],
        question: '📱 ¿Cómo asegurar mi teléfono?',
        answer: `Pasos esenciales para asegurar tu teléfono:\n\n🔒 <b>Pantalla de bloqueo</b>: Activa PIN o huella digital\n🔄 <b>Actualizaciones</b>: Mantén Android/iOS actualizado\n📥 <b>Apps</b>: Instala solo desde Play Store / App Store\n🛡️ <b>2FA</b>: Activa doble autenticación en todas las cuentas\n📵 <b>Wi-Fi público</b>: Evítalo o usa VPN\n🔍 <b>Antivirus</b>: Malwarebytes Mobile (gratis)\n💾 <b>Copia de seguridad</b>: Activa Google Photos / iCloud`
      },
      {
        keywords: ['contraseña','password','contraseña fuerte','contraseña segura','gestor contraseñas'],
        question: '🔑 ¿Cómo crear una contraseña segura?',
        answer: `Reglas para una contraseña segura:\n\n✅ Mínimo <b>12 caracteres</b> (16+ recomendado)\n✅ Mezcla: <b>mayúsculas + minúsculas + números + símbolos</b>\n✅ <b>Única</b> para cada sitio\n✅ Sin nombre ni fecha de nacimiento\n\n💡 Ejemplo: <b>Me!GustaCafé2024</b>\n\n🔐 Gestor recomendado: <b>Bitwarden</b> (100% gratis)\nDescárgalo en bitwarden.com`
      },
      {
        keywords: ['phishing','estafa','fraude','correo falso','sms falso','hackeo'],
        question: '🎣 ¿Cómo protegerme del phishing?',
        answer: `Phishing = robo de información mediante mensajes falsos.\n\n🚩 <b>Señales de alerta</b>:\n• URL extraña (verifica dirección exacta)\n• Errores ortográficos en el correo\n• Urgencia excesiva ("¡Tu cuenta será bloqueada!")\n• Solicitud de contraseña o tarjeta bancaria\n\n✅ <b>Qué hacer</b>:\n• No hagas clic en enlaces sospechosos\n• Verifica el email exacto del remitente\n• Accede directamente al sitio oficial\n• Activa 2FA en todas las cuentas`
      },
      {
        keywords: ['vpn','red privada','anónimo','anonimato','conexión segura'],
        question: '🌐 ¿Qué es un VPN?',
        answer: `Un VPN cifra tu conexión y oculta tu dirección IP.\n\n🎯 <b>¿Por qué usar un VPN?</b>\n• Proteger tu privacidad online\n• Asegurar conexiones en Wi-Fi público\n• Evitar restricciones geográficas\n\n🏆 <b>VPN recomendados</b>:\n• <b>Gratis</b>: Proton VPN (sin límite de datos) ✅\n• <b>De pago</b>: NordVPN (~3€/mes)\n\n⚠️ ¡Evita VPN gratuitos desconocidos — pueden vender tus datos!`
      },
      {
        keywords: ['virus','malware','infectado','hackeado','ransomware'],
        question: '🦠 ¿Cómo protegerme de virus?',
        answer: `Protección contra virus y malware:\n\n🛡️ <b>Antivirus recomendados</b>:\n• Windows: <b>Windows Defender</b> + <b>Malwarebytes</b>\n• Android: <b>Malwarebytes Mobile</b>\n• Mac: <b>Malwarebytes para Mac</b>\n\n✅ <b>Buenos hábitos</b>:\n• No descargues de sitios no oficiales\n• No abras adjuntos desconocidos\n• Haz copias de seguridad regularmente\n• Mantén todo actualizado\n\n🚨 <b>Si estás infectado</b>: desconéctate → escaneo completo → cambia todas tus contraseñas`
      },
      {
        keywords: ['dos factores','2fa','autenticación','verificación','authenticator'],
        question: '🔐 ¿Cómo activar la doble autenticación (2FA)?',
        answer: `El 2FA añade un segundo candado a tus cuentas.\n\n📲 <b>¿Cómo funciona?</b>\nAdemás de tu contraseña, introduces un código temporal (válido 30 seg) generado por una app.\n\n🔧 <b>Pasos para activarlo</b>:\n1. Ve a configuración de seguridad de tu cuenta\n2. Busca "Doble autenticación" o "2FA"\n3. Escanea el código QR con la app\n\n📱 <b>Apps recomendadas</b>:\n• <b>Authy</b> ✅ (mejor opción — backup en nube)\n• Google Authenticator\n• Microsoft Authenticator`
      },
      {
        keywords: ['crypto','bitcoin','criptomoneda','ethereum','blockchain'],
        question: '₿ ¿Cómo empezar con las criptomonedas?',
        answer: `Las criptomonedas: monedas digitales descentralizadas.\n\n📚 <b>Conceptos básicos</b>:\n• <b>Bitcoin (BTC)</b>: la primera y más conocida\n• <b>Ethereum (ETH)</b>: permite apps descentralizadas\n• <b>Blockchain</b> = registro público e inalterable\n\n🚀 <b>¿Cómo empezar?</b>\n1. Elige un exchange confiable: <b>Binance, Coinbase, Kraken</b>\n2. Verifica tu identidad (obligatorio)\n3. Empieza con cantidades pequeñas\n\n⚠️ Muy volátil — invierte solo lo que puedas perder.\n¡Cuidado con estafas de "rentabilidad garantizada"!`
      },
      {
        keywords: ['navegador','browser','chrome','firefox','brave','seguro'],
        question: '🌍 ¿Qué navegador seguro usar?',
        answer: `Comparativa de navegadores seguros:\n\n🥇 <b>Brave</b> (recomendado) ✅\n• Bloquea anuncios y rastreadores automáticamente\n• Basado en Chrome — todas las extensiones compatibles\n• Protección contra fingerprinting\n\n🥈 <b>Firefox</b>\n• Código abierto y respetuoso de la privacidad\n\n🔧 <b>Extensiones imprescindibles</b>:\n• <b>uBlock Origin</b> — bloqueador de anuncios\n• <b>Privacy Badger</b> — anti-rastreadores\n• <b>Bitwarden</b> — gestor de contraseñas`
      }
    ],

    sg: [
      {
        keywords: ['usalama simu','hifadhi simu','linda simu','simu','smartphone'],
        question: '📱 Namnadjé ndjowhifadhui yé telephoni yahangu?',
        answer: `Hatua muhimu za kulinda simu yako:\n\n🔒 <b>Kufunga</b>: Washa PIN au alama ya kidole\n🔄 <b>Masasisho</b>: Weka Android/iOS kuwa wa kisasa\n📥 <b>Programu</b>: Pakua tu kutoka Play Store / App Store\n🛡️ <b>2FA</b>: Washa uthibitisho mbili kwenye akaunti zako\n📵 <b>Wi-Fi ya umma</b>: Iepuke au tumia VPN\n🔍 <b>Kingavirusi</b>: Malwarebytes Mobile (bila malipo)\n💾 <b>Nakala rudufu</b>: Washa Google Photos / iCloud`
      },
      {
        keywords: ['nywila','password','nywila imara','usalama nywila','kusimamia nywila'],
        question: '🔑 Namnadjé yawtrounga mot de passe Nkouhourou?',
        answer: `Sheria za nywila imara:\n\n✅ Herufi <b>12 au zaidi</b> (16+ inapendekezwa)\n✅ Mchanganyiko: <b>herufi kubwa + ndogo + nambari + alama</b>\n✅ <b>Tofauti</b> kwa kila tovuti\n✅ Bila jina lako au tarehe ya kuzaliwa\n\n💡 Mfano: <b>Napenda!Kahawa2024</b>\n\n🔐 Programu ya kuhifadhi nywila: <b>Bitwarden</b> (bila malipo)\nPakua kwenye bitwarden.com`
      },
      {
        keywords: ['udanganyifu','wizi','phishing','barua pepe ya uongo','ujanja'],
        question: '🎣 Namnadjé Ndjowdjihifadhui né ma pirati?',
        answer: `Udanganyifu = wizi wa taarifa zako kupitia ujumbe wa uongo.\n\n🚩 <b>Ishara za onyo</b>:\n• Anwani ya tovuti inayotiliwa shaka\n• Makosa ya tahajia kwenye barua pepe\n• Haraka kupita kiasi ("Akaunti yako itafungwa!")\n• Ombi la nywila au kadi ya benki\n\n✅ <b>Unachopaswa kufanya</b>:\n• Usibonyeze viungo vya kutiliwa shaka\n• Thibitisha anwani halisi ya mtumaji\n• Fikia tovuti rasmi moja kwa moja\n• Washa 2FA kwenye akaunti zako zote`
      },
      {
        keywords: ['vpn','mtandao binafsi','kutojulikana','usalama mtandao'],
        question: '🌐 VPN ni nini?',
        answer: `VPN inasimba muunganisho wako wa intaneti na kuficha anwani yako ya IP.\n\n🎯 <b>Kwa nini kutumia VPN?</b>\n• Kulinda faragha yako mtandaoni\n• Kulinda muunganisho kwenye Wi-Fi ya umma\n• Kuepuka vizuizi vya kijiografia\n\n🏆 <b>VPN inayopendekezwa</b>:\n• <b>Bila malipo</b>: Proton VPN ✅\n• <b>Kulipwa</b>: NordVPN (~3€/mwezi)\n\n⚠️ Epuka VPN za bure zisizojulikana — zinaweza kuuza data yako!`
      },
      {
        keywords: ['virusi','malware','kuathirika','kudukuliwa','ransomware'],
        question: '🦠 Ndzedze ya kujilinda dhidi ya virusi?',
        answer: `Ulinzi dhidi ya virusi na programu hasidi:\n\n🛡️ <b>Kingavirusi inayopendekezwa</b>:\n• Windows: <b>Windows Defender</b> + <b>Malwarebytes</b>\n• Android: <b>Malwarebytes Mobile</b>\n• Mac: <b>Malwarebytes kwa Mac</b>\n\n✅ <b>Tabia nzuri</b>:\n• Usipakue kutoka tovuti zisizo rasmi\n• Usifungue viambatisho visivyojulikana\n• Fanya nakala rudufu mara kwa mara\n\n🚨 <b>Ukiathiriwa</b>: Jitenganishe na intaneti → skani kamili → badilisha nywila zako zote`
      },
      {
        keywords: ['uthibitisho mbili','2fa','uthibitisho','uhakiki'],
        question: '🔐 Ndzedze ya kuwasha 2FA?',
        answer: `2FA inaongeza kizuizi cha pili kwenye akaunti zako.\n\n📲 <b>Jinsi inavyofanya kazi</b>:\nMbali na nywila, unaingiza msimbo wa muda (unaobadilika kila sekunde 30) kutoka kwa programu.\n\n🔧 <b>Hatua za kuiwasha</b>:\n1. Nenda kwenye mipangilio ya usalama ya akaunti yako\n2. Tafuta "Uthibitisho mbili" au "2FA"\n3. Skani msimbo wa QR na programu yako\n\n📱 <b>Programu zinazopendekezwa</b>:\n• <b>Authy</b> ✅ (bora zaidi)\n• Google Authenticator\n• Microsoft Authenticator`
      },
      {
        keywords: ['crypto','bitcoin','sarafu ya kidijitali','ethereum','blockchain'],
        question: '₿ Ndzedze ya kuanza na sarafu za kidijitali?',
        answer: `Sarafu za kidijitali: sarafu za kidijitali zisizo na udhibiti wa kati.\n\n📚 <b>Misingi ya kujua</b>:\n• <b>Bitcoin (BTC)</b>: ya kwanza na maarufu zaidi\n• <b>Ethereum (ETH)</b>: inaruhusu programu zisizo na udhibiti\n• <b>Blockchain</b> = rejista ya umma isiyoweza kubadilishwa\n\n🚀 <b>Jinsi ya kuanza</b>:\n1. Chagua ubadilishaji wa kuaminika: <b>Binance, Coinbase, Kraken</b>\n2. Thibitisha utambulisho wako (lazima)\n3. Anza na kiasi kidogo\n\n⚠️ Inabadilika sana — wekeza tu unachoweza kupoteza!\nHadhari na ulaghai wa "faida iliyohakikishiwa"!`
      }
    ]
  };

  /* ═══════════════════════════════════════════
     LOGIQUE DE MATCHING
  ═══════════════════════════════════════════ */
  function findAnswer(input, lang) {
    const txt = input.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let best = null, bestScore = 0;
    for (const item of (QA[lang] || QA.fr)) {
      let score = 0;
      for (const kw of item.keywords) {
        const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (txt.includes(kwNorm)) score += kwNorm.split(' ').length * 2;
        else {
          const words = kwNorm.split(' ');
          for (const w of words) { if (w.length > 3 && txt.includes(w)) score += 1; }
        }
      }
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return bestScore > 0 ? best : null;
  }

  /* ═══════════════════════════════════════════
     CONSTRUCTION DU DOM
  ═══════════════════════════════════════════ */
  let currentLang = 'fr';
  let isOpen = false;

  // Bouton flottant
  const btn = document.createElement('button');
  btn.id = 'itr-chat-btn';
  btn.setAttribute('aria-label', 'Ouvrir le chat assistant');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
    <div class="itr-notif"></div>`;
  document.body.appendChild(btn);

  // Fenêtre de chat
  const win = document.createElement('div');
  win.id = 'itr-chat-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Assistant Informa-Technique R');
  win.innerHTML = `
    <div class="itr-header">
      <div class="itr-header-avatar">🤖</div>
      <div class="itr-header-info">
        <div class="itr-header-name" id="itr-title">Assistant ITR</div>
        <div class="itr-header-status" id="itr-status">En ligne</div>
      </div>
      <div class="itr-lang-selector">
        <button class="itr-lang-btn active" data-lang="fr">FR</button>
        <button class="itr-lang-btn" data-lang="en">EN</button>
        <button class="itr-lang-btn" data-lang="es">ES</button>
        <button class="itr-lang-btn" data-lang="sg">SG</button>
      </div>
      <button class="itr-close-btn" id="itr-close">✕</button>
    </div>
    <div class="itr-messages" id="itr-messages"></div>
    <div class="itr-quick" id="itr-quick">
      <div class="itr-quick-title" id="itr-quick-title">Questions fréquentes :</div>
      <div class="itr-quick-scroll" id="itr-quick-btns"></div>
    </div>
    <div class="itr-input-row">
      <input class="itr-input" id="itr-input" type="text" placeholder="Posez votre question..." maxlength="200" autocomplete="off">
      <button class="itr-send-btn" id="itr-send" aria-label="Pveha">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>`;
  document.body.appendChild(win);

  const messagesEl = document.getElementById('itr-messages');
  const inputEl = document.getElementById('itr-input');
  const quickBtns = document.getElementById('itr-quick-btns');

  /* ═══════════════════════════════════════════
     FONCTIONS UI
  ═══════════════════════════════════════════ */
  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = `itr-msg ${role}`;
    if (role === 'bot') {
      msg.innerHTML = `
        <div class="itr-msg-avatar">🤖</div>
        <div class="itr-msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    } else {
      msg.innerHTML = `<div class="itr-msg-bubble">${text}</div>`;
    }
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'itr-msg bot';
    el.id = 'itr-typing';
    el.innerHTML = `
      <div class="itr-msg-avatar">🤖</div>
      <div class="itr-msg-bubble itr-typing">
        <span></span><span></span><span></span>
      </div>`;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('itr-typing');
    if (t) t.remove();
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    inputEl.value = '';
    showTyping();
    setTimeout(() => {
      removeTyping();
      const match = findAnswer(text, currentLang);
      const ui = UI[currentLang];
      addMessage(match ? match.answer : ui.noAnswer, 'bot');
    }, 900 + Math.random() * 600);
  }

  function buildQuickQuestions() {
    quickBtns.innerHTML = '';
    const items = QA[currentLang] || QA.fr;
    items.forEach(item => {
      const b = document.createElement('button');
      b.className = 'itr-quick-btn';
      b.textContent = item.question;
      b.onclick = () => sendMessage(item.question);
      quickBtns.appendChild(b);
    });
  }

  function setLang(lang) {
    currentLang = lang;
    const ui = UI[lang];
    document.getElementById('itr-title').textContent = ui.title;
    document.getElementById('itr-status').textContent = ui.status;
    document.getElementById('itr-quick-title').textContent = ui.quickTitle;
    inputEl.placeholder = ui.placeholder;
    document.querySelectorAll('.itr-lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    buildQuickQuestions();
  }

  function openChat() {
    isOpen = true;
    win.classList.add('open');
    btn.querySelector('.itr-notif').style.display = 'none';
    if (messagesEl.children.length === 0) {
      setTimeout(() => {
        addMessage(UI[currentLang].greeting, 'bot');
      }, 300);
    }
    inputEl.focus();
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
  }

  /* ═══════════════════════════════════════════
     ÉVÉNEMENTS
  ═══════════════════════════════════════════ */
  btn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  document.getElementById('itr-close').addEventListener('click', closeChat);
  document.getElementById('itr-send').addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(inputEl.value); });

  document.querySelectorAll('.itr-lang-btn').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });

  // Initialisation
  setLang('fr');

  // Notification après 3 secondes
  setTimeout(() => {
    if (!isOpen) btn.querySelector('.itr-notif').style.display = 'block';
  }, 3000);

})();
