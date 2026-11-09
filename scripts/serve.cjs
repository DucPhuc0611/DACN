const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
    let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
    if(url.endsWith('/'))url+='index.html';
    const file=path.resolve(root,'.'+url);
    if(!file.startsWith(root+path.sep)||!/^\/(index\.html|(?:User|Admin|shared)\/)/.test(url)||!types[path.extname(file)]){res.writeHead(404).end();return;}
    fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});res.end(data);});
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('SSA Hotel: http://127.0.0.1:'+server.address().port));
