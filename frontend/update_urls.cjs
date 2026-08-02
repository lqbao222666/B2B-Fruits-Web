const fs = require('fs');

const backtickFiles = [
  'src/components/Navbar.vue',
  'src/service/auth.ts',
  'src/views/EditPost.vue',
  'src/views/ManagePosts.vue',
  'src/views/Messages.vue',
  'src/views/Order.vue',
  'src/views/Profile.vue',
  'src/views/admin/AdminLayout.vue'
];

backtickFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/http:\/\/localhost:3000/g, "${import.meta.env.VITE_API_URL || 'http://localhost:3000'}");
  fs.writeFileSync(file, content, 'utf8');
});

// api.ts
let apiTs = fs.readFileSync('src/service/api.ts', 'utf8');
apiTs = apiTs.replace(/"http:\/\/localhost:3000"/g, 'import.meta.env.VITE_API_URL || "http://localhost:3000"');
fs.writeFileSync('src/service/api.ts', apiTs, 'utf8');

// socket.ts
let socketTs = fs.readFileSync('src/service/socket.ts', 'utf8');
socketTs = socketTs.replace(/'http:\/\/localhost:3000'/g, "import.meta.env.VITE_API_URL || 'http://localhost:3000'");
fs.writeFileSync('src/service/socket.ts', socketTs, 'utf8');

// image.ts
let imageTs = fs.readFileSync('src/utils/image.ts', 'utf8');
imageTs = imageTs.replace(/'http:\/\/localhost:3000'/g, "import.meta.env.VITE_API_URL || 'http://localhost:3000'");
fs.writeFileSync('src/utils/image.ts', imageTs, 'utf8');
