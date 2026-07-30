const fs = require('fs');

const files = [
  'frontend/src/views/AuthNongDan.vue',
  'frontend/src/views/AuthDoanhNghiep.vue'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // The string in the file currently looks like:
  // {{ showLoginPassword ? '<span class="material-symbols-outlined text-current">visibility_off</span>' : '<span class="material-symbols-outlined text-current">visibility</span>' }}
  
  content = content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\?\s*'<span class="material-symbols-outlined text-current">visibility_off<\/span>'\s*:\s*'<span class="material-symbols-outlined text-current">visibility<\/span>'\s*\}\}/g, 
    '<span class="material-symbols-outlined text-current">{{ $1 ? \\\'visibility_off\\\' : \\\'visibility\\\' }}</span>');

  fs.writeFileSync(f, content);
});

console.log('Fixed');
