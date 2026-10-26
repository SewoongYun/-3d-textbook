/* 사용: node build.js  →  index.html (한 파일) 생성  (Node가 없으면 build.ps1)
   index.html 은 GitHub Pages 가 첫 화면으로 여는 파일입니다. */
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const js = ['lib.js', 'lessons_1.js', 'lessons_2.js', 'lessons_3.js', 'teacher.js', 'ink.js', 'pages.js', 'book.js', 'app.js'].map(src).join('\n');
if (js.includes('</script')) throw new Error('script 안에 </script 가 있습니다');
const html = src('shell.html').replace('/*CSS*/', () => src('style.css')).replace('/*JS*/', () => js);
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html', Math.round(html.length / 1024) + ' KB');
