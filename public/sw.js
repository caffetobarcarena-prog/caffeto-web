self.addEventListener("install",e=>{
 e.waitUntil(
  caches.open("caffeto").then(c=>c.addAll(["/","/index.html"]))
 );
});
