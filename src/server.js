require('dotenv').config();
const express=require('express'),helmet=require('helmet'),compression=require('compression'),path=require('path');
const{calculate,UIT_2026}=require('./calculator'),db=require('./db');
const auth=require('./auth');
const app=express();
app.use(helmet({contentSecurityPolicy:false}));app.use(compression());app.use(express.json({limit:'100kb'}));app.use(express.static(path.join(__dirname,'..','public')));

async function currentUser(req){const token=auth.parseCookies(req.headers.cookie)[auth.SESSION_COOKIE];if(!token)return null;return db.findUserBySession(auth.hashToken(token))}
async function requireAuth(req,res,next){try{const user=await currentUser(req);if(!user)return res.status(401).json({error:'Debes iniciar sesión para continuar.'});req.user=user;next()}catch(e){next(e)}}
async function issueSession(res,userId){const token=auth.newToken(),expiresAt=new Date(Date.now()+auth.SESSION_DAYS*86400000);await db.createSession({userId,tokenHash:auth.hashToken(token),expiresAt});auth.setSessionCookie(res,token)}

app.get('/api/config',(_req,res)=>res.json({year:2026,uit:UIT_2026,database:Boolean(process.env.DATABASE_URL),authentication:true}));
app.post('/api/auth/register',async(req,res,next)=>{try{const fullName=String(req.body.fullName||'').trim(),email=auth.normalizeEmail(req.body.email),password=String(req.body.password||'');if(fullName.length<2)return res.status(400).json({error:'Ingresa tu nombre completo.'});if(!auth.validEmail(email))return res.status(400).json({error:'Ingresa un correo electrónico válido.'});if(password.length<8)return res.status(400).json({error:'La contraseña debe tener al menos 8 caracteres.'});const user=await db.createUser({fullName,email,passwordHash:await auth.hashPassword(password)});await issueSession(res,user.id);res.status(201).json({user})}catch(e){if(e.code==='23505')return res.status(409).json({error:'Ese correo electrónico ya está registrado.'});next(e)}});
app.post('/api/auth/login',async(req,res,next)=>{try{const email=auth.normalizeEmail(req.body.email),password=String(req.body.password||''),user=await db.findUserByEmail(email);if(!user||!await auth.verifyPassword(password,user.passwordHash))return res.status(401).json({error:'Correo o contraseña incorrectos.'});await issueSession(res,user.id);res.json({user:{id:user.id,fullName:user.fullName,email:user.email}})}catch(e){next(e)}});
app.get('/api/auth/me',async(req,res,next)=>{try{const user=await currentUser(req);if(!user)return res.status(401).json({error:'No hay una sesión activa.'});res.json({user})}catch(e){next(e)}});
app.post('/api/auth/logout',async(req,res,next)=>{try{const token=auth.parseCookies(req.headers.cookie)[auth.SESSION_COOKIE];if(token)await db.deleteSession(auth.hashToken(token));auth.clearSessionCookie(res);res.status(204).end()}catch(e){next(e)}});

app.post('/api/calculate',requireAuth,(req,res)=>{try{res.json(calculate(req.body.category,req.body.input))}catch(e){res.status(400).json({error:e.message})}});
app.post('/api/calculations',requireAuth,async(req,res,next)=>{try{const{taxpayerName,documentNumber,category,taxYear=2026,input}=req.body;if(!taxpayerName||taxpayerName.trim().length<2)return res.status(400).json({error:'Ingresa el nombre del contribuyente.'});const result=calculate(category,input);res.status(201).json(await db.save({userId:req.user.id,taxpayerName:taxpayerName.trim(),documentNumber,category:Number(category),taxYear,input,result}))}catch(e){next(e)}});
app.get('/api/calculations',requireAuth,async(req,res,next)=>{try{res.json(await db.list(req.user.id))}catch(e){next(e)}});
app.use((err,_req,res,_next)=>{console.error(err);res.status(err.status||500).json({error:err.status?err.message:'No se pudo completar la operación.'})});
const port=Number(process.env.PORT)||3000;if(require.main===module)db.initialize().then(ok=>app.listen(port,()=>console.log(`Renta Clara: http://localhost:${port} (${ok?'PostgreSQL':'sin base de datos'})`))).catch(e=>{console.error(e.message);process.exit(1)});module.exports=app;