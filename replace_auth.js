const fs = require('fs');
const path = require('path');

const emojisToIcons = {
  '✉️': '<span class="material-symbols-outlined text-current">mail</span>',
  '🔒': '<span class="material-symbols-outlined text-current">lock</span>',
  '🔑': '<span class="material-symbols-outlined text-current">key</span>',
  '👤': '<span class="material-symbols-outlined text-current">person</span>',
  '📞': '<span class="material-symbols-outlined text-current">phone</span>',
  '🏢': '<span class="material-symbols-outlined text-current">business</span>',
  '📝': '<span class="material-symbols-outlined text-current">assignment</span>',
  '🏠': '<span class="material-symbols-outlined text-current">home</span>',
  'ℹ️': '<span class="material-symbols-outlined text-current">info</span>',
  '👁️': '<span class="material-symbols-outlined text-current">visibility</span>',
  '🙈': '<span class="material-symbols-outlined text-current">visibility_off</span>'
};

function processFile(filePath, panelClass, switchRoute) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace emojis
  for (const [emoji, icon] of Object.entries(emojisToIcons)) {
    content = content.split(emoji).join(icon);
  }

  // Make the left panel clickable
  // Looking for `<div class="${panelClass}">`
  const panelStr = `<div class="${panelClass}">`;
  const replacement = `<div class="${panelClass} cursor-pointer hover:opacity-95 transition-opacity" @click="router.push('${switchRoute}')">`;
  
  // Make sure it doesn't get replaced multiple times
  if (content.includes(panelStr) && !content.includes(`@click="router.push('${switchRoute}')"`)) {
      content = content.replace(panelStr, replacement);
  }
  
  // If there's no router imported, wait, router is imported in both because they are auth views.
  
  fs.writeFileSync(filePath, content, 'utf8');
}

const frontendSrc = path.join(__dirname, 'frontend', 'src', 'views');
const authNongDan = path.join(frontendSrc, 'AuthNongDan.vue');
const authDoanhNghiep = path.join(frontendSrc, 'AuthDoanhNghiep.vue');
const login = path.join(frontendSrc, 'Login.vue');
const register = path.join(frontendSrc, 'Register.vue');

if (fs.existsSync(authNongDan)) {
  processFile(authNongDan, 'nd-panel', '/auth/doanh-nghiep');
}
if (fs.existsSync(authDoanhNghiep)) {
  processFile(authDoanhNghiep, 'dn-panel', '/auth/nong-dan');
}
// For Login / Register, they might have emojis too
if (fs.existsSync(login)) {
  processFile(login, 'dn-panel', '/auth/nong-dan'); // If login has it
}
if (fs.existsSync(register)) {
  processFile(register, 'dn-panel', '/auth/nong-dan'); // If register has it
}

console.log("Done");
