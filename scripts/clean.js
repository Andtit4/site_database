const fs = require('fs')
const path = require('path')

console.log('🧹 Nettoyage des caches...')

// Dossiers à nettoyer
const dirsToClean = [
    '.next',
    'node_modules/.cache',
    '.turbo'
]

// Fonction pour supprimer un dossier de manière récursive
function removeDirRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true })
            console.log(`✅ Supprimé: ${dirPath}`)
        } catch (error) {
            console.log(`⚠️  Erreur lors de la suppression de ${dirPath}:`, error.message)
        }
    } else {
        console.log(`ℹ️  ${dirPath} n'existe pas`)
    }
}

// Nettoyer chaque dossier
dirsToClean.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    removeDirRecursive(fullPath)
})

console.log('✨ Nettoyage terminé!')
console.log('💡 Vous pouvez maintenant relancer le serveur avec: npm run dev')