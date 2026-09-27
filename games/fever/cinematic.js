import * as THREE from 'three';

// A real-time shot timeline. Slow motion changes fall time, never gameplay time.
export function createCinematic({camera,banana,reduced,onImpact,onComplete}) {
  let time=0, active=false, hit=false;
  const home=new THREE.Vector3(), look=new THREE.Vector3();
  const ease=t=>t*t*(3-2*t);
  function finish(){if(!active)return;active=false;banana.position.set(0,.04,0);banana.rotation.set(0,0,0);camera.position.copy(home);camera.lookAt(0,0,-.1);document.body.classList.remove('cinematic');document.querySelector('#cinema').hidden=true;onComplete();}
  return {
    start(){time=0;hit=false;active=true;home.copy(camera.position);document.body.classList.add('cinematic');document.querySelector('#cinema').hidden=false;},
    resize(position){home.copy(position);},
    skip:finish,
    update(dt){
      if(!active)return;
      time+=dt;const duration=reduced?.35:6.4;
      if(time>=duration){finish();return;}
      if(reduced)return;
      let fall;
      if(time<1.2)fall=time/1.2*.35;
      else if(time<3.6)fall=.35+(time-1.2)/2.4*.14;
      else fall=.49+Math.min(1,(time-3.6)/.48)*.51;
      banana.position.y=.04+3.5*(1-fall*fall);
      banana.rotation.set(.10*Math.sin(time),time*.48,Math.sin(time*.8)*.2);
      const label=document.querySelector('#shot-label');
      if(time<1.2){camera.position.set(3.6,3.6,4.5);label.textContent='01 / THE DROP';}
      else if(time<3.6){const a=(time-1.2)*.23;camera.position.set(Math.sin(a)*4.7,banana.position.y+1.4,Math.cos(a)*4.7);label.textContent='02 / BAD OMEN';}
      else if(time<4.3){camera.position.set(2.7,.65,3.6);label.textContent='03 / IMPACT';}
      if(time>=4.08){
        if(!hit){hit=true;onImpact();}
        const t=time-4.08;banana.position.y=.04+Math.abs(Math.sin(t*11))*Math.exp(-t*5)*.28;banana.rotation.z=Math.sin(t*12)*Math.exp(-t*4)*.18;
      }
      look.set(0,banana.position.y+.25,0);
      if(time>=4.3){const t=ease(Math.min(1,(time-4.3)/2.1));camera.position.lerpVectors(new THREE.Vector3(2.7,.65,3.6),home,t);look.lerp(new THREE.Vector3(0,0,-.1),t);label.textContent='04 / SURVIVE THE NIGHT';}
      camera.lookAt(look);
    },
    get active(){return active;},get time(){return time;}
  };
}
