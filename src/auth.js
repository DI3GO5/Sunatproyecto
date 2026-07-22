const crypto=require('crypto');
const SESSION_COOKIE='renta_session';
const SESSION_DAYS=7;
const normalizeEmail=value=>String(value||'').trim().toLowerCase();
const validEmail=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
function hashPassword(password){return new Promise((resolve,reject)=>{const salt=crypto.randomBytes(16).toString('hex');crypto.scrypt(password,salt,64,(err,key)=>err?reject(err):resolve(`scrypt:${salt}:${key.toString('hex')}`))})}
function verifyPassword(password,stored){return new Promise((resolve,reject)=>{const[algorithm,salt,expectedHex]=String(stored||'').split(':');if(algorithm!=='scrypt'||!salt||!expectedHex)return resolve(false);crypto.scrypt(password,salt,64,(err,key)=>{if(err)return reject(err);const expected=Buffer.from(expectedHex,'hex');resolve(expected.length===key.length&&crypto.timingSafeEqual(expected,key))})})}
const newToken=()=>crypto.randomBytes(32).toString('base64url');
const hashToken=token=>crypto.createHash('sha256').update(token).digest('hex');
function parseCookies(header=''){return Object.fromEntries(header.split(';').map(v=>v.trim()).filter(Boolean).map(v=>{const i=v.indexOf('=');return[decodeURIComponent(v.slice(0,i)),decodeURIComponent(v.slice(i+1))]}))}
function setSessionCookie(res,token){const secure=process.env.COOKIE_SECURE==='true'?'; Secure':'';res.setHeader('Set-Cookie',`${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS*86400}${secure}`)}
function clearSessionCookie(res){const secure=process.env.COOKIE_SECURE==='true'?'; Secure':'';res.setHeader('Set-Cookie',`${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`)}
module.exports={SESSION_COOKIE,SESSION_DAYS,normalizeEmail,validEmail,hashPassword,verifyPassword,newToken,hashToken,parseCookies,setSessionCookie,clearSessionCookie};