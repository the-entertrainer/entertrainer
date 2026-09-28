import * as THREE from 'three';

export function createCinematic({camera,banana,reduced,onImpact,onComplete}) {
  let time=0, active=false, hit=false;
  const home=new THREE.Vector3(), look=new THREE.Vector3();
  const from=new THREE.Vector3(), to=new THREE.Vector3();
  const ease=t=>t*t*(3-2*t);
  function pose(t){
    if(t<1.1){
      const u=ease(t/1.1);
      from.set(4.1,4.2,4.8); to.set(3.2,3.2,4.2);
      camera.position.lerpVectors(from,to,u);
    }else if(t<3.2){
      const a=(t-1.1)*0.55;
      camera.position.set(Math.sin(a)*4.4, banana.position.y+1.25, Math.cos(a)*4.4);
    }else if(t<3.9){
      const u=ease((t-3.2)/0.7);
      from.set(Math.sin(2.1*0.55)*4.4, banana.position.y+1.25, Math.cos(2.1*0.55)*4.4);
      to.set(2.5,0.7,3.3);
      camera.position.lerpVectors(from,to,u);
    }else{
      const u=ease(Math.min(1,(t-3.9)/1.4));
      camera.position.lerpVectors(new THREE.Vector3(2.5,0.7,3.3), home, u);
    }
  }
  function finish(){if(!active)return;active=false;banana.position.set(0,.04,0);banana.rotation.set(0,0,0);camera.position.copy(home);camera.lookAt(0,0,-.1);document.body.classList.remove('cinematic');document.querySelector('#cinema').hidden=true;onComplete();}
  return {
    start(){time=0;hit=false;active=true;home.copy(camera.position);document.body.classList.add('cinematic');document.querySelector('#cinema').hidden=false;},
    resize(position){home.copy(position);},
    skip:finish,
    update(dt){
      if(!active)return;
      time+=dt;const duration=reduced?.35:5.3;
      if(time>=duration){finish();return;}
      if(reduced)return;
      let fall;
      if(time<1.1)fall=time/1.1*.32;
      else if(time<3.2)fall=.32+(time-1.1)/2.1*.16;
      else fall=.48+Math.min(1,(time-3.2)/.42)*.52;
      banana.position.y=.04+3.4*(1-fall*fall);
      banana.rotation.set(.08*Math.sin(time),time*.42,Math.sin(time*.7)*.16);
      if(time>=3.55){
        if(!hit){hit=true;onImpact();}
        const t=time-3.55;banana.position.y=.04+Math.abs(Math.sin(t*11))*Math.exp(-t*5)*.26;banana.rotation.z=Math.sin(t*12)*Math.exp(-t*4)*.16;
      }
      pose(time);
      look.set(0,banana.position.y+.22,0);
      if(time>=3.9) look.lerp(new THREE.Vector3(0,0,-.1), ease(Math.min(1,(time-3.9)/1.4)));
      camera.lookAt(look);
    },
    get active(){return active;},get time(){return time;}
  };
}
