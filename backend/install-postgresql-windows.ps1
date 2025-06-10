# Script d'installation PostgreSQL pour Windows
# Exécuter en tant qu'administrateur

Write-Host "🐘 Installation de PostgreSQL pour Site Database" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Vérifier si PostgreSQL est déjà installé
try {
    $postgresService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($postgresService) {
        Write-Host "✅ PostgreSQL semble déjà installé" -ForegroundColor Green
        Write-Host "Service trouvé: $($postgresService.Name)" -ForegroundColor Yellow
        
        # Vérifier si le service est démarré
        if ($postgresService.Status -eq "Running") {
            Write-Host "✅ PostgreSQL est déjà en cours d'exécution" -ForegroundColor Green
        } else {
            Write-Host "⚠️ PostgreSQL est installé mais pas démarré" -ForegroundColor Yellow
            Write-Host "Tentative de démarrage du service..." -ForegroundColor Blue
            Start-Service $postgresService.Name
            Write-Host "✅ Service PostgreSQL démarré" -ForegroundColor Green
        }
        exit 0
    }
} catch {
    Write-Host "PostgreSQL non détecté, installation en cours..." -ForegroundColor Blue
}

# Vérifier si Chocolatey est installé
Write-Host "🔍 Vérification de Chocolatey..." -ForegroundColor Blue
try {
    choco --version | Out-Null
    Write-Host "✅ Chocolatey est installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Chocolatey n'est pas installé" -ForegroundColor Red
    Write-Host "Installation de Chocolatey..." -ForegroundColor Blue
    
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    Write-Host "✅ Chocolatey installé" -ForegroundColor Green
}

# Installer PostgreSQL via Chocolatey
Write-Host "📦 Installation de PostgreSQL..." -ForegroundColor Blue
try {
    choco install postgresql --confirm
    Write-Host "✅ PostgreSQL installé avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'installation de PostgreSQL" -ForegroundColor Red
    Write-Host "Essayez d'installer manuellement depuis: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Attendre que les services démarrent
Write-Host "⏳ Démarrage des services PostgreSQL..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Créer la base de données
Write-Host "🗄️ Création de la base de données 'site_database'..." -ForegroundColor Blue
try {
    # Utiliser l'utilisateur postgres par défaut (mot de passe vide après installation Chocolatey)
    $env:PGPASSWORD = ""
    psql -U postgres -c "CREATE DATABASE site_database;" 2>$null
    Write-Host "✅ Base de données 'site_database' créée" -ForegroundColor Green
} catch {
    Write-Host "⚠️ La base de données existe peut-être déjà ou erreur de création" -ForegroundColor Yellow
    Write-Host "Vous pouvez la créer manuellement avec: psql -U postgres -c `"CREATE DATABASE site_database;`"" -ForegroundColor Blue
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 Installation terminée !" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Redémarrez votre terminal" -ForegroundColor White
Write-Host "2. Allez dans le dossier backend: cd backend" -ForegroundColor White
Write-Host "3. Démarrez l'application: npm run start:postgres" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Si vous avez des problèmes :" -ForegroundColor Yellow
Write-Host "- Consultez backend/POSTGRESQL_SETUP.md" -ForegroundColor White
Write-Host "- Ou créez la base manuellement: psql -U postgres -c `"CREATE DATABASE site_database;`"" -ForegroundColor White 
