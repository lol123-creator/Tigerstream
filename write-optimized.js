const fs=require('fs');const path=require('path');
const COMP_DIR = 'C:\Users\clare\Tigerstream\src\components';
function w(name,content){fs.writeFileSync(path.join(COMP_DIR,name),content,'utf8');console.log('Wrote '+name);}
