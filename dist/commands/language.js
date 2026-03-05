import { readJSON, writeJSON, getConfigPath } from '../infrastructure/fs.js';
import readline from 'readline';
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: 'Korean' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
];
export async function cmdLanguage() {
    console.log('\nAvailable languages:');
    SUPPORTED_LANGUAGES.forEach((lang, index) => {
        console.log(`  ${index + 1}. ${lang.name} (${lang.code})`);
    });
    const CONFIG_PATH = getConfigPath();
    let currentLang = 'en';
    try {
        const config = await readJSON(CONFIG_PATH);
        if (config?.language) {
            currentLang = config.language;
        }
    }
    catch {
        // No config file yet
    }
    console.log(`\nCurrent language: ${SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name || 'English'} (${currentLang})`);
    console.log('Enter number [1-8]:');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    try {
        const answer = await new Promise((resolve) => {
            rl.question('> ', (input) => {
                resolve(input.trim());
            });
        });
        const selection = parseInt(answer);
        if (isNaN(selection) || selection < 1 || selection > 8) {
            console.error('Error: Please enter a number between 1 and 8');
            rl.close();
            return 1;
        }
        const selectedLang = SUPPORTED_LANGUAGES[selection - 1];
        try {
            const config = await readJSON(CONFIG_PATH) || {};
            config.language = selectedLang.code;
            await writeJSON(CONFIG_PATH, config);
            console.log(`\nLanguage updated to: ${selectedLang.name} (${selectedLang.code})`);
            console.log(`\nNote: Some features may require a plugin reload to take effect.`);
            rl.close();
            return 0;
        }
        catch (error) {
            const errorCode = error.code;
            if (errorCode === 'ENOENT') {
                console.error('Error: Configuration not found. Run "agent-speech init" first.');
            }
            else if (errorCode === 'EACCES') {
                console.error('Error: Permission denied. Cannot modify configuration.');
            }
            else {
                console.error('Error:', error instanceof Error ? error.message : String(error));
            }
            rl.close();
            return 1;
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        rl.close();
        return 1;
    }
}
//# sourceMappingURL=language.js.map