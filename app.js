(() => {
const canvas=document.getElementById('application-canvas');
const app=new pc.Application(canvas,{mouse:new pc.Mouse(canvas),touch:new pc.TouchDevice(canvas)});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);app.setCanvasResolution(pc.RESOLUTION_AUTO);app.start();
window.addEventListener('resize',()=>app.resizeCanvas());
app.scene.ambientLight=new pc.Color(.55,.55,.6);

const camera=new pc.Entity('Camera');camera.addComponent('camera',{clearColor:new pc.Color(.035,.055,.10),fov:58,nearClip:.05,farClip:100});camera.setPosition(0,.75,0);app.root.addChild(camera);

const light=new pc.Entity('Light');light.addComponent('light',{type:'directional',intensity:2,color:new pc.Color(1,1,1)});light.setEulerAngles(45,30,0);app.root.addChild(light);

const floor=new pc.Entity('Floor');floor.addComponent('render',{type:'plane'});floor.setLocalScale(12,1,12);floor.setPosition(0,-.5,-3);
const fm=new pc.StandardMaterial();fm.diffuse=new pc.Color(.13,.17,.25);fm.update();floor.render.material=fm;app.root.addChild(floor);

const holder=new pc.Entity('RouterHolder');holder.setPosition(0,0,-2.2);app.root.addChild(holder);
let model=null,scale=.07,currentZ=-2.2,moveT=0,moving=false;

function makePanel(){
 const e=new pc.Entity('InfoPanel');e.addComponent('element',{type:'group',width:1.6,height:.55,anchor:[.5,.5,.5,.5],pivot:[.5,.5]});
 const bg=new pc.Entity('BG');bg.addComponent('element',{type:'image',anchor:[0,0,1,1],pivot:[.5,.5],margin:[0,0,0,0],color:new pc.Color(.08,.13,.22),opacity:.94});e.addChild(bg);
 const t=new pc.Entity('Text');t.addComponent('element',{type:'text',anchor:[0,0,1,1],pivot:[.5,.5],text:'ROUTER R1\\nIP: 192.168.1.1\\nEstado: ACTIVO',fontSize:26,color:new pc.Color(1,1,1),alignment:new pc.Vec2(.5,.5),autoWidth:false,autoHeight:false});e.addChild(t);
 e.setLocalPosition(0,1.2,0);return e;
}
const panel=makePanel();holder.addChild(panel);

app.assets.loadFromUrl('./assets/router.glb','container',(err,asset)=>{
 if(err){document.getElementById('status').textContent='ERROR: no se pudo cargar router.glb';console.error(err);return}
 model=asset.resource.instantiateRenderEntity({castShadows:true});holder.addChild(model);
 model.setLocalEulerAngles(0,90,0);model.setLocalScale(scale,scale,scale);model.setLocalPosition(0,0,0);
 document.getElementById('status').textContent='Modelo cargado. Cambia los controles y analiza la experiencia.';
});

function activeGroup(selector,target){
 document.querySelectorAll(selector).forEach(b=>b.classList.toggle('active',b===target));
}
document.querySelectorAll('[data-scale]').forEach(b=>b.addEventListener('click',()=>{
 scale=+b.dataset.scale;if(model)model.setLocalScale(scale,scale,scale);activeGroup('[data-scale]',b);
 document.getElementById('status').textContent=scale>.1?'Escala exagerada: puede romper referencias espaciales.':scale<.05?'Escala pequeña: dificulta identificación y manipulación.':'Escala coherente: favorece percepción y tarea.';
}));
document.querySelectorAll('[data-z]').forEach(b=>b.addEventListener('click',()=>{
 currentZ=+b.dataset.z;holder.setPosition(0,0,currentZ);activeGroup('[data-z]',b);
 document.getElementById('status').textContent=currentZ>-1?'Muy cerca: puede resultar incómodo y difícil de enfocar.':currentZ<-4?'Muy lejos: disminuye legibilidad y detalle.':'Distancia cómoda para observación.';
}));
document.querySelectorAll('[data-pos]').forEach(b=>b.addEventListener('click',()=>{
 const p=b.dataset.pos;if(p==='center')panel.setLocalPosition(0,1.2,0);if(p==='side')panel.setLocalPosition(1.7,.9,0);if(p==='high')panel.setLocalPosition(0,2.6,0);activeGroup('[data-pos]',b);
 document.getElementById('status').textContent=p==='center'?'Panel en zona visual cómoda.':'Panel desplazado: exige mayor movimiento de cabeza/atención.';
}));
document.getElementById('comfort').addEventListener('click',()=>{
 scale=.07;currentZ=-2.2;if(model)model.setLocalScale(scale,scale,scale);holder.setPosition(0,0,currentZ);panel.setLocalPosition(0,1.2,0);
 document.querySelectorAll('[data-scale]').forEach(b=>b.classList.toggle('active',b.dataset.scale==='0.07'));
 document.querySelectorAll('[data-z]').forEach(b=>b.classList.toggle('active',b.dataset.z==='-2.2'));
 document.querySelectorAll('[data-pos]').forEach(b=>b.classList.toggle('active',b.dataset.pos==='center'));
 document.getElementById('status').textContent='Configuración cómoda aplicada: escala coherente, distancia media y panel centrado.';
});
document.getElementById('motion').addEventListener('click',()=>{moving=true;moveT=0;document.getElementById('status').textContent='Simulación de movimiento brusco: observa por qué puede resultar incómodo.'});
app.on('update',dt=>{if(moving){moveT+=dt;const x=Math.sin(moveT*22)*.28;camera.setLocalPosition(x,.75,0);if(moveT>2.2){moving=false;camera.setLocalPosition(0,.75,0);document.getElementById('status').textContent='Movimiento detenido. En VR, movimientos de cámara no controlados pueden aumentar malestar.'}}});
})();