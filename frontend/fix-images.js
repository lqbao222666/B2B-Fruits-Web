
const fs = require('fs');
const path = require('path');

const fixGetImageUrl = (file, isGetFullUrl = false) => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  if (file.includes('Home.vue')) {
    newContent = newContent.replace(
/const getImageUrl = \(path: any\) => \{\s+if \(\!path\) return ''\s+if \(typeof path !== 'string'\) return ''\s+if \(path\.startsWith\('http'\)\) return path\s+return \\$\{BACKEND_URL\}\$\{path\.startsWith\('\/'\) \? '' : '\/'\}\$\{path\}\\s+\}/,
\const getImageUrl = (path: any) => {
  if (!path) return ''
  let imgPath = typeof path === 'object' && path.url ? path.url : path;
  if (typeof imgPath !== 'string') return ''
  if (imgPath.startsWith('http')) return imgPath
  return \\\\\\\\\\\\\\\
}\
    );
  } else if (file.includes('EditPost.vue')) {
    newContent = newContent.replace(
/const getFullUrl = \(path: string\) => \{\s+if \(\!path\) return ''\s+return path\.startsWith\('http'\) \? path : \http:\/\/localhost:3000\$\{path\}\\s+\}/,
\const getFullUrl = (path: any) => {
  if (!path) return ''
  let imgPath = typeof path === 'object' && path.url ? path.url : path;
  if (typeof imgPath !== 'string') return ''
  return imgPath.startsWith('http') ? imgPath : \\\http://localhost:3000\\\\\\\\\
}\
    );
  } else if (file.includes('Products.vue') || file.includes('ManagePosts.vue')) {
    const replacement = \const getImageUrl = (images: any) => {
  if (!images) return 'https://placehold.co/300x300?text=Khong+co+anh'
  let firstImage = Array.isArray(images) && images.length > 0 ? images[0] : images;
  if (firstImage && typeof firstImage === 'object' && firstImage.url) {
    firstImage = firstImage.url;
  }
  if (typeof firstImage === 'string') {
    return firstImage.startsWith('http') ? firstImage : \\\http://localhost:3000\\\\\\\\\
  }
  return 'https://placehold.co/300x300?text=Khong+co+anh'
}\;
    
    // ManagePosts has 100x100 placeholder, Products has 300x300
    const finalReplacement = file.includes('ManagePosts.vue') ? replacement.replace(/300x300/g, '100x100') : replacement;

    const regex = /const getImageUrl = \(images: any\) => \{\s+if \(\!images\) return 'https:\/\/placehold\.co\/[^\n]+\n\s+if \(Array\.isArray\(images\) && images\.length > 0 && images\[0\] && typeof images\[0\] === 'string'\) \{\s+return images\[0\]\.startsWith\('http'\) \? images\[0\] : \http:\/\/localhost:3000\$\{images\[0\]\}\\s+\}\s+if \(typeof images === 'string'\) \{\s+return images\.startsWith\('http'\) \? images : \http:\/\/localhost:3000\$\{images\}\\s+\}\s+return 'https:\/\/placehold\.co\/[^\n]+\n\}/;
    
    newContent = newContent.replace(regex, finalReplacement);
  }
  
  fs.writeFileSync(file, newContent);
  console.log('Fixed', path.basename(file));
};

fixGetImageUrl(path.join(__dirname, 'src/views/Home.vue'));
fixGetImageUrl(path.join(__dirname, 'src/views/EditPost.vue'));
fixGetImageUrl(path.join(__dirname, 'src/views/Products.vue'));
fixGetImageUrl(path.join(__dirname, 'src/views/ManagePosts.vue'));
