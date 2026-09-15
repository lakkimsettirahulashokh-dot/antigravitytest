const { execSync } = require('child_process');
const path = require('path');
const tools = path.resolve(__dirname, '..', 'tools');
const py = path.join(tools, 'python', 'python.exe');
const gcc = path.join(tools, 'mingw', 'w64devkit', 'bin', 'gcc.exe');
const gpp = path.join(tools, 'mingw', 'w64devkit', 'bin', 'g++.exe');

console.log('PY:', execSync(`"${py}" -c "print('Python OK: 42')"`, { encoding: 'utf8' }).trim());
console.log('GCC:', execSync(`"${gcc}" --version`, { encoding: 'utf8' }).split('\n')[0].trim());
console.log('GPP:', execSync(`"${gpp}" --version`, { encoding: 'utf8' }).split('\n')[0].trim());
