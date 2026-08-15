import { chromium } from 'playwright-core'
const OUT='/tmp/claude-0/-home-user-entertrainer/4fa45bf8-958c-5f57-bd54-f20b962b076a/scratchpad/shots'
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'})
const errs=[]
for (const [route,name,w,h,full] of [
  ['/', 'r-home', 1440, 1000, false],
  ['/', 'r-home-full', 1440, 1000, true],
  ['/tools', 'r-tools', 1440, 1000, false],
  ['/instructional-design', 'r-id', 1440, 1100, false],
  ['/', 'r-home-m', 400, 880, false]
]) {
  const p=await b.newPage({viewport:{width:w,height:h}})
  p.on('pageerror',e=>errs.push(route+': '+e.message))
  await p.goto('http://localhost:3000'+route,{waitUntil:'networkidle',timeout:60000})
  if (full) await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}window.scrollTo(0,0)})
  await p.waitForTimeout(1400)
  await p.screenshot({path:`${OUT}/${name}.png`, fullPage: full})
  await p.close()
}
await b.close()
console.log(errs.length?errs.join('\n'):'no page errors')
